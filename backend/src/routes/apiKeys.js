import express from 'express'
import { database } from '../config/database.js'
import { logger } from '../utils/logger.js'
import crypto from 'crypto'

const router = express.Router()

// GET /api/v1/api-keys
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id

    const { data: apiKeys, error } = await database
      .from('api_keys')
      .select('id, name, key_prefix, created_at, last_used, is_active')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: apiKeys
    })
  } catch (error) {
    logger.error('Error fetching API keys:', error)
    res.status(500).json({
      error: 'Failed to fetch API keys',
      message: 'Could not retrieve API keys'
    })
  }
})

// POST /api/v1/api-keys
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id
    const { name } = req.body

    if (!name) {
      return res.status(400).json({
        error: 'Name is required',
        message: 'Please provide a name for the API key'
      })
    }

    // Generate API key
    const apiKey = 'xp_' + crypto.randomBytes(32).toString('hex')
    const keyPrefix = apiKey.substring(0, 12) + '...'

    // Hash the key for storage
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex')

    const { data: newApiKey, error } = await database
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        key_hash: hashedKey,
        key_prefix: keyPrefix,
        is_active: true
      })
      .select('id, name, key_prefix, created_at, is_active')
      .single()

    if (error) {
      throw error
    }

    logger.info(`API key created for user ${userId}`, { name, keyPrefix })

    res.json({
      success: true,
      data: {
        ...newApiKey,
        key: apiKey // Only return the full key once
      },
      message: 'API key created successfully. Please save it securely as it will not be shown again.'
    })
  } catch (error) {
    logger.error('Error creating API key:', error)
    res.status(500).json({
      error: 'Failed to create API key',
      message: 'Could not create API key'
    })
  }
})

// DELETE /api/v1/api-keys/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    const { error } = await database
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    logger.info(`API key deleted for user ${userId}`, { keyId: id })

    res.json({
      success: true,
      message: 'API key deleted successfully'
    })
  } catch (error) {
    logger.error('Error deleting API key:', error)
    res.status(500).json({
      error: 'Failed to delete API key',
      message: 'Could not delete API key'
    })
  }
})

// PUT /api/v1/api-keys/:id/toggle
router.put('/:id/toggle', async (req, res) => {
  try {
    const userId = req.user.id
    const { id } = req.params

    // Get current state
    const { data: currentKey, error: fetchError } = await database
      .from('api_keys')
      .select('is_active')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Toggle active state
    const { data: updatedKey, error: updateError } = await database
      .from('api_keys')
      .update({ is_active: !currentKey.is_active })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    logger.info(`API key toggled for user ${userId}`, { 
      keyId: id, 
      newState: updatedKey.is_active 
    })

    res.json({
      success: true,
      data: updatedKey,
      message: `API key ${updatedKey.is_active ? 'activated' : 'deactivated'} successfully`
    })
  } catch (error) {
    logger.error('Error toggling API key:', error)
    res.status(500).json({
      error: 'Failed to toggle API key',
      message: 'Could not update API key status'
    })
  }
})

export default router 