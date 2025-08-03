import express from 'express'
import { logger } from '../utils/logger.js'
import { getQuotaInfo, QUOTA_LIMITS } from '../middleware/quotaMiddleware.js'
import { authMiddleware } from '../middleware/auth.js'
import { database } from '../config/database.js'

const router = express.Router()

// Apply auth middleware to all quota routes
router.use(authMiddleware)

// GET /api/v1/quota - Get current quota information
router.get('/', getQuotaInfo)

// GET /api/v1/quota/limits - Get quota limits for all tiers
router.get('/limits', async (req, res) => {
  try {
    const userTier = req.user?.subscription_tier || 'free'
    
    res.json({
      success: true,
      data: {
        currentTier: userTier,
        limits: QUOTA_LIMITS,
        currentLimits: QUOTA_LIMITS[userTier] || QUOTA_LIMITS.free
      }
    })
  } catch (error) {
    logger.error('Error fetching quota limits:', error)
    res.status(500).json({
      error: 'Failed to fetch quota limits',
      message: 'Could not retrieve quota information'
    })
  }
})

// GET /api/v1/quota/usage/history - Get detailed usage history
router.get('/usage/history', async (req, res) => {
  try {
    const userId = req.user.id
    const { period = '30d', limit = 100 } = req.query

    // Calculate date range
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }

    const days = periodDays[period] || 30
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const { data: usageHistory, error } = await database.supabase
      .from('usage_tracking')
      .select(`
        action_type,
        tokens_used,
        processing_time_ms,
        model_used,
        success,
        error_message,
        created_at
      `)
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (error) {
      throw error
    }

    // Group usage by day for charts
    const dailyUsage = usageHistory.reduce((acc, record) => {
      const date = new Date(record.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          prompts: 0,
          enrichments: 0,
          apiCalls: 0,
          tokensUsed: 0,
          errors: 0
        }
      }

      if (record.success) {
        switch (record.action_type) {
          case 'prompt_generation':
          case 'save':
            acc[date].prompts += 1
            break
          case 'enhancement':
            acc[date].enrichments += 1
            acc[date].tokensUsed += record.tokens_used || 0
            break
          case 'api_call':
            acc[date].apiCalls += 1
            break
        }
      } else {
        acc[date].errors += 1
      }

      return acc
    }, {})

    const dailyUsageArray = Object.values(dailyUsage).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    )

    res.json({
      success: true,
      data: {
        period,
        totalRecords: usageHistory.length,
        usageHistory: usageHistory.slice(0, 50), // Recent detailed records
        dailyUsage: dailyUsageArray,
        summary: {
          totalActions: usageHistory.length,
          successfulActions: usageHistory.filter(r => r.success).length,
          totalTokens: usageHistory.reduce((sum, r) => sum + (r.tokens_used || 0), 0),
          averageProcessingTime: usageHistory.length > 0 
            ? Math.round(usageHistory.reduce((sum, r) => sum + (r.processing_time_ms || 0), 0) / usageHistory.length)
            : 0
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching usage history:', error)
    res.status(500).json({
      error: 'Failed to fetch usage history',
      message: 'Could not retrieve usage data'
    })
  }
})

// GET /api/v1/quota/usage/monthly - Get current month's detailed usage
router.get('/usage/monthly', async (req, res) => {
  try {
    const userId = req.user.id
    
    // Get current month range
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const { data: monthlyUsage, error } = await database.supabase
      .from('usage_tracking')
      .select(`
        action_type,
        tokens_used,
        model_used,
        success,
        created_at
      `)
      .eq('user_id', userId)
      .gte('created_at', currentMonth.toISOString())
      .lt('created_at', nextMonth.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Calculate detailed statistics
    const stats = {
      prompts: { total: 0, successful: 0 },
      enrichments: { total: 0, successful: 0, tokensUsed: 0 },
      apiCalls: { total: 0, successful: 0 },
      modelUsage: {},
      dailyBreakdown: {}
    }

    monthlyUsage.forEach(record => {
      const date = new Date(record.created_at).toISOString().split('T')[0]
      
      // Initialize daily breakdown
      if (!stats.dailyBreakdown[date]) {
        stats.dailyBreakdown[date] = {
          prompts: 0,
          enrichments: 0,
          apiCalls: 0,
          tokensUsed: 0
        }
      }

      // Count by action type
      switch (record.action_type) {
        case 'prompt_generation':
        case 'save':
          stats.prompts.total += 1
          if (record.success) {
            stats.prompts.successful += 1
            stats.dailyBreakdown[date].prompts += 1
          }
          break
        case 'enhancement':
          stats.enrichments.total += 1
          if (record.success) {
            stats.enrichments.successful += 1
            stats.enrichments.tokensUsed += record.tokens_used || 0
            stats.dailyBreakdown[date].enrichments += 1
            stats.dailyBreakdown[date].tokensUsed += record.tokens_used || 0
          }
          break
        case 'api_call':
          stats.apiCalls.total += 1
          if (record.success) {
            stats.apiCalls.successful += 1
            stats.dailyBreakdown[date].apiCalls += 1
          }
          break
      }

      // Track model usage
      if (record.model_used && record.success) {
        stats.modelUsage[record.model_used] = (stats.modelUsage[record.model_used] || 0) + 1
      }
    })

    // Convert daily breakdown to array
    const dailyBreakdownArray = Object.entries(stats.dailyBreakdown)
      .map(([date, usage]) => ({ date, ...usage }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    res.json({
      success: true,
      data: {
        month: currentMonth.toISOString().slice(0, 7), // YYYY-MM format
        stats,
        dailyBreakdown: dailyBreakdownArray
      }
    })
  } catch (error) {
    logger.error('Error fetching monthly usage:', error)
    res.status(500).json({
      error: 'Failed to fetch monthly usage',
      message: 'Could not retrieve monthly usage data'
    })
  }
})

// GET /api/v1/quota/compare - Compare usage across tiers
router.get('/compare', async (req, res) => {
  try {
    const userTier = req.user?.subscription_tier || 'free'
    const currentLimits = QUOTA_LIMITS[userTier] || QUOTA_LIMITS.free

    // Calculate what user would get with each tier
    const tierComparison = Object.entries(QUOTA_LIMITS).map(([tier, limits]) => {
      const isCurrentTier = tier === userTier
      const upgrade = tier === 'pro' && userTier === 'free'
      const downgrade = tier === 'free' && userTier === 'pro'

      return {
        tier,
        isCurrentTier,
        isUpgrade: upgrade,
        isDowngrade: downgrade,
        limits: {
          monthlyPrompts: limits.monthlyPrompts,
          monthlyEnrichments: limits.monthlyEnrichments,
          dailyApiCalls: limits.dailyApiCalls,
          maxPromptsPerHour: limits.maxPromptsPerHour,
          maxTokensPerRequest: limits.maxTokensPerRequest,
          maxSharedPrompts: limits.maxSharedPrompts
        },
        features: limits.features,
        savings: isCurrentTier ? null : {
          monthlyPrompts: limits.monthlyPrompts - currentLimits.monthlyPrompts,
          monthlyEnrichments: limits.monthlyEnrichments - currentLimits.monthlyEnrichments,
          dailyApiCalls: limits.dailyApiCalls - currentLimits.dailyApiCalls
        }
      }
    })

    res.json({
      success: true,
      data: {
        currentTier: userTier,
        comparison: tierComparison,
        recommendations: {
          shouldUpgrade: userTier === 'free',
          upgradeReasons: userTier === 'free' ? [
            'Increase monthly prompt limit to 1,000',
            'Get 25x more AI enhancements (500 vs 20)',
            'Unlock API access for integrations',
            'Access advanced analytics',
            'Priority customer support'
          ] : []
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching tier comparison:', error)
    res.status(500).json({
      error: 'Failed to fetch tier comparison',
      message: 'Could not retrieve tier comparison data'
    })
  }
})

// POST /api/v1/quota/reset - Reset usage (admin only)
router.post('/reset', async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.is_admin) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin privileges required'
      })
    }

    const { userId, actionType } = req.body

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'userId is required'
      })
    }

    // Get current month range
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)
    
    const nextMonth = new Date(currentMonth)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Build delete query
    let query = database.supabase
      .from('usage_tracking')
      .delete()
      .eq('user_id', userId)
      .gte('created_at', currentMonth.toISOString())
      .lt('created_at', nextMonth.toISOString())

    if (actionType) {
      query = query.eq('action_type', actionType)
    }

    const { error } = await query

    if (error) {
      throw error
    }

    logger.info('Usage reset performed', {
      adminId: req.user.id,
      targetUserId: userId,
      actionType: actionType || 'all',
      month: currentMonth.toISOString().slice(0, 7)
    })

    res.json({
      success: true,
      message: `Usage reset successfully for ${actionType || 'all actions'}`,
      resetDate: new Date().toISOString()
    })
  } catch (error) {
    logger.error('Error resetting usage:', error)
    res.status(500).json({
      error: 'Failed to reset usage',
      message: 'Could not reset usage data'
    })
  }
})

export default router 