/**
 * Health Routes
 * Handles health checks for the API server
 */

import express from 'express'

const router = express.Router()

/**
 * @route GET /
 * @desc Health check endpoint
 * @access Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  })
})

export default router 