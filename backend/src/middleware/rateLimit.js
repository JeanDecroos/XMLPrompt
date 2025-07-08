/**
 * Rate Limit Middleware
 * Handles database-backed rate limiting for API requests
 */

import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { db } from '../config/database.js'
import { AppError, RateLimitError } from './errorHandler.js'

export const rateLimitMiddleware = async (req, res, next) => {
  if (!config.features.enableRateLimiting) {
    return next();
  }

  const identifier = req.user?.id || req.ip; // Use user ID if authenticated, else IP
  const identifierType = req.user ? 'user' : 'ip';
  const endpoint = req.path;
  const windowMs = config.rateLimit.windowMs; // e.g., 900000 (15 minutes)
  const maxRequests = config.rateLimit.maxRequests; // e.g., 100

  try {
    // Get or create rate limit entry
    let { data: rateLimitEntry, error } = await db
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('identifier_type', identifierType)
      .eq('endpoint', endpoint)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      logger.error('Database error in rateLimitMiddleware:', error);
      return next(new AppError('Rate limit service unavailable', 500));
    }

    if (!rateLimitEntry) {
      // Create new entry if not found or expired
      const { data: newEntry, error: insertError } = await db
        .from('rate_limits')
        .insert({
          identifier,
          identifier_type: identifierType,
          endpoint,
          request_count: 1,
          window_start: new Date(Date.now() - (Date.now() % windowMs)), // Align to window start
          window_duration_seconds: windowMs / 1000,
        })
        .select('*')
        .single();

      if (insertError) {
        logger.error('Error inserting rate limit entry:', insertError);
        return next(new AppError('Rate limit service unavailable', 500));
      }
      rateLimitEntry = newEntry;
    } else {
      // Check if current window has expired
      const windowStartTime = new Date(rateLimitEntry.window_start).getTime();
      const currentTime = Date.now();

      if (currentTime - windowStartTime > windowMs) {
        // Reset window if expired
        const { data: updatedEntry, error: updateError } = await db
          .from('rate_limits')
          .update({
            request_count: 1,
            window_start: new Date(currentTime - (currentTime % windowMs)),
            updated_at: new Date().toISOString()
          })
          .eq('id', rateLimitEntry.id)
          .select('*')
          .single();

        if (updateError) {
          logger.error('Error updating expired rate limit entry:', updateError);
          return next(new AppError('Rate limit service unavailable', 500));
        }
        rateLimitEntry = updatedEntry;
      } else {
        // Increment count within current window
        const { data: updatedEntry, error: updateError } = await db
          .from('rate_limits')
          .update({
            request_count: rateLimitEntry.request_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', rateLimitEntry.id)
          .select('*')
          .single();

        if (updateError) {
          logger.error('Error incrementing rate limit count:', updateError);
          return next(new AppError('Rate limit service unavailable', 500));
        }
        rateLimitEntry = updatedEntry;
      }
    }

    // Check if limit exceeded
    if (rateLimitEntry.request_count > maxRequests) {
      const retryAfterSeconds = Math.ceil((windowMs - (Date.now() - new Date(rateLimitEntry.window_start).getTime())) / 1000);
      logger.warn(`RateLimitError: Too many requests for identifier ${identifier} on ${endpoint}`);
      res.setHeader('Retry-After', retryAfterSeconds);
      throw new RateLimitError('Too many requests, please try again later.', retryAfterSeconds);
    }

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - rateLimitEntry.request_count));
    res.setHeader('X-RateLimit-Reset', new Date(new Date(rateLimitEntry.window_start).getTime() + windowMs).toISOString());

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.error('Unexpected error in rateLimitMiddleware:', error);
      next(new AppError('Internal server error', 500));
    }
  }
}; 