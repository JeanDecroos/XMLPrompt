import express from 'express'
import { database } from '../config/database.js'
import { logger } from '../utils/logger.js'
import { authMiddleware } from '../middleware/auth.js'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

const router = express.Router()

// GET /api/v1/sharing/:shareId - Public route to get shared prompt
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params
    const password = req.headers['x-share-password']

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
        password_hash,
        max_views,
        is_active,
        profiles!created_by(full_name, email)
      `)
      .eq('share_id', shareId)
      .eq('is_active', true)
      .single()

    if (error || !sharedPrompt) {
      return res.status(404).json({
        success: false,
        error: 'Shared prompt not found',
        message: 'The shared prompt does not exist or has expired'
      })
    }

    // Check if expired
    if (sharedPrompt.expires_at && new Date(sharedPrompt.expires_at) < new Date()) {
      return res.status(410).json({
        success: false,
        error: 'Shared prompt expired',
        message: 'This shared prompt has expired'
      })
    }

    // Check view limit
    if (sharedPrompt.max_views && sharedPrompt.view_count >= sharedPrompt.max_views) {
      return res.status(410).json({
        success: false,
        error: 'View limit exceeded',
        message: 'This shared prompt has reached its view limit'
      })
    }

    // Check password protection
    if (sharedPrompt.password_hash) {
      if (!password) {
        return res.status(401).json({
          success: false,
          error: 'Password required',
          message: 'This shared prompt is password protected'
        })
      }

      const isValidPassword = await bcrypt.compare(password, sharedPrompt.password_hash)
      if (!isValidPassword) {
        return res.status(403).json({
          success: false,
          error: 'Invalid password',
          message: 'Incorrect password provided'
        })
      }
    }

    // Increment view count
    await database
      .from('shared_prompts')
      .update({ 
        view_count: sharedPrompt.view_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('share_id', shareId)

    res.json({
      success: true,
      data: {
        id: sharedPrompt.id,
        title: sharedPrompt.title,
        description: sharedPrompt.description,
        content: sharedPrompt.prompt_content,
        author: sharedPrompt.profiles?.full_name || sharedPrompt.profiles?.email || 'Anonymous',
        createdAt: sharedPrompt.created_at,
        viewCount: sharedPrompt.view_count + 1
      }
    })
  } catch (error) {
    logger.error('Error fetching shared prompt:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shared prompt',
      message: 'Could not retrieve the shared prompt'
    })
  }
})

// POST /api/v1/sharing - Create a shared prompt (requires auth)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { 
      promptId, 
      title, 
      description, 
      expiresIn, 
      isPublic = false,
      requirePassword = false,
      password,
      maxViews,
      allowDownload = true
    } = req.body
    const userId = req.user.id

    if (!promptId) {
      return res.status(400).json({
        success: false,
        error: 'Prompt ID is required',
        message: 'Please specify which prompt to share'
      })
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
        message: 'Please provide a title for the shared prompt'
      })
    }

    // Get the prompt to share
    const { data: prompt, error: promptError } = await database
      .from('prompts')
      .select('enriched_prompt, raw_prompt, title')
      .eq('id', promptId)
      .eq('user_id', userId)
      .single()

    if (promptError || !prompt) {
      return res.status(404).json({
        success: false,
        error: 'Prompt not found',
        message: 'The specified prompt does not exist'
      })
    }

    // Generate share ID
    const shareId = crypto.randomBytes(16).toString('hex')

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

    // Hash password if provided
    let passwordHash = null
    if (requirePassword && password) {
      passwordHash = await bcrypt.hash(password, 10)
    }

    // Create shared prompt
    const { data: sharedPrompt, error: shareError } = await database
      .from('shared_prompts')
      .insert({
        share_id: shareId,
        prompt_id: promptId,
        created_by: userId,
        prompt_content: prompt.enriched_prompt || prompt.raw_prompt,
        title: title.trim(),
        description: description || '',
        expires_at: expiresAt,
        is_public: isPublic,
        password_hash: passwordHash,
        max_views: maxViews || null,
        is_active: true,
        view_count: 0,
        allow_download: allowDownload
      })
      .select()
      .single()

    if (shareError) {
      throw shareError
    }

    logger.info(`Prompt shared by user ${userId}`, {
      promptId,
      shareId,
      isPublic,
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
      success: false,
      error: 'Failed to share prompt',
      message: 'Could not create shared prompt'
    })
  }
})

// GET /api/v1/sharing/my-shares - Get user's shared prompts
router.get('/my-shares', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { page = 1, limit = 20 } = req.query

    const offset = (page - 1) * limit

    const { data: shares, error } = await database
      .from('shared_prompts')
      .select(`
        id,
        share_id,
        title,
        description,
        created_at,
        expires_at,
        view_count,
        is_public,
        is_active,
        max_views,
        last_accessed_at
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Get total count
    const { count } = await database
      .from('shared_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    res.json({
      success: true,
      data: {
        shares,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching user shares:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shares',
      message: 'Could not retrieve your shared prompts'
    })
  }
})

