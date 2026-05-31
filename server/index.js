import './loadEnv.js'
import express from 'express'
import cors from 'cors'
import proposalRoutes from './routes/proposal.js'

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/proposal', proposalRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim()
  const apiKeyConfigured =
    key.length > 10 && !key.includes('your-api-key')

  res.json({
    status: 'Server is running',
    port: PORT,
    apiKeyConfigured,
    envFile: apiKeyConfigured
      ? 'loaded'
      : 'ANTHROPIC_API_KEY missing — put .env in project root (not server folder)',
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  const key = (process.env.ANTHROPIC_API_KEY || '').trim()
  if (key && !key.includes('your-api-key')) {
    console.log('API key loaded successfully')
  } else {
    console.warn('WARNING: ANTHROPIC_API_KEY not set in .env')
  }
})
