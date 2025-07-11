import express from 'express'
import bcrypt from 'bcrypt'
import { database } from '../config/database.js'
import { logger } from '../utils/logger.js'
import { authMiddleware } from '../middleware/auth.js'
import { quotaMiddleware, logUsage } from '../middleware/quotaMiddleware.js'

const router = express.Router()

// GET /api/v1/sharing/:shareId - Public route to get shared prompt
router.get('/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params
    const { password } = req.query

    const { data: sharedPrompt, error } = await database.supabase
      .from('shared_prompts')
      .select(`
        id,
        prompt_id,
        share_id,
        title,
        description,
        is_public,
        password_hash,
        max_views,
        view_count,
        expires_at,
        allow_download,
        created_at,
        prompts!inner(
          title,
          description,
          raw_prompt,
          enriched_prompt,
          category,
          tags,
          selected_model,
          created_at
        ),
        profiles!inner(
          full_name,
          email
        )
      `)
      .eq('share_id', shareId)
      .single()

    if (error || !sharedPrompt) {
      return res.status(404).json({
        error: 'Shared prompt not found',
        message: 'The shared prompt does not exist or has been removed'
      })
    }

    // Check if expired
    if (sharedPrompt.expires_at && new Date(sharedPrompt.expires_at) < new Date()) {
      return res.status(410).json({
        error: 'Shared prompt expired',
        message: 'This shared prompt has expired'
      })
    }

    // Check view limit
    if (sharedPrompt.max_views && sharedPrompt.view_count >= sharedPrompt.max_views) {
      return res.status(429).json({
        error: 'View limit exceeded',
        message: 'This shared prompt has reached its maximum view limit'
      })
    }

    // Check password protection
    if (sharedPrompt.password_hash) {
      if (!password) {
        return res.status(401).json({
          error: 'Password required',
          message: 'This shared prompt is password protected',
          requiresPassword: true
        })
      }

      const isPasswordValid = await bcrypt.compare(password, sharedPrompt.password_hash)
      if (!isPasswordValid) {
        return res.status(403).json({
          error: 'Invalid password',
          message: 'The provided password is incorrect'
        })
      }
    }

    // Increment view count
    await database.supabase
      .from('shared_prompts')
      .update({ 
        view_count: sharedPrompt.view_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', sharedPrompt.id)

    // Return the shared prompt data
    res.json({
      success: true,
      data: {
        shareId: sharedPrompt.share_id,
        title: sharedPrompt.title || sharedPrompt.prompts.title,
        description: sharedPrompt.description || sharedPrompt.prompts.description,
        prompt: {
          raw: sharedPrompt.prompts.raw_prompt,
          enriched: sharedPrompt.prompts.enriched_prompt,
          category: sharedPrompt.prompts.category,
          tags: sharedPrompt.prompts.tags,
          model: sharedPrompt.prompts.selected_model
        },
        creator: {
          name: sharedPrompt.profiles.full_name,
          email: sharedPrompt.is_public ? sharedPrompt.profiles.email : null
        },
        metadata: {
          isPublic: sharedPrompt.is_public,
          viewCount: sharedPrompt.view_count + 1,
          maxViews: sharedPrompt.max_views,
          allowDownload: sharedPrompt.allow_download,
          createdAt: sharedPrompt.created_at,
          expiresAt: sharedPrompt.expires_at
        }
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

// POST /api/v1/sharing - Create a new share (requires auth and quota check)
router.post('/', 
  authMiddleware,
  quotaMiddleware('share'),
  async (req, res) => {
    try {
      const userId = req.user.id
      const {
        promptId,
        title,
        description,
        isPublic = false,
        password,
        expiresIn,
        maxViews,
        allowDownload = true
      } = req.body

      if (!promptId) {
        return res.status(400).json({
          error: 'Missing required field',
          message: 'promptId is required'
        })
      }

      // Verify the prompt exists and belongs to the user
      const { data: prompt, error: promptError } = await database.supabase
        .from('prompts')
        .select('id, title, description, user_id')
        .eq('id', promptId)
        .eq('user_id', userId)
        .single()

      if (promptError || !prompt) {
        return res.status(404).json({
          error: 'Prompt not found',
          message: 'The specified prompt does not exist or you do not have permission to share it'
        })
      }

      // Generate share data
      const shareData = {
        prompt_id: promptId,
        created_by: userId,
        share_id: generateShareId(),
        title: title || prompt.title,
        description: description || prompt.description,
        is_public: isPublic,
        allow_download: allowDownload
      }

      // Handle password protection
      if (password) {
        shareData.password_hash = await bcrypt.hash(password, 10)
      }

      // Handle expiration
      if (expiresIn) {
        const expirationDate = new Date()
        switch (expiresIn) {
          case '1h':
            expirationDate.setHours(expirationDate.getHours() + 1)
            break
          case '24h':
            expirationDate.setHours(expirationDate.getHours() + 24)
            break
          case '7d':
            expirationDate.setDate(expirationDate.getDate() + 7)
            break
          case '30d':
            expirationDate.setDate(expirationDate.getDate() + 30)
            break
          default:
            expirationDate.setDate(expirationDate.getDate() + 7) // Default to 7 days
        }
        shareData.expires_at = expirationDate.toISOString()
      }

      // Handle view limits
      if (maxViews && maxViews > 0) {
        shareData.max_views = maxViews
      }

      // Create the share
      const { data: newShare, error: shareError } = await database.supabase
        .from('shared_prompts')
        .insert(shareData)
        .select('*')
        .single()

      if (shareError) {
        throw shareError
      }

      // Log the share creation
      await logUsage(userId, 'share', {
        resourceType: 'prompt',
        resourceId: promptId,
        success: true,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      })

      logger.info('Prompt shared successfully', {
        userId,
        promptId,
        shareId: newShare.share_id,
        isPublic,
        hasPassword: !!password,
        expiresAt: shareData.expires_at
      })

      res.status(201).json({
        success: true,
        data: {
          shareId: newShare.share_id,
          shareUrl: `${req.protocol}://${req.get('host')}/shared/${newShare.share_id}`,
          title: newShare.title,
          description: newShare.description,
          isPublic: newShare.is_public,
          hasPassword: !!password,
          maxViews: newShare.max_views,
          allowDownload: newShare.allow_download,
          expiresAt: newShare.expires_at,
          createdAt: newShare.created_at
        },
        quota: req.quotaInfo ? {
          remaining: req.quotaInfo.remaining,
          tier: req.quotaInfo.tier
        } : null
      })
    } catch (error) {
      // Log failed share creation
      if (req.user) {
        await logUsage(req.user.id, 'share', {
          resourceType: 'prompt',
          success: false,
          error: error.message,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        })
      }

      logger.error('Error creating share:', error)
      res.status(500).json({
        error: 'Failed to create share',
        message: 'Could not create the shared prompt'
      })
    }
  }
)

// GET /api/v1/sharing - Get user's shared prompts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { limit = 50, offset = 0, includeExpired = false } = req.query

    let query = database.supabase
      .from('shared_prompts')
      .select(`
        id,
        share_id,
        title,
        description,
        is_public,
        view_count,
        max_views,
        expires_at,
        allow_download,
        created_at,
        prompts!inner(
          title,
          category
        )
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    // Filter out expired shares unless requested
    if (!includeExpired) {
      query = query.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    }

    const { data: shares, error } = await query

    if (error) {
      throw error
    }

    // Calculate share statistics
    const stats = {
      totalShares: shares.length,
      publicShares: shares.filter(s => s.is_public).length,
      totalViews: shares.reduce((sum, s) => sum + s.view_count, 0),
      expiredShares: shares.filter(s => s.expires_at && new Date(s.expires_at) < new Date()).length
    }

    res.json({
      success: true,
      data: {
        shares: shares.map(share => ({
          shareId: share.share_id,
          title: share.title || share.prompts.title,
          description: share.description,
          category: share.prompts.category,
          isPublic: share.is_public,
          viewCount: share.view_count,
          maxViews: share.max_views,
          allowDownload: share.allow_download,
          expiresAt: share.expires_at,
          isExpired: share.expires_at ? new Date(share.expires_at) < new Date() : false,
          createdAt: share.created_at,
          shareUrl: `${req.protocol}://${req.get('host')}/shared/${share.share_id}`
        })),
        stats,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: shares.length === parseInt(limit)
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching user shares:', error)
    res.status(500).json({
      error: 'Failed to fetch shares',
      message: 'Could not retrieve your shared prompts'
    })
  }
})

// DELETE /api/v1/sharing/:shareId - Delete a share
router.delete('/:shareId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const { shareId } = req.params

    // Verify the share exists and belongs to the user
    const { data: share, error: shareError } = await database.supabase
      .from('shared_prompts')
      .select('id, share_id, created_by')
      .eq('share_id', shareId)
      .eq('created_by', userId)
      .single()

    if (shareError || !share) {
      return res.status(404).json({
        error: 'Share not found',
        message: 'The specified share does not exist or you do not have permission to delete it'
      })
    }

    // Delete the share
    const { error: deleteError } = await database.supabase
      .from('shared_prompts')
      .delete()
      .eq('id', share.id)

    if (deleteError) {
      throw deleteError
    }

    logger.info('Share deleted successfully', {
      userId,
      shareId,
      deletedShareId: share.id
    })

    res.json({
      success: true,
      message: 'Share deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting share:', error)
    res.status(500).json({
      error: 'Failed to delete share',
      message: 'Could not delete the shared prompt'
    })
  }
})

