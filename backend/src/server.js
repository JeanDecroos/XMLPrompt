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

// Job queue imports
import { initializeJobQueues, stopJobQueues } from './jobs/index.js'
import { startScheduledJobs } from './jobs/scheduler.js'

const app = express()

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
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = config.cors.origin.split(',')
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining']
}

app.use(cors(corsOptions))

// ============================================================================
// GENERAL MIDDLEWARE
// ============================================================================

// Request parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Compression
app.use(compression())

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}))

// Request ID for tracing
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substring(2, 15)
  res.setHeader('X-Request-ID', req.id)
  next()
})

// Request timeout
app.use((req, res, next) => {
  req.setTimeout(config.server.requestTimeout, () => {
    const error = new Error('Request timeout')
    error.status = 408
    next(error)
  })
  next()
})

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
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
})

app.use(speedLimiter)

// ============================================================================
// CUSTOM MIDDLEWARE
// ============================================================================

// Analytics tracking
app.use(analyticsMiddleware)

// Custom rate limiting (database-backed)
app.use(rateLimitMiddleware)

// ============================================================================
// ROUTES
// ============================================================================

// Health check (no auth required)
app.use('/health', healthRoutes)

// Authentication routes
app.use('/api/v1/auth', authRoutes)

// Webhook routes (special handling, no auth)
app.use('/api/v1/webhooks', webhookRoutes)

// API routes (require authentication)
app.use('/api/v1/prompts', authMiddleware, promptRoutes)
app.use('/api/v1/enrichment', authMiddleware, enrichmentRoutes)
app.use('/api/v1/sharing', sharingRoutes) // Some routes public, some auth
app.use('/api/v1/analytics', authMiddleware, analyticsRoutes)
app.use('/api/v1/users', authMiddleware, userRoutes)
app.use('/api/v1/api-keys', authMiddleware, apiKeyRoutes)

// Admin routes (require admin privileges)
app.use('/api/v1/admin', authMiddleware, adminRoutes)

// API documentation (development only)
if (config.features.enableApiDocs && config.env === 'development') {
  const swaggerUi = await import('swagger-ui-express')
  const swaggerDocument = await import('./docs/swagger.json', { with: { type: 'json' } })
  
  app.use('/api-docs', swaggerUi.default.serve, swaggerUi.default.setup(swaggerDocument.default))
}

// Catch-all route for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: [
      'GET /health',
      'POST /api/v1/auth/login',
      'GET /api/v1/prompts',
      'POST /api/v1/enrichment/enhance',
      'GET /api-docs (development only)'
    ]
  })
})

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'XMLPrompter Backend API',
    version: config.app.version,
    environment: config.env,
    status: 'operational',
    timestamp: new Date().toISOString(),
    documentation: config.features.enableApiDocs ? '/api-docs' : 'Not available in production',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth',
      prompts: '/api/v1/prompts',
      enrichment: '/api/v1/enrichment',
      sharing: '/api/v1/sharing'
    }
  })
})

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  })
})

// Global error handler
app.use(errorHandler)

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

async function startServer() {
  try {
    // Initialize database connection
    await database.initialize()
    logger.info('Database connection established')

    // Initialize Redis connection
    await redis.initialize()
    logger.info('Redis connection established')

    // Initialize job queues
    await initializeJobQueues()
    logger.info('Job queues initialized')

    // Start scheduled jobs
    startScheduledJobs()
    logger.info('Scheduled jobs started')

    // Start the server
    const server = app.listen(config.server.port, config.server.host, () => {
      logger.info(`🚀 XMLPrompter Backend API started`)
      logger.info(`📍 Server running on http://${config.server.host}:${config.server.port}`)
      logger.info(`🌍 Environment: ${config.env}`)
      logger.info(`📚 API Documentation: ${config.features.enableApiDocs ? `http://${config.server.host}:${config.server.port}/api-docs` : 'Disabled'}`)
      
      if (config.env === 'development') {
        logger.info(`🔧 Development features enabled:`)
        logger.info(`   - API Documentation: ${config.features.enableApiDocs}`)
        logger.info(`   - Debug Routes: ${config.features.enableDebugRoutes}`)
        logger.info(`   - Playground: ${config.features.enablePlayground}`)
      }
    })

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, starting graceful shutdown...`)
      
      server.close(async () => {
        try {
          // Close database connections
          await database.close()
          logger.info('Database connections closed')

          // Close Redis connections
          await redis.close()
          logger.info('Redis connections closed')

          // Stop job queues
          await stopJobQueues()
          logger.info('Job queues stopped')

          logger.info('Graceful shutdown completed')
          process.exit(0)
        } catch (error) {
          logger.error('Error during graceful shutdown:', error)
          process.exit(1)
        }
      })

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout')
        process.exit(1)
      }, 30000)
    }

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error)
      gracefulShutdown('UNCAUGHT_EXCEPTION')
    })

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
      gracefulShutdown('UNHANDLED_REJECTION')
    })

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()

export default app 