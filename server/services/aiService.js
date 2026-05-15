import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export const generateProposalContent = async (clientDetails) => {
  const {
    clientName,
    companyName,
    projectTitle,
    projectDescription,
    requiredFeatures,
    budgetRange,
    timeline,
    platformType
  } = clientDetails

  // System prompt to guide the AI model
  const systemPrompt = `You are a professional proposal writer specializing in software and technology projects. Your task is to generate compelling, well-structured project proposals that clearly communicate value to clients.

When creating proposals, follow these guidelines:
1. Be clear, concise, and professional
2. Focus on client benefits and business value
3. Provide specific, actionable solutions
4. Include realistic timelines and budgets
5. Use persuasive language that builds confidence

You MUST return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. The response must be parseable JSON.`

  // Build the user prompt dynamically from form data
  const userPrompt = `Generate a professional project proposal for the following project:

Client Name: ${clientName}
Company Name: ${companyName}
Project Title: ${projectTitle}
Platform Type: ${platformType}
${timeline ? `Proposed Timeline: ${timeline}` : 'Timeline: To be discussed'}
${budgetRange ? `Budget Range: ${budgetRange}` : 'Budget: To be discussed'}

Project Description:
${projectDescription}

Required Features and Capabilities:
${requiredFeatures}

Return ONLY a JSON object with exactly this structure (no markdown, no extra text):
{
  "introduction": "Professional introduction of the proposal addressing the client by name and summarizing the opportunity",
  "requirementUnderstanding": "Demonstrates understanding of the client's requirements, challenges, and goals. Shows you've analyzed their needs.",
  "proposedSolution": "Comprehensive description of the solution approach, key benefits, and how it addresses the requirements. Include recommended technology stack for ${platformType}.",
  "featuresList": ["feature1", "feature2", "feature3", "feature4", "feature5", "feature6", "feature7", "feature8"],
  "timeline": "Detailed project timeline showing phases, milestones, and estimated duration. ${timeline ? `Account for: ${timeline}` : ''}",
  "budget": "Professional budget breakdown and pricing summary. ${budgetRange ? `Within the range of: ${budgetRange}` : ''}",
  "conclusion": "Strong closing statement reinforcing value, next steps, and call to action. Include professional contact closure."
}

Generate exactly this JSON structure with no additional text or markdown.`

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    })

    // Extract the text content from the response
    const responseText = message.content[0].text.trim()

    // Parse the JSON response
    let proposalData
    try {
      // Try to parse the response as JSON directly
      proposalData = JSON.parse(responseText)

      // Validate the structure
      if (!proposalData.introduction || !proposalData.requirementUnderstanding || 
          !proposalData.proposedSolution || !Array.isArray(proposalData.featuresList) ||
          !proposalData.timeline || !proposalData.budget || !proposalData.conclusion) {
        throw new Error('Missing required fields in proposal structure')
      }

      // Add metadata
      proposalData.title = `${projectTitle} - Project Proposal`
      proposalData.date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })
      proposalData.clientName = clientName
      proposalData.companyName = companyName

    } catch (parseError) {
      console.error('JSON Parse Error:', parseError)
      
      // Fallback: Try to extract JSON from response in case of markdown wrapping
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          proposalData = JSON.parse(jsonMatch[0])
          proposalData.title = `${projectTitle} - Project Proposal`
          proposalData.date = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })
          proposalData.clientName = clientName
          proposalData.companyName = companyName
        } catch (fallbackError) {
          throw new Error(`Failed to parse proposal: ${fallbackError.message}`)
        }
      } else {
        throw new Error('AI response was not valid JSON format')
      }
    }

    return proposalData

  } catch (error) {
    console.error('Error generating proposal:', error)
    throw new Error(`Failed to generate proposal: ${error.message}`)
  }
}
