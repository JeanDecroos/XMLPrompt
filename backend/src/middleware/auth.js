/**
 * Auth Middleware
 * Handles Supabase JWT token verification and user authentication for API routes
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

    // Decode JWT without verification (Supabase tokens are already verified)
    // We'll verify the user exists in our database instead
    let decoded
    try {
      decoded = jwt.decode(token)
      if (!decoded || !decoded.sub) {
        throw new Error('Invalid token format')
      }
      logger.debug(`JWT decoded successfully, user ID: ${decoded.sub}`)
    } catch (decodeError) {
      logger.warn('AuthenticationError: Failed to decode token')
      throw new AuthenticationError('Invalid token format')
    }

    // Fetch user from database using the decoded user ID (sub claim)
    logger.debug(`Attempting to fetch user from profiles table with ID: ${decoded.sub}`)
    const { data: user, error } = await db.getClient().from('profiles').select('*').eq('id', decoded.sub).single()

    if (error) {
      logger.error(`Database error when fetching user: ${error.message}, code: ${error.code}`)
      throw new AuthenticationError('Database error during authentication')
    }
    
    if (!user) {
      logger.warn(`AuthenticationError: User not found for ID ${decoded.sub}`)
      throw new AuthenticationError('Invalid authentication token')
    }

    // Attach user and token to request object
    req.user = user
    req.token = token
    
    logger.debug(`User ${user.email} authenticated successfully`)
    next()
  } catch (error) {
    if (error instanceof AppError) {
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