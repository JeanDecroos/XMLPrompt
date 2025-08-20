/**
 * Prompts Routes
 * Handles CRUD operations for user prompts
 */

import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { rateLimitMiddleware } from '../middleware/rateLimit.js'
import { database } from '../config/database.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * @route GET /api/prompts/shared
 * @desc Get user's shared prompts
 * @access Private
 */
router.get('/shared',
  authMiddleware,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      const limit = parseInt(req.query.limit) || 10
      
      // Get user's shared prompts from database
      const { data: sharedPrompts, error } = await database.supabase
        .from('shared_prompts')
        .select(`
          id,
          share_token,
          is_public,
          max_views,
          expires_at,
          view_count,
          created_at,
          prompts!inner(
            id,
            title,
            updated_at
          )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        logger.error('Error fetching shared prompts:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch shared prompts'
        })
      }

      // Transform the data to match frontend expectations
      const items = sharedPrompts?.map(sp => ({
        id: sp.id,
        title: sp.prompts?.title || 'Untitled Prompt',
        updatedAt: sp.prompts?.updated_at || sp.created_at,
        url: `${req.protocol}://${req.get('host')}/shared/${sp.share_token}`
      })) || []

      res.json({
        items
      })
    } catch (error) {
      logger.error('Error getting shared prompts:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get shared prompts'
      })
    }
  }
)

/**
 * @route POST /api/prompts
 * @desc Create a new prompt
 * @access Private
 */
router.post('/',
  authMiddleware,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      const { title, role, task, context, requirements, raw_prompt } = req.body
      
      // Create new prompt in database
      const { data: prompt, error } = await database.supabase
        .from('prompts')
        .insert({
          user_id: user.id,
          title: title || 'Untitled Prompt',
          role,
          task,
          context,
          requirements,
          raw_prompt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        logger.error('Error creating prompt:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to create prompt'
        })
      }

      res.json({
        success: true,
        data: prompt
      })
    } catch (error) {
      logger.error('Error creating prompt:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to create prompt'
      })
    }
  }
)

export default router 