import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRootEnv = path.resolve(__dirname, '../../.env')
const serverEnvPath = path.resolve(__dirname, '.env')

dotenv.config({ path: projectRootEnv })
if (!process.env.ANTHROPIC_API_KEY) {
  dotenv.config({ path: serverEnvPath })
}
