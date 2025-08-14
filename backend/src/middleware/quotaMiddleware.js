/**
 * Quota Middleware - Freemium Model Implementation
 * Enforces usage quotas based on subscription tiers with monthly resets
 */

import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'
import { database } from '../config/database.js'
import { AppError } from './errorHandler.js'
import { countChatPayloadTokens } from '../utils/tokenCounter.js'

export class QuotaExceededError extends AppError {
  constructor(message, quotaInfo) {
    super(message, 429, 'QUOTA_EXCEEDED')
    this.name = 'QuotaExceededError'
    this.quotaInfo = quotaInfo
  }
}

// Quota limits by subscription tier
const QUOTA_LIMITS = {
  free: {
    monthlyPrompts: config.business.limits.free.monthlyPrompts || 100,
    monthlyEnrichments: config.business.limits.free.monthlyEnrichments || 20,
    dailyApiCalls: 50,
    maxPromptsPerHour: 10,
    maxTokensPerRequest: 1000,
    maxSharedPrompts: 10,
    features: {
      promptSharing: true,
      apiAccess: false,
      prioritySupport: false,
      advancedAnalytics: false,
      customModels: false
    }
  },
  pro: {
    monthlyPrompts: config.business.limits.pro.monthlyPrompts || 1000,
    monthlyEnrichments: config.business.limits.pro.monthlyEnrichments || 500,
    dailyApiCalls: 1000,
    maxPromptsPerHour: 100,
    maxTokensPerRequest: 4000,
    maxSharedPrompts: 100,
    features: {
      promptSharing: true,
      apiAccess: true,
      prioritySupport: true,
      advancedAnalytics: true,
      customModels: false
    }
  },
  enterprise: {
    monthlyPrompts: 10000,
    monthlyEnrichments: 5000,
    dailyApiCalls: 10000,
    maxPromptsPerHour: 1000,
    maxTokensPerRequest: 8000,
    maxSharedPrompts: 1000,
    features: {
      promptSharing: true,
      apiAccess: true,
      prioritySupport: true,
      advancedAnalytics: true,
      customModels: true
    }
  }
}

/**
 * Get current month's usage for a user
 */
async function getCurrentMonthUsage(userId) {
  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)
  
  const nextMonth = new Date(currentMonth)
  nextMonth.setMonth(nextMonth.getMonth() + 1)

  try {
    // Get usage data from usage_tracking table
    const { data: usageData, error } = await database.supabase
      .from('usage_tracking')
      .select('action_type, success, tokens_used, created_at')
      .eq('user_id', userId)
      .gte('created_at', currentMonth.toISOString())
      .lt('created_at', nextMonth.toISOString())

    if (error) {
      logger.error('Error fetching usage data:', error)
      return {
        prompts: 0,
        enrichments: 0,
        apiCalls: 0,
        tokensUsed: 0
      }
    }

    // Calculate usage by action type
    const usage = usageData.reduce((acc, record) => {
      if (!record.success) return acc // Only count successful actions
      
      switch (record.action_type) {
        case 'prompt_generation':
        case 'save':
          acc.prompts += 1
          break
        case 'enhancement':
          acc.enrichments += 1
          acc.tokensUsed += record.tokens_used || 0
          break
        case 'api_call':
          acc.apiCalls += 1
          break
      }
      return acc
    }, {
      prompts: 0,
      enrichments: 0,
      apiCalls: 0,
      tokensUsed: 0
    })

    return usage
  } catch (error) {
    logger.error('Error calculating monthly usage:', error)
    return {
      prompts: 0,
      enrichments: 0,
      apiCalls: 0,
      tokensUsed: 0
    }
  }
}

/**
 * Get current hour's usage for rate limiting
 */
async function getCurrentHourUsage(userId) {
  const currentHour = new Date()
  currentHour.setMinutes(0, 0, 0)
  
  const nextHour = new Date(currentHour)
  nextHour.setHours(nextHour.getHours() + 1)

  try {
    const { data: usageData, error } = await database.supabase
      .from('usage_tracking')
      .select('action_type, success')
      .eq('user_id', userId)
      .in('action_type', ['prompt_generation', 'enhancement'])
      .eq('success', true)
      .gte('created_at', currentHour.toISOString())
      .lt('created_at', nextHour.toISOString())

    if (error) {
      logger.error('Error fetching hourly usage:', error)
      return 0
    }

    return usageData.length
  } catch (error) {
    logger.error('Error calculating hourly usage:', error)
    return 0
  }
}