// GET /api/v1/sharing/public - Get public shares (discovery)
router.get('/public', async (req, res) => {
  try {
    const { limit = 20, offset = 0, category, search } = req.query

    let query = database.supabase
      .from('shared_prompts')
      .select(`
        share_id,
        title,
        description,
        view_count,
        created_at,
        prompts!inner(
          title,
          description,
          category,
          tags
        ),
        profiles!inner(
          full_name
        )
      `)
      .eq('is_public', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('view_count', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    // Filter by category if provided
    if (category) {
      query = query.eq('prompts.category', category)
    }

    // Search functionality
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,prompts.title.ilike.%${search}%`)
    }

    const { data: publicShares, error } = await query

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: {
        shares: publicShares.map(share => ({
          shareId: share.share_id,
          title: share.title || share.prompts.title,
          description: share.description || share.prompts.description,
          category: share.prompts.category,
          tags: share.prompts.tags,
          viewCount: share.view_count,
          creator: share.profiles.full_name,
          createdAt: share.created_at,
          shareUrl: `${req.protocol}://${req.get('host')}/shared/${share.share_id}`
        })),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: publicShares.length === parseInt(limit)
        }
      }
    })
  } catch (error) {
    logger.error('Error fetching public shares:', error)
    res.status(500).json({
      error: 'Failed to fetch public shares',
      message: 'Could not retrieve public shared prompts'
    })
  }
})

// Helper function to generate share ID
function generateShareId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export default router 