import express from 'express'
import { database } from '../config/database.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Middleware to check admin privileges
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id

    const { data: user, error } = await database
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error || !user?.is_admin) {
      return res.status(403).json({
        error: 'Admin access required',
        message: 'You do not have permission to access this resource'
      })
    }

    next()
  } catch (error) {
    logger.error('Error checking admin privileges:', error)
    res.status(500).json({
      error: 'Authorization check failed',
      message: 'Could not verify admin privileges'
    })
  }
}

// Apply admin middleware to all routes
router.use(requireAdmin)

// GET /api/v1/admin/stats
router.get('/stats', async (req, res) => {
  try {
    // Get user statistics
    const { data: userStats, error: userError } = await database
      .from('users')
      .select('id, subscription_tier, created_at')

    if (userError) throw userError

    // Get prompt statistics
    const { data: promptStats, error: promptError } = await database
      .from('prompts')
      .select('id, created_at, model_used')

    if (promptError) throw promptError

    // Calculate metrics
    const totalUsers = userStats.length
    const totalPrompts = promptStats.length
    
    const subscriptionTiers = userStats.reduce((acc, user) => {
      const tier = user.subscription_tier || 'free'
      acc[tier] = (acc[tier] || 0) + 1
      return acc
    }, {})

    const modelUsage = promptStats.reduce((acc, prompt) => {
      const model = prompt.model_used || 'unknown'
      acc[model] = (acc[model] || 0) + 1
      return acc
    }, {})

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentUsers = userStats.filter(u => new Date(u.created_at) > thirtyDaysAgo).length
    const recentPrompts = promptStats.filter(p => new Date(p.created_at) > thirtyDaysAgo).length

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          recent: recentUsers,
          byTier: subscriptionTiers
        },
        prompts: {
          total: totalPrompts,
          recent: recentPrompts,
          byModel: modelUsage
        },
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    logger.error('Error fetching admin stats:', error)
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'Could not retrieve admin statistics'
    })
  }
})

// GET /api/v1/admin/users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query
    const offset = (page - 1) * limit

    let query = database
      .from('users')
      .select('id, email, username, full_name, subscription_tier, created_at, last_login, is_active')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    const { data: users, error } = await query

    if (error) throw error

    // Get total count for pagination
    const { count, error: countError } = await database
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (countError) throw countError

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    logger.error('Error fetching users:', error)
    res.status(500).json({
      error: 'Failed to fetch users',
      message: 'Could not retrieve user list'
    })
  }
})

// PUT /api/v1/admin/users/:id/subscription
router.put('/users/:id/subscription', async (req, res) => {
  try {
    const { id } = req.params
    const { tier } = req.body

    if (!['free', 'pro', 'enterprise'].includes(tier)) {
      return res.status(400).json({
        error: 'Invalid subscription tier',
        message: 'Tier must be one of: free, pro, enterprise'
      })
    }

    const { data: user, error } = await database
      .from('users')
      .update({ subscription_tier: tier })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    logger.info(`Admin updated user subscription: ${id} to ${tier}`)

    res.json({
      success: true,
      data: user,
      message: `User subscription updated to ${tier}`
    })
  } catch (error) {
    logger.error('Error updating user subscription:', error)
    res.status(500).json({
      error: 'Failed to update subscription',
      message: 'Could not update user subscription'
    })
  }
})

// PUT /api/v1/admin/users/:id/status
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { is_active } = req.body

    const { data: user, error } = await database
      .from('users')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    logger.info(`Admin updated user status: ${id} to ${is_active ? 'active' : 'inactive'}`)

    res.json({
      success: true,
      data: user,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    logger.error('Error updating user status:', error)
    res.status(500).json({
      error: 'Failed to update user status',
      message: 'Could not update user status'
    })
  }
})

export default router 