/**
 * Get current day's API usage
 */
async function getCurrentDayApiUsage(userId) {
  const currentDay = new Date()
  currentDay.setHours(0, 0, 0, 0)
  
  const nextDay = new Date(currentDay)
  nextDay.setDate(nextDay.getDate() + 1)

  try {
    const { data: usageData, error } = await database.supabase
      .from('usage_tracking')
      .select('action_type')
      .eq('user_id', userId)
      .eq('action_type', 'api_call')
      .eq('success', true)
      .gte('created_at', currentDay.toISOString())
      .lt('created_at', nextDay.toISOString())

    if (error) {
      logger.error('Error fetching daily API usage:', error)
      return 0
    }

    return usageData.length
  } catch (error) {
    logger.error('Error calculating daily API usage:', error)
    return 0
  }
}

/**
 * Check if user has access to a specific feature
 */
function hasFeatureAccess(userTier, feature) {
  const limits = QUOTA_LIMITS[userTier] || QUOTA_LIMITS.free
  return limits.features[feature] || false
}

/**
 * Main quota middleware
 */
export const quotaMiddleware = (actionType = 'prompt_generation', options = {}) => {
  return async (req, res, next) => {
    try {
      // Skip quota checks for unauthenticated users (they'll be limited by IP rate limiting)
      if (!req.user) {
        return next()
      }

      const userId = req.user.id
      const userTier = req.user.subscription_tier || 'free'
      const limits = QUOTA_LIMITS[userTier] || QUOTA_LIMITS.free

      // Get current usage
      const [monthlyUsage, hourlyUsage, dailyApiUsage] = await Promise.all([
        getCurrentMonthUsage(userId),
        getCurrentHourUsage(userId),
        getCurrentDayApiUsage(userId)
      ])

      // Check specific quota based on action type
      let quotaCheck = { allowed: true, reason: null }

      switch (actionType) {
        case 'prompt_generation':
        case 'save':
          if (monthlyUsage.prompts >= limits.monthlyPrompts) {
            quotaCheck = {
              allowed: false,
              reason: `Monthly prompt limit exceeded (${limits.monthlyPrompts})`
            }
          } else if (hourlyUsage >= limits.maxPromptsPerHour) {
            quotaCheck = {
              allowed: false,
              reason: `Hourly prompt limit exceeded (${limits.maxPromptsPerHour})`
            }
          }
          break

        case 'enhancement':
          if (monthlyUsage.enrichments >= limits.monthlyEnrichments) {
            quotaCheck = {
              allowed: false,
              reason: `Monthly enhancement limit exceeded (${limits.monthlyEnrichments})`
            }
          } else if (hourlyUsage >= limits.maxPromptsPerHour) {
            quotaCheck = {
              allowed: false,
              reason: `Hourly limit exceeded (${limits.maxPromptsPerHour})`
            }
          }
          break

        case 'api_call':
          if (!hasFeatureAccess(userTier, 'apiAccess')) {
            quotaCheck = {
              allowed: false,
              reason: 'API access requires Pro subscription'
            }
          } else if (dailyApiUsage >= limits.dailyApiCalls) {
            quotaCheck = {
              allowed: false,
              reason: `Daily API limit exceeded (${limits.dailyApiCalls})`
            }
          }
          break

        case 'share':
          // Get current shared prompts count
          const { data: sharedPrompts, error } = await database.supabase
            .from('shared_prompts')
            .select('id')
            .eq('created_by', userId)
          
          if (error) {
            logger.error('Error checking shared prompts:', error)
          } else if (sharedPrompts.length >= limits.maxSharedPrompts) {
            quotaCheck = {
              allowed: false,
              reason: `Maximum shared prompts exceeded (${limits.maxSharedPrompts})`
            }
          }
          break
      }

      // Check token limits for requests with token requirements
      if (options.tokensRequired && options.tokensRequired > limits.maxTokensPerRequest) {
        quotaCheck = {
          allowed: false,
          reason: `Request exceeds token limit (${limits.maxTokensPerRequest})`
        }
      }

      // If quota exceeded, throw error
      if (!quotaCheck.allowed) {
        const quotaInfo = {
          tier: userTier,
          limits,
          usage: {
            monthly: monthlyUsage,
            hourly: hourlyUsage,
            dailyApi: dailyApiUsage
          },
          resetDates: {
            monthly: getNextMonthReset(),
            hourly: getNextHourReset(),
            daily: getNextDayReset()
          }
        }

        throw new QuotaExceededError(quotaCheck.reason, quotaInfo)
      }

      // Enrichment-specific gating and per-call token cap
      if (actionType === 'enhancement') {
        // 2) Free plan restriction: block enrichment for free tier
        if (userTier === 'free') {
          const payloadInfo = {
            user_id: userId,
            subscription_tier: userTier,
            tokens_used: 0,
            request_timestamp: new Date().toISOString()
          }
          logger.warn('Blocked enrichment for free tier user', payloadInfo)
          return res.status(403).json({
            error: 'Enrichment is a premium feature. Please upgrade your plan.'
          })
        }

        // 3) Free trial placeholder (non-blocking)
        // if (req.user?.trial) {
        //   const { trial_calls_used = 0, trial_expires_at } = req.user.trial
        //   const TRIAL_CALL_LIMIT = config?.TOKEN_LIMITS?.trial_enrichment_calls ?? 5
        //   if (trial_expires_at && new Date(trial_expires_at) > new Date() && trial_calls_used < TRIAL_CALL_LIMIT) {
        //     // allow as trial
        //   }
        // }

        // 1) Premium per-call cap: combined input+output tokens must not exceed limit
        const limit = config?.TOKEN_LIMITS?.premium_enrichment_per_call ?? 5000
        try {
          // Build a rough message array from incoming request for preflight token estimation
          const systemMsg = { role: 'system', content: 'enrichment precheck' }
          const userContent = `task:${req.body?.task || ''}\nrole:${req.body?.role || ''}\ncontext:${req.body?.context || ''}\nrequirements:${req.body?.requirements || ''}\nstyle:${req.body?.style || ''}\noutput:${req.body?.output || ''}`
          const userMsg = { role: 'user', content: userContent }
          const estimatedInputTokens = countChatPayloadTokens([systemMsg, userMsg])

          // Store for later auditing
          req.enrichmentPreflight = { estimatedInputTokens, perCallLimit: limit }
        } catch {
          // ignore preflight failure
        }

        // Attach a response hook to enforce post-call cap using actual usage
        const originalJson = res.json.bind(res)
        res.json = (body) => {
          try {
            const tokensUsed = body?.data?.metadata?.tokensUsed || body?.tokensUsed || req?.tokensUsed || 0
            if (typeof tokensUsed === 'number' && tokensUsed > limit) {
              const payloadInfo = {
                user_id: userId,
                subscription_tier: userTier,
                tokens_used: tokensUsed,
                request_timestamp: new Date().toISOString()
              }
              logger.warn('Blocked enrichment exceeding per-call token cap', payloadInfo)
              res.status(400)
              return originalJson({
                error: 'Token limit exceeded. Premium plan allows up to 5,000 tokens per enrichment.'
              })
            }
          } catch {
            // Fall through
          }
          return originalJson(body)
        }
      }

      // Add quota info to request for use in response headers
      req.quotaInfo = {
        tier: userTier,
        limits,
        usage: {
          monthly: monthlyUsage,
          hourly: hourlyUsage,
          dailyApi: dailyApiUsage
        },
        remaining: {
          monthlyPrompts: Math.max(0, limits.monthlyPrompts - monthlyUsage.prompts),
          monthlyEnrichments: Math.max(0, limits.monthlyEnrichments - monthlyUsage.enrichments),
          hourlyPrompts: Math.max(0, limits.maxPromptsPerHour - hourlyUsage),
          dailyApiCalls: Math.max(0, limits.dailyApiCalls - dailyApiUsage)
        }
      }

      // Add quota headers to response
      res.setHeader('X-Quota-Tier', userTier)
      res.setHeader('X-Quota-Monthly-Prompts-Remaining', req.quotaInfo.remaining.monthlyPrompts)
      res.setHeader('X-Quota-Monthly-Enrichments-Remaining', req.quotaInfo.remaining.monthlyEnrichments)
      res.setHeader('X-Quota-Hourly-Remaining', req.quotaInfo.remaining.hourlyPrompts)
      res.setHeader('X-Quota-Reset-Monthly', getNextMonthReset().toISOString())

      next()
    } catch (error) {
      if (error instanceof QuotaExceededError) {
        logger.warn(`Quota exceeded for user ${req.user?.id}: ${error.message}`)
        
        // Add quota info to response
        res.setHeader('X-Quota-Exceeded', 'true')
        res.setHeader('X-Quota-Reset-Monthly', getNextMonthReset().toISOString())
        
        return res.status(429).json({
          error: true,
          message: error.message,
          code: 'QUOTA_EXCEEDED',
          quotaInfo: error.quotaInfo,
          upgradeUrl: '/pricing',
          timestamp: new Date().toISOString()
        })
      }

      logger.error('Error in quota middleware:', error)
      next(error)
    }
  }
}

