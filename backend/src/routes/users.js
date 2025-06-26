import express from 'express'
import { database } from '../config/database.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// GET /api/v1/users/profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id

    const { data: user, error } = await database
      .from('users')
      .select('id, email, username, full_name, avatar_url, subscription_tier, created_at, last_login')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    logger.error('Error fetching user profile:', error)
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'Could not retrieve user profile'
    })
  }
})

// PUT /api/v1/users/profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id
    const { username, full_name, avatar_url } = req.body

    const updates = {}
    if (username) updates.username = username
    if (full_name) updates.full_name = full_name
    if (avatar_url) updates.avatar_url = avatar_url

    const { data: user, error } = await database
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info(`User profile updated: ${userId}`)

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    logger.error('Error updating user profile:', error)
    res.status(500).json({
      error: 'Failed to update profile',
      message: 'Could not update user profile'
    })
  }
})

// GET /api/v1/users/preferences
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user.id

    const { data: preferences, error } = await database
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw error
    }

    res.json({
      success: true,
      data: preferences || {
        theme: 'light',
        notifications: true,
        default_model: 'claude-3-5-sonnet'
      }
    })
  } catch (error) {
    logger.error('Error fetching user preferences:', error)
    res.status(500).json({
      error: 'Failed to fetch preferences',
      message: 'Could not retrieve user preferences'
    })
  }
})

// PUT /api/v1/users/preferences
router.put('/preferences', async (req, res) => {
  try {
    const userId = req.user.id
    const preferences = req.body

    const { data, error } = await database
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    logger.info(`User preferences updated: ${userId}`)

    res.json({
      success: true,
      data
    })
  } catch (error) {
    logger.error('Error updating user preferences:', error)
    res.status(500).json({
      error: 'Failed to update preferences',
      message: 'Could not update user preferences'
    })
  }
})

export default router 