import { generateProposalContent } from '../services/aiService.js'
import { validateProposalPayload } from '../utils/inputValidation.js'

export const generateProposal = async (req, res) => {
  try {
    const {
      clientName,
      companyName,
      projectTitle,
      projectDescription,
      requiredFeatures,
      budgetRange,
      timeline,
      platformType,
    } = req.body

    const errors = validateProposalPayload(req.body)

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      })
    }

    const proposal = await generateProposalContent({
      clientName: clientName.trim(),
      companyName: companyName.trim(),
      projectTitle: projectTitle.trim(),
      projectDescription: projectDescription.trim(),
      requiredFeatures: requiredFeatures.trim(),
      budgetRange: budgetRange ? budgetRange.trim() : null,
      timeline: timeline ? timeline.trim() : null,
      platformType,
    })

    res.json(proposal)
  } catch (error) {
    console.error('Error generating proposal:', error)
    res.status(500).json({
      error: 'Failed to generate proposal',
      message: error.message || 'An unexpected error occurred',
    })
  }
}
