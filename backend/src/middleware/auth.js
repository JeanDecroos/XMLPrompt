/**
 * Auth Middleware
 * Handles JWT verification and user authentication for API routes
 */

import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { db } from '../config/database.js'
import { AppError, AuthenticationError } from './errorHandler.js'

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('AuthenticationError: No token provided or invalid format')
      throw new AuthenticationError('Authentication token required')
    }

    const token = authHeader.split(' ')[1]

    // Verify JWT
    const decoded = jwt.verify(token, config.auth.jwtSecret)
    
    // Fetch user from database using the decoded user ID
    const { data: user, error } = await db.getClient().from('profiles').select('*').eq('id', decoded.id).single()

    if (error || !user) {
      logger.warn(`AuthenticationError: User not found for ID ${decoded.id} or DB error: ${error?.message}`)
      throw new AuthenticationError('Invalid authentication token')
    }

    // Attach user and token to request object
    req.user = user
    req.token = token
    
    logger.debug(`User ${user.email} authenticated successfully`)
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      logger.warn(`AuthenticationError: JWT error - ${error.message}`)
      next(new AuthenticationError('Invalid or expired token'))
    } else if (error instanceof AppError) {
      next(error)
    } else {
      logger.error('AuthMiddleware Unexpected Error:', error)
      next(new AppError('Authentication failed', 500))
    }
  }
}

// Middleware to check for admin role
export const adminAuthMiddleware = (req, res, next) => {
  if (!req.user || req.user.subscription_tier !== 'enterprise') {
    logger.warn(`AuthorizationError: User ${req.user?.email} attempted admin access without privilege.`)
    throw new AuthenticationError('Administrator access required')
  }
  next()
}; 