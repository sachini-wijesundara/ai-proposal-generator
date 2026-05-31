import app from './app.js'

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  const key = (process.env.ANTHROPIC_API_KEY || '').trim()
  if (key && !key.includes('your-api-key')) {
    console.log('API key loaded successfully')
  } else {
    console.warn('WARNING: ANTHROPIC_API_KEY not set in .env')
  }
})
