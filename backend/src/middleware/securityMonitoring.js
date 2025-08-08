/**
 * Security Monitoring Middleware
 * Tracks security events, suspicious activities, and provides comprehensive audit logging
 */

import { logger } from '../utils/logger.js'
import { config } from '../config/index.js'
import { redis } from '../config/redis.js'
import { database } from '../config/database.js'
import { randomUUID } from 'crypto'

// Security event types
const SECURITY_EVENTS = {
  AUTH_FAILURE: 'auth_failure',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  SUSPICIOUS_IP: 'suspicious_ip',
  UNUSUAL_ACTIVITY: 'unusual_activity',
  API_KEY_ABUSE: 'api_key_abuse',
  DATA_ACCESS: 'data_access',
  ADMIN_ACTION: 'admin_action',
  ERROR_500: 'error_500',
  SQL_INJECTION_ATTEMPT: 'sql_injection_attempt',
  XSS_ATTEMPT: 'xss_attempt'
}

// IP reputation tracking
const IP_REPUTATION = {
  GOOD: 'good',
  SUSPICIOUS: 'suspicious',
  BLOCKED: 'blocked'
}

class SecurityMonitor {
  constructor() {
    this.suspiciousPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter)\b)/i,
      /(<script|javascript:|vbscript:|onload=|onerror=)/i,
      /(\b(admin|root|test|guest)\b)/i,
      /(\b(1=1|1'='1|'or'1'='1)\b)/i
    ]
    
    this.rateLimitThresholds = {
      authFailures: 5, // per hour
      apiErrors: 10, // per minute
      suspiciousRequests: 3 // per minute
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(eventType, details) {
    try {
      const event = {
        id: randomUUID(),
        event_type: eventType,
        timestamp: new Date().toISOString(),
        user_id: details.userId || null,
        ip_address: details.ipAddress,
        user_agent: details.userAgent,
        endpoint: details.endpoint,
        method: details.method,
        details: details.additional || {},
        severity: this.getEventSeverity(eventType),
        session_id: details.sessionId || null
      }

      // Log to database
      await this.saveSecurityEvent(event)
      
      // Log to Redis for real-time monitoring
      await this.cacheSecurityEvent(event)
      
      // Log to application logs
      logger.warn('Security Event', event)
      
      // Check for suspicious patterns
      await this.checkSuspiciousPatterns(event)
      
      return event
    } catch (error) {
      logger.error('Failed to log security event:', error)
    }
  }

  /**
   * Save security event to database
   */
  async saveSecurityEvent(event) {
    try {
      const { error } = await database.supabase
        .from('security_events')
        .insert({
          event_id: event.id,
          event_type: event.event_type,
          user_id: event.user_id,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          endpoint: event.endpoint,
          method: event.method,
          details: event.details,
          severity: event.severity,
          session_id: event.session_id,
          created_at: event.timestamp
        })

      if (error) {
        logger.error('Failed to save security event to database:', error)
      }
    } catch (error) {
      logger.error('Database error saving security event:', error)
    }
  }

  /**
   * Cache security event in Redis for real-time monitoring
   */
  async cacheSecurityEvent(event) {
    try {
      const key = `security_event:${event.id}`
      await redis.setex(key, 3600, JSON.stringify(event)) // Cache for 1 hour
      
      // Track event counts for rate limiting
      const countKey = `security_count:${event.event_type}:${event.ip_address}`
      await redis.incr(countKey)
      await redis.expire(countKey, 3600) // Reset after 1 hour
      
    } catch (error) {
      logger.error('Redis error caching security event:', error)
    }
  }

  /**
   * Check for suspicious patterns in requests
   */
  async checkSuspiciousPatterns(event) {
    const { endpoint, method, details } = event
    
    // Check for SQL injection attempts
    const sqlInjectionPattern = this.suspiciousPatterns[0]
    if (sqlInjectionPattern.test(endpoint) || sqlInjectionPattern.test(JSON.stringify(details))) {
      await this.logSecurityEvent(SECURITY_EVENTS.SQL_INJECTION_ATTEMPT, {
        ...event,
        additional: { pattern: 'sql_injection', matched: sqlInjectionPattern.source }
      })
    }
    
    // Check for XSS attempts
    const xssPattern = this.suspiciousPatterns[1]
    if (xssPattern.test(endpoint) || xssPattern.test(JSON.stringify(details))) {
      await this.logSecurityEvent(SECURITY_EVENTS.XSS_ATTEMPT, {
        ...event,
        additional: { pattern: 'xss', matched: xssPattern.source }
      })
    }
  }

  /**
   * Get event severity level
   */
  getEventSeverity(eventType) {
    const severityMap = {
      [SECURITY_EVENTS.AUTH_FAILURE]: 'medium',
      [SECURITY_EVENTS.RATE_LIMIT_EXCEEDED]: 'low',
      [SECURITY_EVENTS.SUSPICIOUS_IP]: 'high',
      [SECURITY_EVENTS.UNUSUAL_ACTIVITY]: 'medium',
      [SECURITY_EVENTS.API_KEY_ABUSE]: 'high',
      [SECURITY_EVENTS.DATA_ACCESS]: 'low',
      [SECURITY_EVENTS.ADMIN_ACTION]: 'high',
      [SECURITY_EVENTS.ERROR_500]: 'medium',
      [SECURITY_EVENTS.SQL_INJECTION_ATTEMPT]: 'critical',
      [SECURITY_EVENTS.XSS_ATTEMPT]: 'critical'
    }
    
    return severityMap[eventType] || 'low'
  }

  /**
   * Check IP reputation
   */
  async checkIPReputation(ipAddress) {
    try {
      const key = `ip_reputation:${ipAddress}`
      const reputation = await redis.get(key)
      
      if (reputation === IP_REPUTATION.BLOCKED) {
        return { blocked: true, reason: 'IP blocked due to suspicious activity' }
      }
      
      if (reputation === IP_REPUTATION.SUSPICIOUS) {
        return { suspicious: true, reason: 'IP flagged for suspicious activity' }
      }
      
      return { good: true }
    } catch (error) {
      logger.error('Error checking IP reputation:', error)
      return { good: true } // Default to good if check fails
    }
  }

  /**
   * Update IP reputation
   */
  async updateIPReputation(ipAddress, reputation, reason = '') {
    try {
      const key = `ip_reputation:${ipAddress}`
      const ttl = reputation === IP_REPUTATION.BLOCKED ? 86400 : 3600 // 24h for blocked, 1h for suspicious
      
      await redis.setex(key, ttl, reputation)
      
      // Log reputation change
      await this.logSecurityEvent('ip_reputation_update', {
        ipAddress,
        reputation,
        reason,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error updating IP reputation:', error)
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStats(timeframe = '24h') {
    try {
      const stats = {
        totalEvents: 0,
        criticalEvents: 0,
        highEvents: 0,
        mediumEvents: 0,
        lowEvents: 0,
        blockedIPs: 0,
        suspiciousIPs: 0,
        topEventTypes: [],
        topIPs: []
      }
      
      // Get event counts by severity
      const severityCounts = await redis.mget(
        'security_stats:critical:24h',
        'security_stats:high:24h',
        'security_stats:medium:24h',
        'security_stats:low:24h'
      )
      
      stats.criticalEvents = parseInt(severityCounts[0]) || 0
      stats.highEvents = parseInt(severityCounts[1]) || 0
      stats.mediumEvents = parseInt(severityCounts[2]) || 0
      stats.lowEvents = parseInt(severityCounts[3]) || 0
      stats.totalEvents = stats.criticalEvents + stats.highEvents + stats.mediumEvents + stats.lowEvents
      
      return stats
    } catch (error) {
      logger.error('Error getting security stats:', error)
      return {}
    }
  }
}

// Create singleton instance
const securityMonitor = new SecurityMonitor()

/**
 * Security monitoring middleware
 */
export const securityMonitoringMiddleware = async (req, res, next) => {
  const startTime = Date.now()
  
  // Add security monitoring to request object
  req.securityMonitor = securityMonitor
  
  // Check IP reputation
  const ipReputation = await securityMonitor.checkIPReputation(req.ip)
  if (ipReputation.blocked) {
    await securityMonitor.logSecurityEvent(SECURITY_EVENTS.SUSPICIOUS_IP, {
      ipAddress: req.ip,
      endpoint: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      additional: { reason: ipReputation.reason }
    })
    
    return res.status(403).json({
      error: true,
      message: 'Access denied',
      code: 'IP_BLOCKED'
    })
  }
  
  // Override res.end to capture response data
  const originalEnd = res.end
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime
    
    // Log security events based on response
    if (res.statusCode >= 500) {
      securityMonitor.logSecurityEvent(SECURITY_EVENTS.ERROR_500, {
        ipAddress: req.ip,
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        statusCode: res.statusCode,
        responseTime,
        additional: { chunk: chunk?.toString() }
      })
    }
    
    // Log admin actions
    if (req.path.includes('/admin') && res.statusCode === 200) {
      securityMonitor.logSecurityEvent(SECURITY_EVENTS.ADMIN_ACTION, {
        ipAddress: req.ip,
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        additional: { action: req.path.split('/').pop() }
      })
    }
    
    originalEnd.call(this, chunk, encoding)
  }
  
  next()
}

/**
 * Authentication failure monitoring
 */
export const authFailureMonitoring = async (req, res, next) => {
  const originalJson = res.json
  
  res.json = function(data) {
    // Check for authentication failures
    if (data.error && (data.message?.includes('Invalid') || data.message?.includes('authentication'))) {
      securityMonitor.logSecurityEvent(SECURITY_EVENTS.AUTH_FAILURE, {
        ipAddress: req.ip,
        endpoint: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        additional: { error: data.message }
      })
      
      // Check if IP should be flagged (fire-and-forget)
      ;(async () => {
        try {
          const failureKey = `auth_failures:${req.ip}`
          const failures = await redis.incr(failureKey)
          await redis.expire(failureKey, 3600) // Reset after 1 hour
          if (failures >= 5) {
            await securityMonitor.updateIPReputation(req.ip, IP_REPUTATION.SUSPICIOUS, 'Multiple auth failures')
          }
        } catch (err) {
          logger.error('Error updating auth failure counters:', err)
        }
      })()
    }
    
    return originalJson.call(this, data)
  }
  
  next()
}

export { securityMonitor, SECURITY_EVENTS, IP_REPUTATION } 