// PUT /api/v1/sharing/:shareId - Update share settings
router.put('/:shareId', authMiddleware, async (req, res) => {
  try {
    const { shareId } = req.params
    const userId = req.user.id
    const { title, description, isPublic, expiresIn, maxViews, isActive } = req.body

    // Verify ownership
    const { data: existingShare, error: fetchError } = await database
      .from('shared_prompts')
      .select('id')
      .eq('share_id', shareId)
      .eq('created_by', userId)
      .single()

    if (fetchError || !existingShare) {
      return res.status(404).json({
        success: false,
        error: 'Share not found',
        message: 'The specified share does not exist or you do not have permission to modify it'
      })
    }

    const updateData = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (isPublic !== undefined) updateData.is_public = isPublic
    if (maxViews !== undefined) updateData.max_views = maxViews
    if (isActive !== undefined) updateData.is_active = isActive

    // Handle expiration
    if (expiresIn !== undefined) {
      if (expiresIn) {
        const expirationMs = {
          '1h': 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000
        }
        
        if (expirationMs[expiresIn]) {
          updateData.expires_at = new Date(Date.now() + expirationMs[expiresIn]).toISOString()
        }
      } else {
        updateData.expires_at = null
      }
    }

    const { data: updatedShare, error: updateError } = await database
      .from('shared_prompts')
      .update(updateData)
      .eq('share_id', shareId)
      .eq('created_by', userId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    res.json({
      success: true,
      data: updatedShare
    })
  } catch (error) {
    logger.error('Error updating share:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update share',
      message: 'Could not update the shared prompt'
    })
  }
})

// DELETE /api/v1/sharing/:shareId - Delete a share
router.delete('/:shareId', authMiddleware, async (req, res) => {
  try {
    const { shareId } = req.params
    const userId = req.user.id

    const { data: deletedShare, error } = await database
      .from('shared_prompts')
      .delete()
      .eq('share_id', shareId)
      .eq('created_by', userId)
      .select()
      .single()

    if (error || !deletedShare) {
      return res.status(404).json({
        success: false,
        error: 'Share not found',
        message: 'The specified share does not exist or you do not have permission to delete it'
      })
    }

    res.json({
      success: true,
      data: { message: 'Share deleted successfully' }
    })
  } catch (error) {
    logger.error('Error deleting share:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to delete share',
      message: 'Could not delete the shared prompt'
    })
  }
})

// GET /api/v1/sharing/public - Get public prompts for discovery
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query
    const offset = (page - 1) * limit

    let query = database
      .from('shared_prompts')
      .select(`
        share_id,
        title,
        description,
        created_at,
        view_count,
        profiles!created_by(full_name, email)
      `)
      .eq('is_public', true)
      .eq('is_active', true)
      .order('view_count', { ascending: false })

    // Add search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Add category filter (if implemented in prompts table)
    if (category) {
      // This would require joining with prompts table for category
      // For now, we'll skip this filter
    }

    const { data: publicPrompts, error } = await query
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    // Get total count
    let countQuery = database
      .from('shared_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('is_public', true)
      .eq('is_active', true)

    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { count } = await countQuery

    res.json({
      success: true,
      data: {
        prompts: publicPrompts.map(prompt => ({
          shareId: prompt.share_id,
          title: prompt.title,
          description: prompt.description,
          author: prompt.profiles?.full_name || prompt.profiles?.email || 'Anonymous',
          createdAt: prompt.created_at,
          viewCount: prompt.view_count
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching public prompts:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch public prompts',
      message: 'Could not retrieve public prompts'
    })
  }
})

// GET /api/v1/sharing/stats - Get sharing statistics for user
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    // Get total shares
    const { count: totalShares } = await database
      .from('shared_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)

    // Get total views
    const { data: viewData } = await database
      .from('shared_prompts')
      .select('view_count')
      .eq('created_by', userId)

    const totalViews = viewData?.reduce((sum, share) => sum + (share.view_count || 0), 0) || 0

    // Get public shares
    const { count: publicShares } = await database
      .from('shared_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .eq('is_public', true)

    // Get active shares
    const { count: activeShares } = await database
      .from('shared_prompts')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId)
      .eq('is_active', true)

    res.json({
      success: true,
      data: {
        totalShares: totalShares || 0,
        totalViews: totalViews || 0,
        publicShares: publicShares || 0,
        activeShares: activeShares || 0
      }
    })
  } catch (error) {
    logger.error('Error fetching sharing stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sharing statistics',
      message: 'Could not retrieve sharing statistics'
    })
  }
})

export default router 