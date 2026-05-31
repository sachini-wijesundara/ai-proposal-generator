import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootEnvPath = path.resolve(__dirname, '../.env')
const serverEnvPath = path.resolve(__dirname, '.env')

dotenv.config({ path: rootEnvPath })
if (!process.env.ANTHROPIC_API_KEY) {
  dotenv.config({ path: serverEnvPath })
}
