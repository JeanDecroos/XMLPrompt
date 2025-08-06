/**
 * Logging Utility
 * Winston-based logging with multiple transports and formatting
 */

import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { config } from '../config/index.js'
import fs from 'fs'
import path from 'path'

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.file)
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`
    
    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`
    }
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`
    }
    
    return log
  })
)

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Create transports array
const transports = []

// Console transport (always enabled in development)
if (config.env === 'development') {
  transports.push(
    new winston.transports.Console({
      level: config.logging.level,
      format: consoleFormat,
      handleExceptions: true,
      handleRejections: true
    })
  )
}

// File transport with rotation
transports.push(
  new DailyRotateFile({
    filename: config.logging.file.replace('.log', '-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    level: config.logging.level,
    format: fileFormat,
    handleExceptions: true,
    handleRejections: true
  })
)

// Error-specific file transport
transports.push(
  new DailyRotateFile({
    filename: config.logging.file.replace('.log', '-error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: config.logging.maxSize,
    maxFiles: config.logging.maxFiles,
    level: 'error',
    format: fileFormat,
    handleExceptions: true,
    handleRejections: true
  })
)

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: fileFormat,
  defaultMeta: {
    service: 'promptr-backend',
    environment: config.env,
    version: config.app.version
  },
  transports,
  exitOnError: false
})

// Add production console logging with JSON format
if (config.env === 'production') {
  logger.add(
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      handleExceptions: true,
      handleRejections: true
    })
  )
}

// Enhanced logging methods with context
const enhancedLogger = {
  // Include all winston logger methods
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  info: logger.info.bind(logger),
  debug: logger.debug.bind(logger),
  verbose: logger.verbose.bind(logger),
  silly: logger.silly.bind(logger),
  log: logger.log.bind(logger),
  
  // Include other winston properties and methods
  level: logger.level,
  levels: logger.levels,
  transports: logger.transports,
  format: logger.format,
  add: logger.add.bind(logger),
  remove: logger.remove.bind(logger),
  clear: logger.clear.bind(logger),
  profile: logger.profile.bind(logger),
  startTimer: logger.startTimer.bind(logger),
  
  // Stream for Morgan HTTP logging
  stream: {
    write: (message) => {
      logger.info(message.trim())
    }
  },
  
  /**
   * Log with request context
   */
  withContext(context) {
    return {
      error: (message, meta = {}) => logger.error(message, { ...meta, context }),
      warn: (message, meta = {}) => logger.warn(message, { ...meta, context }),
      info: (message, meta = {}) => logger.info(message, { ...meta, context }),
      debug: (message, meta = {}) => logger.debug(message, { ...meta, context }),
      verbose: (message, meta = {}) => logger.verbose(message, { ...meta, context })
    }
  },

  /**
   * Log API request
   */
  logRequest(req, res, responseTime) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id || null,
      requestId: req.id
    }

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData)
    } else {
      logger.info('HTTP Request', logData)
    }
  },

  /**
   * Log API error
   */
  logError(error, req = null, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      status: error.status || error.statusCode,
      ...context
    }

    if (req) {
      errorData.request = {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
        userId: req.user?.id || null,
        requestId: req.id
      }
    }

    logger.error('Application Error', errorData)
  },

  /**
   * Log database operation
   */
  logDatabase(operation, table, result, duration, context = {}) {
    const logData = {
      operation,
      table,
      duration: `${duration}ms`,
      success: !result.error,
      recordCount: result.data?.length || (result.data ? 1 : 0),
      ...context
    }

    if (result.error) {
      logData.error = {
        message: result.error.message,
        code: result.error.code,
        details: result.error.details
      }
      logger.error('Database Operation Failed', logData)
    } else {
      logger.debug('Database Operation', logData)
    }
  },

  /**
   * Log AI service call
   */
  logAIService(service, model, operation, result, duration, context = {}) {
    const logData = {
      service,
      model,
      operation,
      duration: `${duration}ms`,
      success: !result.error,
      tokensUsed: result.usage?.total_tokens || 0,
      ...context
    }

    if (result.error) {
      logData.error = {
        message: result.error.message,
        type: result.error.type,
        code: result.error.code
      }
      logger.error('AI Service Call Failed', logData)
    } else {
      logger.info('AI Service Call', logData)
    }
  },

  /**
   * Log job execution
   */
  logJob(jobType, jobId, status, duration, result = {}, context = {}) {
    const logData = {
      jobType,
      jobId,
      status,
      duration: duration ? `${duration}ms` : null,
      ...context
    }

    if (result.error) {
      logData.error = {
        message: result.error.message,
        stack: result.error.stack
      }
      logger.error('Job Failed', logData)
    } else if (status === 'completed') {
      logData.result = result
      logger.info('Job Completed', logData)
    } else {
      logger.info('Job Status', logData)
    }
  },

  /**
   * Log security event
   */
  logSecurity(event, severity, details, req = null) {
    const logData = {
      securityEvent: event,
      severity,
      timestamp: new Date().toISOString(),
      ...details
    }

    if (req) {
      logData.request = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.id || null,
        requestId: req.id
      }
    }

    if (severity === 'critical' || severity === 'high') {
      logger.error('Security Event', logData)
    } else {
      logger.warn('Security Event', logData)
    }
  },

  /**
   * Log performance metric
   */
  logPerformance(metric, value, unit = 'ms', context = {}) {
    logger.info('Performance Metric', {
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
      ...context
    })
  },

  /**
   * Log business event
   */
  logBusiness(event, data, userId = null) {
    logger.info('Business Event', {
      event,
      userId,
      timestamp: new Date().toISOString(),
      data
    })
  }
}

// Handle uncaught exceptions and rejections
logger.on('error', (error) => {
  console.error('Logger error:', error)
})

// Log startup
logger.info('Logger initialized', {
  level: config.logging.level,
  transports: transports.length,
  environment: config.env
})

export { enhancedLogger as logger }
export default enhancedLogger 