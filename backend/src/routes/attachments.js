import express from 'express'

// NOTE: This router is a scaffold and is not wired into the server yet.
// It returns placeholder responses only.

const router = express.Router()

// List attachments (placeholder)
router.get('/', async (req, res) => {
  return res.json({ success: true, data: [] })
})

// Upload attachment (placeholder)
router.post('/upload', async (req, res) => {
  return res.status(501).json({ success: false, message: 'Not implemented (attachments upload scaffold)' })
})

// Delete attachment (placeholder)
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  return res.json({ success: true, deleted: id })
})

export default router


