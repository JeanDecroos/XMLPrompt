import express from 'express'
import { database } from '../config/database.js'
import { logger } from '../utils/logger.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// GET /api/v1/sharing/:shareId - Public route to get shared prompt
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params

    const { data: sharedPrompt, error } = await database
      .from('shared_prompts')
      .select(`
        id,
        prompt_content,
        title,
        description,
        created_at,
        expires_at,
        view_count,
        users!inner(username)
      `)
      .eq('share_id', shareId)
      .eq('is_active', true)
      .single()

    if (error || !sharedPrompt) {
      return res.status(404).json({
        error: 'Shared prompt not found',
        message: 'The shared prompt does not exist or has expired'
      })
    }

    // Check if expired
    if (sharedPrompt.expires_at && new Date(sharedPrompt.expires_at) < new Date()) {
      return res.status(410).json({
        error: 'Shared prompt expired',
        message: 'This shared prompt has expired'
      })
    }

    // Increment view count
    await database
      .from('shared_prompts')
      .update({ view_count: sharedPrompt.view_count + 1 })
      .eq('share_id', shareId)

    res.json({
      success: true,
      data: {
        id: sharedPrompt.id,
        title: sharedPrompt.title,
        description: sharedPrompt.description,
        content: sharedPrompt.prompt_content,
        author: sharedPrompt.users.username,
        createdAt: sharedPrompt.created_at,
        viewCount: sharedPrompt.view_count + 1
      }
    })
  } catch (error) {
    logger.error('Error fetching shared prompt:', error)
    res.status(500).json({
      error: 'Failed to fetch shared prompt',
      message: 'Could not retrieve the shared prompt'
    })
  }
})

// POST /api/v1/sharing - Create a shared prompt (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { promptId, title, description, expiresIn } = req.body
    const userId = req.user.id

    if (!promptId) {
      return res.status(400).json({
        error: 'Prompt ID is required',
        message: 'Please specify which prompt to share'
      })
    }

    // Get the prompt to share
    const { data: prompt, error: promptError } = await database
      .from('prompts')
      .select('content, title')
      .eq('id', promptId)
      .eq('user_id', userId)
      .single()

    if (promptError || !prompt) {
      return res.status(404).json({
        error: 'Prompt not found',
        message: 'The specified prompt does not exist'
      })
    }

    // Generate share ID
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Calculate expiration date
    let expiresAt = null
    if (expiresIn) {
      const expirationMs = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      }
      
      if (expirationMs[expiresIn]) {
        expiresAt = new Date(Date.now() + expirationMs[expiresIn]).toISOString()
      }
    }

    // Create shared prompt
    const { data: sharedPrompt, error: shareError } = await database
      .from('shared_prompts')
      .insert({
        share_id: shareId,
        prompt_id: promptId,
        user_id: userId,
        prompt_content: prompt.content,
        title: title || prompt.title,
        description: description || '',
        expires_at: expiresAt,
        is_active: true,
        view_count: 0
      })
      .select()
      .single()

    if (shareError) {
      throw shareError
    }

    logger.info(`Prompt shared by user ${userId}`, {
      promptId,
      shareId,
      expiresAt
    })

    res.json({
      success: true,
      data: {
        shareId,
        shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${shareId}`,
        expiresAt
      }
    })
  } catch (error) {
    logger.error('Error creating shared prompt:', error)
    res.status(500).json({
      error: 'Failed to share prompt',
      message: 'Could not create shared prompt'
    })
  }
})

export default router 