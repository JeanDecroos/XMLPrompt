import express from 'express'

const app = express()
const PORT = process.env.PORT || 3002

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT 
  })
})

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`)
})
