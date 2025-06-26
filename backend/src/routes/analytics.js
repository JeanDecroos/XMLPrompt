import express from 'express'
import { database } from '../config/database.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// GET /api/v1/analytics/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id

    // Get user's prompt statistics
    const { data: promptStats, error: promptError } = await database
      .from('prompts')
      .select('id, created_at, model_used')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (promptError) {
      throw promptError
    }

    // Calculate statistics
    const totalPrompts = promptStats.length
    const last30Days = promptStats.filter(p => 
      new Date(p.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length

    const modelUsage = promptStats.reduce((acc, prompt) => {
      const model = prompt.model_used || 'unknown'
      acc[model] = (acc[model] || 0) + 1
      return acc
    }, {})

    // Get usage trends (last 7 days)
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayCount = promptStats.filter(p => {
        const promptDate = new Date(p.created_at)
        return promptDate >= dayStart && promptDate < dayEnd
      }).length

      last7Days.push({
        date: dayStart.toISOString().split('T')[0],
        count: dayCount
      })
    }

    res.json({
      success: true,
      data: {
        totalPrompts,
        last30Days,
        modelUsage,
        usageTrends: last7Days,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('Error fetching analytics dashboard:', error)
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: 'Could not retrieve analytics data'
    })
  }
})

// GET /api/v1/analytics/usage
router.get('/usage', async (req, res) => {
  try {
    const userId = req.user.id
    const { period = '30d' } = req.query

    // Calculate date range
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }

    const days = periodDays[period] || 30
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    // Get usage data
    const { data: usageData, error } = await database
      .from('prompts')
      .select('created_at, model_used, tokens_used')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    // Group by day
    const dailyUsage = usageData.reduce((acc, prompt) => {
      const date = new Date(prompt.created_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          prompts: 0,
          tokens: 0,
          models: new Set()
        }
      }
      acc[date].prompts += 1
      acc[date].tokens += prompt.tokens_used || 0
      acc[date].models.add(prompt.model_used || 'unknown')
      return acc
    }, {})

    // Convert to array and clean up
    const usageArray = Object.values(dailyUsage).map(day => ({
      date: day.date,
      prompts: day.prompts,
      tokens: day.tokens,
      uniqueModels: day.models.size
    }))

    res.json({
      success: true,
      data: {
        period,
        usage: usageArray,
        summary: {
          totalPrompts: usageData.length,
          totalTokens: usageData.reduce((sum, p) => sum + (p.tokens_used || 0), 0),
          uniqueModels: new Set(usageData.map(p => p.model_used)).size
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching usage analytics:', error)
    res.status(500).json({
      error: 'Failed to fetch usage data',
      message: 'Could not retrieve usage analytics'
    })
  }
})

// POST /api/v1/analytics/track
router.post('/track', async (req, res) => {
  try {
    const userId = req.user.id
    const { event, properties = {} } = req.body

    if (!event) {
      return res.status(400).json({
        error: 'Event name is required',
        message: 'Please specify the event to track'
      })
    }

    // Store analytics event
    const { error } = await database
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_name: event,
        properties: properties,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }

    logger.info(`Analytics event tracked: ${event}`, {
      userId,
      event,
      properties
    })

    res.json({
      success: true,
      message: 'Event tracked successfully'
    })
  } catch (error) {
    logger.error('Error tracking analytics event:', error)
    res.status(500).json({
      error: 'Failed to track event',
      message: 'Could not record analytics event'
    })
  }
})

export default router 