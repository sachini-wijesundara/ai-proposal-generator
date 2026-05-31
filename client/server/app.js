import './loadEnv.js'
import express from 'express'
import cors from 'cors'
import proposalRoutes from './routes/proposal.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/proposal', proposalRoutes)

app.get('/api/health', (req, res) => {
  const key = (process.env.ANTHROPIC_API_KEY || '').trim()
  const apiKeyConfigured =
    key.length > 10 && !key.includes('your-api-key')

  res.json({
    status: 'Server is running',
    apiKeyConfigured,
    envFile: apiKeyConfigured
      ? 'loaded'
      : 'ANTHROPIC_API_KEY missing — set it in .env locally or Vercel Environment Variables in production',
  })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