/**
 * Feature access middleware
 */
export const requireFeature = (feature) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this feature'
      })
    }

    const userTier = req.user.subscription_tier || 'free'
    
    if (!hasFeatureAccess(userTier, feature)) {
      return res.status(403).json({
        error: 'Feature not available',
        message: `${feature} requires a Pro subscription`,
        currentTier: userTier,
        upgradeUrl: '/pricing'
      })
    }

    next()
  }
}

/**
 * Quota info endpoint middleware
 */
export const getQuotaInfo = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      })
    }

    const userId = req.user.id
    const userTier = req.user.subscription_tier || 'free'
    const limits = QUOTA_LIMITS[userTier] || QUOTA_LIMITS.free

    const [monthlyUsage, hourlyUsage, dailyApiUsage] = await Promise.all([
      getCurrentMonthUsage(userId),
      getCurrentHourUsage(userId),
      getCurrentDayApiUsage(userId)
    ])

    const quotaInfo = {
      tier: userTier,
      limits,
      usage: {
        monthly: monthlyUsage,
        hourly: hourlyUsage,
        dailyApi: dailyApiUsage
      },
      remaining: {
        monthlyPrompts: Math.max(0, limits.monthlyPrompts - monthlyUsage.prompts),
        monthlyEnrichments: Math.max(0, limits.monthlyEnrichments - monthlyUsage.enrichments),
        hourlyPrompts: Math.max(0, limits.maxPromptsPerHour - hourlyUsage),
        dailyApiCalls: Math.max(0, limits.dailyApiCalls - dailyApiUsage)
      },
      resetDates: {
        monthly: getNextMonthReset(),
        hourly: getNextHourReset(),
        daily: getNextDayReset()
      },
      features: limits.features
    }

    res.json({
      success: true,
      data: quotaInfo
    })
  } catch (error) {
    logger.error('Error fetching quota info:', error)
    next(error)
  }
}

/**
 * Log usage for quota tracking
 */
export const logUsage = async (userId, actionType, metadata = {}) => {
  try {
    await database.supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        action_type: actionType,
        resource_type: metadata.resourceType || null,
        resource_id: metadata.resourceId || null,
        tokens_used: metadata.tokensUsed || 0,
        processing_time_ms: metadata.processingTime || null,
        model_used: metadata.modelUsed || null,
        success: metadata.success !== false,
        error_message: metadata.error || null,
        ip_address: metadata.ipAddress || null,
        user_agent: metadata.userAgent || null,
        session_id: metadata.sessionId || null
      })
  } catch (error) {
    logger.error('Error logging usage:', error)
  }
}

// Helper functions
function getNextMonthReset() {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)
  nextMonth.setHours(0, 0, 0, 0)
  return nextMonth
}

function getNextHourReset() {
  const nextHour = new Date()
  nextHour.setHours(nextHour.getHours() + 1)
  nextHour.setMinutes(0, 0, 0)
  return nextHour
}

function getNextDayReset() {
  const nextDay = new Date()
  nextDay.setDate(nextDay.getDate() + 1)
  nextDay.setHours(0, 0, 0, 0)
  return nextDay
}

export { QUOTA_LIMITS, hasFeatureAccess } 