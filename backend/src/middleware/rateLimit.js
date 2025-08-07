/**
 * Rate Limit Middleware
 * Handles Redis-backed rate limiting for API requests
 */

import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { redis } from '../config/redis.js'
import { AppError, RateLimitError } from './errorHandler.js'

// Redis store for rate limiting
const RedisStore = {
  client: redis,
  prefix: 'rate_limit:',
  
  async get(key) {
    try {
      const value = await this.client.get(this.prefix + key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  },
  
  async set(key, value, ttl) {
    try {
      await this.client.setex(this.prefix + key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error('Redis set error:', error);
    }
  },
  
  async del(key) {
    try {
      await this.client.del(this.prefix + key);
    } catch (error) {
      logger.error('Redis del error:', error);
    }
  }
};

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: config.rateLimit.windowMs || 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit.maxRequests || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: true,
    message: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: RedisStore,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/health' || req.path.startsWith('/static/');
  },
  onLimitReached: (req, res) => {
    logger.warn(`Rate limit exceeded for ${req.user?.id || req.ip} on ${req.path}`);
  }
};

// Speed limiting configuration
const speedLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes, then...
  delayMs: 500, // Begin adding 500ms of delay per request above 50
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  store: RedisStore,
  keyGenerator: (req) => {
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    return req.path === '/health' || req.path.startsWith('/static/');
  }
};

// Create rate limiting middleware
export const rateLimitMiddleware = rateLimit(rateLimitConfig);

// Create speed limiting middleware
export const speedLimitMiddleware = slowDown(speedLimitConfig);

// Combined middleware for both rate and speed limiting
export const combinedLimitMiddleware = (req, res, next) => {
  if (!config.features.enableRateLimiting) {
    return next();
  }
  
  // Apply speed limiting first, then rate limiting
  speedLimitMiddleware(req, res, (err) => {
    if (err) return next(err);
    rateLimitMiddleware(req, res, next);
  });
};

// Legacy middleware for backward compatibility
export const legacyRateLimitMiddleware = async (req, res, next) => {
  if (!config.features.enableRateLimiting) {
    return next();
  }

  const identifier = req.user?.id || req.ip;
  const endpoint = req.path;
  const windowMs = config.rateLimit.windowMs || 15 * 60 * 1000;
  const maxRequests = config.rateLimit.maxRequests || 100;

  try {
    const key = `rate_limit:${identifier}:${endpoint}`;
    const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
    
    // Get current count from Redis
    const currentCount = await redis.get(key);
    const count = currentCount ? parseInt(currentCount) : 0;
    
    // Check if window has expired
    const windowKey = `rate_limit_window:${identifier}:${endpoint}`;
    const windowStartTime = await redis.get(windowKey);
    
    if (!windowStartTime || parseInt(windowStartTime) < windowStart) {
      // Reset window
      await redis.setex(windowKey, Math.ceil(windowMs / 1000), windowStart.toString());
      await redis.setex(key, Math.ceil(windowMs / 1000), '1');
    } else {
      // Check if limit exceeded
      if (count >= maxRequests) {
        const retryAfter = Math.ceil((windowStart + windowMs - Date.now()) / 1000);
        logger.warn(`Rate limit exceeded for ${identifier} on ${endpoint}`);
        res.setHeader('Retry-After', retryAfter);
        return next(new RateLimitError('Too many requests, please try again later.', retryAfter));
      }
      
      // Increment count
      await redis.incr(key);
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count - 1));
    res.setHeader('X-RateLimit-Reset', new Date(windowStart + windowMs).toISOString());

    next();
  } catch (error) {
    logger.error('Rate limit error:', error);
    // Continue without rate limiting if Redis is unavailable
    next();
  }
}; 