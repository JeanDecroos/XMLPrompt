/**
 * Templates Routes
 * Handles CRUD operations for templates with advanced search and analytics
 */

import express from 'express'
import { supabase } from '../config/supabase.js'
import { authenticateUser } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'

const router = express.Router()

// Apply rate limiting to all template routes
router.use(rateLimit('templates', 100, 3600)) // 100 requests per hour

/**
 * @route GET /
 * @desc Get templates with advanced filtering and search
 * @access Public (with optional user context)
 */
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      tags,
      tier,
      status = 'active',
      sort = 'popular',
      page = 1,
      limit = 20,
      featured,
      author_id
    } = req.query

    let query = supabase
      .from('templates')
      .select(`
        *,
        category:template_categories(name, icon, color),
        tags:template_tags_junction(
          tag:template_tags(name, description, category)
        ),
        author:profiles(full_name, avatar_url)
      `)
      .eq('status', status)

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    if (tier) {
      query = query.eq('tier', tier)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (author_id) {
      query = query.eq('author_id', author_id)
    }

    // Apply search
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,preview_text.ilike.%${search}%`)
    }

    // Apply tag filtering
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      // This would need a more complex query with joins for tag filtering
      // For now, we'll filter in the application layer
    }

    // Apply sorting
    switch (sort) {
      case 'popular':
        query = query.order('usage_count', { ascending: false })
        break
      case 'recent':
        query = query.order('created_at', { ascending: false })
        break
      case 'rating':
        query = query.order('rating_average', { ascending: false })
        break
      case 'featured':
        query = query.order('is_featured', { ascending: false })
        break
      default:
        query = query.order('usage_count', { ascending: false })
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: templates, error, count } = await query

    if (error) {
      console.error('Template fetch error:', error)
      return res.status(500).json({ 
        error: 'Failed to fetch templates',
        details: error.message 
      })
    }

    // Filter by tags in application layer if needed
    let filteredTemplates = templates
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags]
      filteredTemplates = templates.filter(template => 
        template.tags.some(tagRef => 
          tagArray.includes(tagRef.tag.name)
        )
      )
    }

    res.json({
      templates: filteredTemplates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || filteredTemplates.length,
        pages: Math.ceil((count || filteredTemplates.length) / limit)
      }
    })

  } catch (error) {
    console.error('Template route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route GET /categories
 * @desc Get all template categories
 * @access Public
 */
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('template_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Categories fetch error:', error)
      return res.status(500).json({ 
        error: 'Failed to fetch categories',
        details: error.message 
      })
    }

    res.json({ categories })

  } catch (error) {
    console.error('Categories route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route GET /tags
 * @desc Get all template tags with usage statistics
 * @access Public
 */
router.get('/tags', async (req, res) => {
  try {
    const { data: tags, error } = await supabase
      .from('template_tags')
      .select('*')
      .eq('is_active', true)
      .order('usage_count', { ascending: false })

    if (error) {
      console.error('Tags fetch error:', error)
      return res.status(500).json({ 
        error: 'Failed to fetch tags',
        details: error.message 
      })
    }

    res.json({ tags })

  } catch (error) {
    console.error('Tags route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route GET /popular
 * @desc Get popular templates
 * @access Public
 */
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const { data: templates, error } = await supabase
      .from('templates')
      .select(`
        *,
        category:template_categories(name, icon, color),
        tags:template_tags_junction(
          tag:template_tags(name, description, category)
        ),
        author:profiles(full_name, avatar_url)
      `)
      .eq('status', 'active')
      .order('usage_count', { ascending: false })
      .limit(parseInt(limit))

    if (error) {
      console.error('Popular templates fetch error:', error)
      return res.status(500).json({ 
        error: 'Failed to fetch popular templates',
        details: error.message 
      })
    }

    res.json({ templates })

  } catch (error) {
    console.error('Popular templates route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route GET /:id
 * @desc Get a specific template by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: template, error } = await supabase
      .from('templates')
      .select(`
        *,
        category:template_categories(name, icon, color),
        tags:template_tags_junction(
          tag:template_tags(name, description, category)
        ),
        author:profiles(full_name, avatar_url)
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Template not found' })
      }
      console.error('Template fetch error:', error)
      return res.status(500).json({ 
        error: 'Failed to fetch template',
        details: error.message 
      })
    }

    // Track template view
    await trackTemplateUsage(id, req.user?.id, 'view', req)

    res.json({ template })

  } catch (error) {
    console.error('Template detail route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route POST /
 * @desc Create a new template (authenticated users only)
 * @access Private
 */
router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      template_data,
      preview_text,
      tier = 'free',
      tags = []
    } = req.body

    // Validate required fields
    if (!title || !template_data) {
      return res.status(400).json({ 
        error: 'Title and template_data are required' 
      })
    }

    // Create template
    const { data: template, error: templateError } = await supabase
      .from('templates')
      .insert({
        title,
        description,
        category_id,
        template_data,
        preview_text,
        tier,
        author_id: req.user.id,
        status: 'active'
      })
      .select()
      .single()

    if (templateError) {
      console.error('Template creation error:', templateError)
      return res.status(500).json({ 
        error: 'Failed to create template',
        details: templateError.message 
      })
    }

    // Add tags if provided
    if (tags.length > 0) {
      const tagInserts = tags.map(tagName => ({
        template_id: template.id,
        tag_id: tagName // Assuming tagName is the tag ID
      }))

      const { error: tagError } = await supabase
        .from('template_tags_junction')
        .insert(tagInserts)

      if (tagError) {
        console.error('Tag assignment error:', tagError)
        // Don't fail the request, just log the error
      }
    }

    res.status(201).json({ 
      template,
      message: 'Template created successfully' 
    })

  } catch (error) {
    console.error('Template creation route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route POST /:id/use
 * @desc Mark template as used and track usage
 * @access Private
 */
router.post('/:id/use', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params

    // Track template usage
    await trackTemplateUsage(id, req.user.id, 'use', req)

    res.json({ 
      message: 'Template usage tracked successfully' 
    })

  } catch (error) {
    console.error('Template usage tracking error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route POST /:id/rate
 * @desc Rate a template
 * @access Private
 */
router.post('/:id/rate', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const { rating, review } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      })
    }

    // Upsert rating
    const { data: ratingData, error } = await supabase
      .from('template_ratings')
      .upsert({
        template_id: id,
        user_id: req.user.id,
        rating,
        review
      })
      .select()
      .single()

    if (error) {
      console.error('Rating creation error:', error)
      return res.status(500).json({ 
        error: 'Failed to create rating',
        details: error.message 
      })
    }

    // Track rating action
    await trackTemplateUsage(id, req.user.id, 'rate', req)

    res.json({ 
      rating: ratingData,
      message: 'Rating submitted successfully' 
    })

  } catch (error) {
    console.error('Template rating route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route POST /:id/favorite
 * @desc Add template to favorites
 * @access Private
 */
router.post('/:id/favorite', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params

    const { data: favorite, error } = await supabase
      .from('template_favorites')
      .insert({
        template_id: id,
        user_id: req.user.id
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(409).json({ 
          error: 'Template already in favorites' 
        })
      }
      console.error('Favorite creation error:', error)
      return res.status(500).json({ 
        error: 'Failed to add to favorites',
        details: error.message 
      })
    }

    res.json({ 
      favorite,
      message: 'Template added to favorites' 
    })

  } catch (error) {
    console.error('Template favorite route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route DELETE /:id/favorite
 * @desc Remove template from favorites
 * @access Private
 */
router.delete('/:id/favorite', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('template_favorites')
      .delete()
      .eq('template_id', id)
      .eq('user_id', req.user.id)

    if (error) {
      console.error('Favorite deletion error:', error)
      return res.status(500).json({ 
        error: 'Failed to remove from favorites',
        details: error.message 
      })
    }

    res.json({ 
      message: 'Template removed from favorites' 
    })

  } catch (error) {
    console.error('Template unfavorite route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

/**
 * @route GET /user/favorites
 * @desc Get user's favorite templates
 * @access Private
 */
router.get('/user/favorites', authenticateUser, async (req, res) => {
  try {
    const { data: favorites, error } = await supabase
      .from('template_favorites')
      .select(`
        template:templates(
          *,
          category:template_categories(name, icon, color),
          tags:template_tags_junction(
            tag:template_tags(name, description, category)
          ),
          author:profiles(full_name, avatar_url)
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Favorites fetch error:', error)
      return res.status(500).json({ 
        error: 'Failed to fetch favorites',
        details: error.message 
      })
    }

    const templates = favorites.map(fav => fav.template)

    res.json({ templates })

  } catch (error) {
    console.error('User favorites route error:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    })
  }
})

// Helper function to track template usage
async function trackTemplateUsage(templateId, userId, actionType, req) {
  try {
    await supabase
      .from('template_usage')
      .insert({
        template_id: templateId,
        user_id: userId,
        action_type: actionType,
        session_id: req.session?.id,
        source_page: req.headers.referer,
        search_query: req.query.search,
        filters_applied: {
          category: req.query.category,
          tags: req.query.tags,
          tier: req.query.tier
        }
      })
  } catch (error) {
    console.error('Usage tracking error:', error)
    // Don't throw - usage tracking shouldn't break the main flow
  }
}

export default router 