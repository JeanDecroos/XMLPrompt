/**
 * XMLPrompter Backend API Server
 * Production-ready Express.js server with comprehensive middleware
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import 'express-async-errors'

// Internal imports
import { config } from './config/index.js'
import { logger } from './utils/logger.js'
import { database } from './config/database.js'
import { redis } from './config/redis.js'
import { errorHandler } from './middleware/errorHandler.js'
import { authMiddleware } from './middleware/auth.js'
import { rateLimitMiddleware } from './middleware/rateLimit.js'
import { analyticsMiddleware } from './middleware/analytics.js'
import { validationMiddleware } from './middleware/validation.js'

// Route imports
import healthRoutes from './routes/health.js'
import authRoutes from './routes/auth.js'
import promptRoutes from './routes/prompts.js'
import enrichmentRoutes from './routes/enrichment.js'
import sharingRoutes from './routes/sharing.js'
import analyticsRoutes from './routes/analytics.js'
import userRoutes from './routes/users.js'
import apiKeyRoutes from './routes/apiKeys.js'
import adminRoutes from './routes/admin.js'
import webhookRoutes from './routes/webhooks.js'
import quotaRoutes from './routes/quota.js'

// Job queue imports
import { initializeJobQueues, stopJobQueues } from './jobs/index.js'
import { startScheduledJobs } from './jobs/scheduler.js'

const app = express()

// Server configuration
const PORT = process.env.PORT || 3002
const HOST = process.env.HOST || 'localhost'

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Basic security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://api.anthropic.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: [
    'X-Quota-Tier',
    'X-Quota-Monthly-Prompts-Remaining',
    'X-Quota-Monthly-Enrichments-Remaining',
    'X-Quota-Hourly-Remaining',
    'X-Quota-Reset-Monthly',
    'X-Quota-Exceeded',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset'
  ]
}))

// ============================================================================
// BASIC MIDDLEWARE
// ============================================================================

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression
app.use(compression())

// Request logging
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }))
}

// Analytics middleware (tracks all requests)
app.use(analyticsMiddleware)

// ============================================================================
// RATE LIMITING
// ============================================================================

// Global rate limiting
const globalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
    retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health'
  }
})

app.use(globalRateLimit)

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests per windowMs without delay
  delayMs: () => 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  validate: { delayMs: false } // Disable warning
})

app.use(speedLimiter)

// ============================================================================
// CUSTOM MIDDLEWARE
// ============================================================================

// Custom rate limiting (database-backed)
app.use(rateLimitMiddleware)

// ============================================================================
// ROUTES
// ============================================================================

// Health check (no auth required)
app.use('/health', healthRoutes)

// API routes with versioning
const apiRouter = express.Router()

// Public routes (no auth required)
apiRouter.use('/auth', authRoutes)
apiRouter.use('/webhooks', webhookRoutes)

// Protected routes (auth required)
apiRouter.use('/prompts', authMiddleware, promptRoutes)
apiRouter.use('/enrichment', authMiddleware, enrichmentRoutes)
apiRouter.use('/sharing', sharingRoutes) // Some endpoints public, some protected
apiRouter.use('/analytics', authMiddleware, analyticsRoutes)
apiRouter.use('/users', authMiddleware, userRoutes)
apiRouter.use('/api-keys', authMiddleware, apiKeyRoutes)
apiRouter.use('/quota', quotaRoutes) // Quota routes with auth middleware applied internally
apiRouter.use('/admin', authMiddleware, adminRoutes)

// Mount API routes
app.use(`/api/${config.app.apiVersion}`, apiRouter)

// ============================================================================
// API DOCUMENTATION
// ============================================================================

// Temporarily disabled to fix import issues
// if (config.features.enableApiDocs && config.env === 'development') {
//   const swaggerUi = await import('swagger-ui-express')
//   const swaggerDocument = await import('./docs/swagger.json', {
//     with: { type: 'json' }
//   })
//   
//   app.use('/api-docs', swaggerUi.default.serve, swaggerUi.default.setup(swaggerDocument.default))
//   logger.info('API documentation available at /api-docs')
// }

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      health: '/health',
      api: `/api/${config.app.apiVersion}`,
      docs: config.features.enableApiDocs ? '/api-docs' : null
    }
  })
})

// Global error handler
app.use(errorHandler)

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    logger.info('Testing database connection...')
    try {
      const { data, error } = await database.supabase
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (error) {
        logger.warn('Database connection test returned an error (continuing anyway):', error)
      } else {
        logger.info('Supabase connection established successfully')
      }
    } catch (dbError) {
      logger.warn('Database connection test failed (continuing anyway):', dbError.message)
    }
    
    logger.info('Database connection established')

    // Initialize Redis
    logger.info('Initializing Redis connection...')
    await redis.connect()
    logger.info('Redis connection established')

    // Initialize job queues
    logger.info('Initializing job queues...')
    await initializeJobQueues()
    logger.info('Job queues initialized')

    // Start scheduled jobs
    logger.info('Starting scheduled jobs...')
    startScheduledJobs()
    logger.info('Scheduled jobs started')

    // Start the server
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info('🚀 XMLPrompter Backend API started')
      logger.info(`📍 Server running on http://${config.server.host}:${config.server.port}`)
      logger.info(`🌍 Environment: ${config.env}`)
      
      if (config.features.enableApiDocs && config.env === 'development') {
        logger.info(`📚 API Documentation: http://${config.server.host}:${config.server.port}/api-docs`)
      }
      
      logger.info('🔧 Development features enabled:')
      logger.info(`   - API Documentation: ${config.features.enableApiDocs}`)
      logger.info(`   - Debug Routes: ${config.features.enableDebugRoutes}`)
      logger.info(`   - Playground: ${config.features.enablePlayground}`)
    })

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      logger.info(`Received ${signal}. Graceful shutdown starting...`)
      
      server.close(async () => {
        logger.info('HTTP server closed')
        
        try {
          await stopJobQueues()
          logger.info('Job queues stopped')
        } catch (error) {
          logger.error('Error stopping job queues:', error)
        }

        try {
          await redis.disconnect()
          logger.info('Redis connection closed')
        } catch (error) {
          logger.error('Error closing Redis connection:', error)
        }

        logger.info('Graceful shutdown completed')
        process.exit(0)
      })

      // Force exit after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout')
        process.exit(1)
      }, 30000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    return server
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
}

export { app, startServer } 