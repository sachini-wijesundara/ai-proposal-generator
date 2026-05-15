import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY
const isOpenRouter = apiKey?.startsWith('sk-or-')

const anthropicClient = isOpenRouter
  ? null
  : new Anthropic({ apiKey })

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001'
const OPENROUTER_MODEL = 'anthropic/claude-haiku-4.5'

const buildPrompts = (clientDetails) => {
  const {
    clientName,
    companyName,
    projectTitle,
    projectDescription,
    requiredFeatures,
    budgetRange,
    timeline,
    platformType,
  } = clientDetails

  const systemPrompt = `You are a professional proposal writer specializing in software and technology projects. Your task is to generate compelling, well-structured project proposals that clearly communicate value to clients.

When creating proposals, follow these guidelines:
1. Be clear, concise, and professional
2. Focus on client benefits and business value
3. Provide specific, actionable solutions
4. Include realistic timelines and budgets
5. Use persuasive language that builds confidence

You MUST return ONLY valid JSON with no markdown formatting, no code blocks, no extra text. The response must be parseable JSON.`

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

  return { systemPrompt, userPrompt, projectTitle, clientName, companyName }
}

const parseProposalJson = (responseText, meta) => {
  const { projectTitle, clientName, companyName } = meta

  const enrich = (data) => {
    data.title = `${projectTitle} - Project Proposal`
    data.date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    data.clientName = clientName
    data.companyName = companyName
    return data
  }

  try {
    const proposalData = JSON.parse(responseText)
    if (
      !proposalData.introduction ||
      !proposalData.requirementUnderstanding ||
      !proposalData.proposedSolution ||
      !Array.isArray(proposalData.featuresList) ||
      !proposalData.timeline ||
      !proposalData.budget ||
      !proposalData.conclusion
    ) {
      throw new Error('Missing required fields')
    }
    return enrich(proposalData)
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('AI response was not valid JSON format')
    return enrich(JSON.parse(jsonMatch[0]))
  }
}

const callOpenRouter = async (systemPrompt, userPrompt) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'AI Proposal Generator',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      max_tokens: 2000,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const errMsg = data?.error?.message || data?.message || `OpenRouter error ${response.status}`
    throw new Error(errMsg)
  }

  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenRouter returned an empty response')
  return text.trim()
}

const callAnthropic = async (systemPrompt, userPrompt) => {
  const message = await anthropicClient.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const block = message.content?.find((b) => b.type === 'text')
  if (!block?.text) throw new Error('Anthropic returned an empty response')
  return block.text.trim()
}

export const generateProposalContent = async (clientDetails) => {
  if (!apiKey || apiKey.includes('your-api-key')) {
    throw new Error('API key not configured. Add ANTHROPIC_API_KEY to your .env file.')
  }

  const prompts = buildPrompts(clientDetails)

  try {
    const responseText = isOpenRouter
      ? await callOpenRouter(prompts.systemPrompt, prompts.userPrompt)
      : await callAnthropic(prompts.systemPrompt, prompts.userPrompt)

    return parseProposalJson(responseText, prompts)
  } catch (error) {
    console.error('Error generating proposal:', error)
    const msg = error?.message || 'Unknown error'
    if (msg.includes('401') || msg.toLowerCase().includes('auth')) {
      throw new Error('Invalid API key. Check ANTHROPIC_API_KEY in your .env file.')
    }
    if (msg.includes('credit') || msg.includes('billing') || msg.includes('insufficient')) {
      throw new Error('API credits exhausted. Add credits to your OpenRouter or Anthropic account.')
    }
    throw new Error(`Failed to generate proposal: ${msg}`)
  }
}
