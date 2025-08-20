import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { rateLimitMiddleware } from '../middleware/rateLimit.js'
import { database } from '../config/database.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * @route GET /api/account/profile
 * @desc Get user's profile information
 * @access Private
 */
router.get('/profile',
  authMiddleware,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      
      // Get user's profile from database
      const { data: profile, error } = await database.supabase
        .from('profiles')
        .select('email, full_name, avatar_url, created_at, updated_at')
        .eq('id', user.id)
        .single()

      if (error) {
        logger.error('Error fetching profile:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch profile'
        })
      }

      res.json({
        email: profile.email || user.email,
        memberSince: profile.created_at,
        lastActiveAt: profile.updated_at,
        location: null, // Could be added to profiles table later
        timeZone: null, // Could be added to profiles table later
        avatarUrl: profile.avatar_url
      })
    } catch (error) {
      logger.error('Error getting profile:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get profile'
      })
    }
  }
)

/**
 * @route PATCH /api/account/profile
 * @desc Update user's profile information
 * @access Private
 */
router.patch('/profile',
  authMiddleware,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      const { location, timeZone } = req.body
      
      // Update user's profile in database
      const { data: profile, error } = await database.supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        logger.error('Error updating profile:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to update profile'
        })
      }

      res.json({
        email: profile.email || user.email,
        memberSince: profile.created_at,
        lastActiveAt: profile.updated_at,
        location: location || null,
        timeZone: timeZone || null,
        avatarUrl: profile.avatar_url
      })
    } catch (error) {
      logger.error('Error updating profile:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      })
    }
  }
)

export default router
