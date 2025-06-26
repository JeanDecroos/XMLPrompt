/**
 * Error Handling Middleware
 * Centralized error handling with proper logging and response formatting
 */

import { StatusCodes } from 'http-status-codes'
import { logger } from '../utils/logger.js'
import { config } from '../config/index.js'

/**
 * Custom error classes
 */
export class AppError extends Error {
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, code = null) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    this.details = details
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, StatusCodes.UNAUTHORIZED, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, StatusCodes.FORBIDDEN, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND, 'NOT_FOUND_ERROR')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, StatusCodes.CONFLICT, 'CONFLICT_ERROR')
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfter = null) {
    super(message, StatusCodes.TOO_MANY_REQUESTS, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

export class ExternalServiceError extends AppError {
  constructor(service, message = 'External service error') {
    super(message, StatusCodes.BAD_GATEWAY, 'EXTERNAL_SERVICE_ERROR')
    this.name = 'ExternalServiceError'
    this.service = service
  }
}

/**
 * Error response formatter
 */
function formatErrorResponse(error, req) {
  const isDevelopment = config.env === 'development'
  const isOperational = error.isOperational || false

  // Base error response
  const errorResponse = {
    error: true,
    message: error.message,
    code: error.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    requestId: req.id
  }

  // Add status code
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR

  // Add additional details for specific error types
  if (error instanceof ValidationError && error.details) {
    errorResponse.details = error.details
  }

  if (error instanceof RateLimitError && error.retryAfter) {
    errorResponse.retryAfter = error.retryAfter
  }

  if (error instanceof ExternalServiceError && error.service) {
    errorResponse.service = error.service
  }

  // Add development-only information
  if (isDevelopment) {
    errorResponse.stack = error.stack
    errorResponse.isOperational = isOperational
  }

  // Add help information for common errors
  if (statusCode === StatusCodes.UNAUTHORIZED) {
    errorResponse.help = 'Please provide a valid authentication token'
  } else if (statusCode === StatusCodes.FORBIDDEN) {
    errorResponse.help = 'You do not have permission to access this resource'
  } else if (statusCode === StatusCodes.NOT_FOUND) {
    errorResponse.help = 'The requested resource was not found'
  } else if (statusCode === StatusCodes.TOO_MANY_REQUESTS) {
    errorResponse.help = 'You have exceeded the rate limit. Please try again later'
  }

  return { errorResponse, statusCode }
}

/**
 * Handle Supabase errors
 */
function handleSupabaseError(error) {
  const { code, message, details } = error

  switch (code) {
    case 'PGRST116':
      return new NotFoundError('Resource not found')
    case 'PGRST301':
      return new ValidationError('Invalid request parameters', details)
    case '23505':
      return new ConflictError('Resource already exists')
    case '23503':
      return new ValidationError('Referenced resource not found')
    case '42501':
      return new AuthorizationError('Insufficient database permissions')
    default:
      return new AppError(`Database error: ${message}`, StatusCodes.INTERNAL_SERVER_ERROR, code)
  }
}

/**
 * Handle JWT errors
 */
function handleJWTError(error) {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid authentication token')
  }
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Authentication token has expired')
  }
  if (error.name === 'NotBeforeError') {
    return new AuthenticationError('Authentication token not active')
  }
  return new AuthenticationError('Authentication failed')
}

/**
 * Handle validation errors
 */
function handleValidationError(error) {
  if (error.details) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.value
    }))
    return new ValidationError('Validation failed', details)
  }
  return new ValidationError(error.message)
}

/**
 * Handle external service errors
 */
function handleExternalServiceError(error) {
  // OpenAI errors
  if (error.type === 'openai_error') {
    return new ExternalServiceError('OpenAI', `OpenAI API error: ${error.message}`)
  }

  // Anthropic errors
  if (error.type === 'anthropic_error') {
    return new ExternalServiceError('Anthropic', `Anthropic API error: ${error.message}`)
  }

  // Stripe errors
  if (error.type && error.type.startsWith('stripe')) {
    return new ExternalServiceError('Stripe', `Payment error: ${error.message}`)
  }

  // Generic external service error
  return new ExternalServiceError('Unknown', error.message)
}

/**
 * Main error handler middleware
 */
export const errorHandler = (error, req, res, next) => {
  let processedError = error

  // Handle different types of errors
  if (error.code && typeof error.code === 'string') {
    // Supabase/PostgreSQL errors
    if (error.code.startsWith('PGRST') || error.code.match(/^\d{5}$/)) {
      processedError = handleSupabaseError(error)
    }
  } else if (error.name && error.name.includes('JsonWebToken')) {
    // JWT errors
    processedError = handleJWTError(error)
  } else if (error.name === 'ValidationError') {
    // Joi validation errors
    processedError = handleValidationError(error)
  } else if (error.type && (error.type.includes('openai') || error.type.includes('anthropic') || error.type.includes('stripe'))) {
    // External service errors
    processedError = handleExternalServiceError(error)
  } else if (!error.isOperational) {
    // Unexpected errors
    processedError = new AppError(
      config.env === 'production' ? 'Something went wrong' : error.message,
      StatusCodes.INTERNAL_SERVER_ERROR
    )
  }

  // Format error response
  const { errorResponse, statusCode } = formatErrorResponse(processedError, req)

  // Log error
  logger.logError(processedError, req, {
    statusCode,
    isOperational: processedError.isOperational || false
  })

  // Send error response
  res.status(statusCode).json(errorResponse)
}

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`)
  next(error)
}

/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Create standardized error response
   */
  createErrorResponse(message, code, statusCode = StatusCodes.BAD_REQUEST, details = null) {
    return {
      error: true,
      message,
      code,
      details,
      timestamp: new Date().toISOString()
    }
  },

  /**
   * Handle promise rejections
   */
  handlePromiseRejection(promise, fallbackValue = null) {
    return promise.catch(error => {
      logger.error('Promise rejection handled:', error)
      return fallbackValue
    })
  },

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation(operation, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        if (attempt === maxRetries) {
          throw error
        }

        const delay = baseDelay * Math.pow(2, attempt - 1)
        logger.warn(`Operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms:`, error.message)
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  },

  /**
   * Safe JSON parse
   */
  safeJsonParse(jsonString, fallback = null) {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      logger.warn('JSON parse error:', error.message)
      return fallback
    }
  },

  /**
   * Validate required fields
   */
  validateRequiredFields(data, requiredFields) {
    const missing = requiredFields.filter(field => {
      const value = data[field]
      return value === undefined || value === null || value === ''
    })

    if (missing.length > 0) {
      throw new ValidationError(`Missing required fields: ${missing.join(', ')}`)
    }
  },

  /**
   * Check if error is operational
   */
  isOperationalError(error) {
    return error instanceof AppError && error.isOperational
  }
}

export default errorHandler 