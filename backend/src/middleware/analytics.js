/**
 * Analytics Middleware
 * Tracks API requests and user interactions for analytics purposes
 */

import { logger } from '../utils/logger.js'
import { db } from '../config/database.js'
import { AppError } from './errorHandler.js'

export const analyticsMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id || null; // Get user ID from authenticated request
    const ipAddress = req.ip; // Get IP address
    const userAgent = req.headers['user-agent']; // Get User-Agent header

    // Log basic request event (you can expand this with more details)
    const eventData = {
      method: req.method,
      path: req.path,
      ip: ipAddress,
      userAgent: userAgent,
      // Add more request details as needed
    };

    // Insert into analytics_events table
    await db.adminClient.from('analytics_events').insert({
      user_id: userId,
      event_type: 'api_request',
      event_category: 'backend_api',
      event_action: `${req.method}_${req.path.replace(/\//g, '_')}`,
      event_data: eventData,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    logger.debug(`Analytics event logged for ${req.method} ${req.path} by user ${userId || 'anonymous'}`);
    next();
  } catch (error) {
    logger.error('Error logging analytics event:', error);
    // Do not block the request if analytics logging fails
    next();
  }
}; 