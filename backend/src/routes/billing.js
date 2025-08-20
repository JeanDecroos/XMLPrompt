import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { rateLimitMiddleware } from '../middleware/rateLimit.js'
import { database } from '../config/database.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * @route GET /api/billing/plan
 * @desc Get user's current billing plan
 * @access Private
 */
router.get('/plan',
  authMiddleware,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      
      // Get user's subscription info from database
      const { data: profile, error } = await database.supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, subscription_expires_at, subscription_created_at')
        .eq('id', user.id)
        .single()

      if (error) {
        logger.error('Error fetching billing plan:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch billing plan'
        })
      }

      // Determine plan details based on subscription tier
      const planDetails = {
        free: {
          name: 'Free',
          billingCycle: null,
          nextRenewalAt: null,
          isTopTier: false,
          features: [
            { key: 'prompts', label: 'Prompts', value: '100/month' },
            { key: 'enhance', label: 'AI Enhancements', value: false },
            { key: 'support', label: 'Support', value: 'Community' }
          ]
        },
        pro: {
          name: 'Pro',
          billingCycle: 'monthly',
          nextRenewalAt: profile?.subscription_expires_at || null,
          isTopTier: false,
          features: [
            { key: 'prompts', label: 'Prompts', value: 'Unlimited' },
            { key: 'enhance', label: 'AI Enhancements', value: true },
            { key: 'support', label: 'Support', value: 'Priority' }
          ]
        },
        enterprise: {
          name: 'Enterprise',
          billingCycle: 'yearly',
          nextRenewalAt: profile?.subscription_expires_at || null,
          isTopTier: true,
          features: [
            { key: 'prompts', label: 'Prompts', value: 'Unlimited' },
            { key: 'enhance', label: 'AI Enhancements', value: true },
            { key: 'support', label: 'Support', value: 'Dedicated' }
          ]
        }
      }

      const currentPlan = planDetails[profile?.subscription_tier || 'free']
      
      res.json(currentPlan)
    } catch (error) {
      logger.error('Error getting billing plan:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get billing plan'
      })
    }
  }
)

/**
 * @route GET /api/billing/usage
 * @desc Get user's current usage statistics
 * @access Private
 */
router.get('/usage',
  authMiddleware,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      
      // Get usage data from database
      const { data: usage, error } = await database.supabase
        .from('usage_tracking')
        .select('action_type, tokens_used, model_used, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(new Date().setDate(1)).toISOString()) // Current month
        .order('created_at', { ascending: false })

      if (error) {
        logger.error('Error fetching usage:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch usage'
        })
      }

      // Calculate usage statistics
      const promptsUsed = usage?.filter(u => u.action_type === 'prompt_created').length || 0
      const tokensUsed = usage?.reduce((sum, u) => sum + (u.tokens_used || 0), 0) || 0
      const modelsUsed = new Set(usage?.map(u => u.model_used).filter(Boolean)).size || 0

      // Get user's limits based on subscription
      const { data: profile } = await database.supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single()

      const limits = {
        free: { prompts: 100, models: 2 },
        pro: { prompts: null, models: 5 },
        enterprise: { prompts: null, models: null }
      }

      const userLimits = limits[profile?.subscription_tier || 'free']

      res.json({
        promptsUsed,
        promptsLimit: userLimits.prompts,
        modelsUsed,
        modelsLimit: userLimits.models,
        period: {
          start: new Date(new Date().setDate(1)).toISOString(),
          end: new Date(new Date().setFullYear(new Date().getFullYear(), new Date().getMonth() + 1, 0)).toISOString()
        }
      })
    } catch (error) {
      logger.error('Error getting usage:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get usage'
      })
    }
  }
)

/**
 * @route GET /api/billing/invoices
 * @desc Get user's billing history
 * @access Private
 */
router.get('/invoices',
  authMiddleware,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      const limit = parseInt(req.query.limit) || 5
      
      // For now, return mock invoice data
      // In production, this would integrate with Stripe or other payment processor
      const mockInvoices = [
        {
          id: 'inv_001',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          amountCents: 2900, // $29.00
          status: 'paid'
        },
        {
          id: 'inv_002',
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          amountCents: 2900,
          status: 'paid'
        }
      ]

      res.json({
        invoices: mockInvoices.slice(0, limit)
      })
    } catch (error) {
      logger.error('Error getting invoices:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get invoices'
      })
    }
  }
)

export default router
