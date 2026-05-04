import express from 'express'
import { generateProposal } from '../controllers/proposalController.js'

const router = express.Router()

// POST endpoint to generate proposal
router.post('/generate-proposal', generateProposal)

export default router
