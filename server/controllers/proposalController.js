import { generateProposalContent } from '../services/aiService.js'

export const generateProposal = async (req, res) => {
  try {
    const { clientName, companyName, projectTitle, projectDescription, requiredFeatures, budgetRange, timeline, platformType } = req.body

    // Server-side validation for required fields
    const errors = {}

    // Client Name validation
    if (!clientName || typeof clientName !== 'string') {
      errors.clientName = 'Client name is required and must be a string'
    } else if (clientName.trim().length < 2) {
      errors.clientName = 'Client name must be at least 2 characters'
    }

    // Company Name validation
    if (!companyName || typeof companyName !== 'string') {
      errors.companyName = 'Company name is required and must be a string'
    } else if (companyName.trim().length < 2) {
      errors.companyName = 'Company name must be at least 2 characters'
    }

    // Project Title validation
    if (!projectTitle || typeof projectTitle !== 'string') {
      errors.projectTitle = 'Project title is required and must be a string'
    } else if (projectTitle.trim().length < 2) {
      errors.projectTitle = 'Project title must be at least 2 characters'
    }

    // Project Description validation
    if (!projectDescription || typeof projectDescription !== 'string') {
      errors.projectDescription = 'Project description is required and must be a string'
    } else if (projectDescription.trim().length < 50) {
      errors.projectDescription = 'Project description must be at least 50 characters'
    }

    // Required Features validation
    if (!requiredFeatures || typeof requiredFeatures !== 'string') {
      errors.requiredFeatures = 'Required features are required and must be a string'
    } else if (requiredFeatures.trim().length < 10) {
      errors.requiredFeatures = 'Required features must be at least 10 characters'
    }

    // Platform Type validation
    const validPlatforms = ['Web', 'Mobile', 'Desktop', 'Both Web & Mobile']
    if (!platformType || !validPlatforms.includes(platformType)) {
      errors.platformType = `Platform type must be one of: ${validPlatforms.join(', ')}`
    }

    // If validation errors exist, return 400
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors
      })
    }

    // Generate proposal using AI service
    const proposal = await generateProposalContent({
      clientName: clientName.trim(),
      companyName: companyName.trim(),
      projectTitle: projectTitle.trim(),
      projectDescription: projectDescription.trim(),
      requiredFeatures: requiredFeatures.trim(),
      budgetRange: budgetRange ? budgetRange.trim() : null,
      timeline: timeline ? timeline.trim() : null,
      platformType
    })

    res.json(proposal)
  } catch (error) {
    console.error('Error generating proposal:', error)
    res.status(500).json({ 
      error: 'Failed to generate proposal',
      message: error.message || 'An unexpected error occurred'
    })
  }
}
