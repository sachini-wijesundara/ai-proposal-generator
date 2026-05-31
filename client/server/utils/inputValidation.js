const FIELD_LIMITS = {
  clientName: 100,
  companyName: 100,
  projectTitle: 200,
  projectDescription: 5000,
  requiredFeatures: 3000,
  budgetRange: 100,
  timeline: 100,
}

const MALICIOUS_PATTERNS = [
  { pattern: /<script[\s>]/i, message: 'HTML scripts are not allowed' },
  { pattern: /<\/script>/i, message: 'HTML scripts are not allowed' },
  { pattern: /<iframe/i, message: 'Embedded content is not allowed' },
  { pattern: /<object/i, message: 'Embedded content is not allowed' },
  { pattern: /<embed/i, message: 'Embedded content is not allowed' },
  { pattern: /javascript\s*:/i, message: 'JavaScript URLs are not allowed' },
  { pattern: /on\w+\s*=/i, message: 'Event handlers are not allowed' },
  { pattern: /<\s*img[^>]*on\w+/i, message: 'Invalid HTML detected' },
  { pattern: /data\s*:\s*text\/html/i, message: 'Data URLs are not allowed' },
  { pattern: /<\?php/i, message: 'Code injection is not allowed' },
  { pattern: /\bunion\s+select\b/i, message: 'SQL commands are not allowed' },
  { pattern: /\bdrop\s+table\b/i, message: 'SQL commands are not allowed' },
  { pattern: /\binsert\s+into\b/i, message: 'SQL commands are not allowed' },
  { pattern: /\bdelete\s+from\b/i, message: 'SQL commands are not allowed' },
  { pattern: /'\s*or\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i, message: 'SQL injection patterns are not allowed' },
  { pattern: /;\s*drop\s+/i, message: 'SQL commands are not allowed' },
  { pattern: /\.\.\//, message: 'Path traversal is not allowed' },
  { pattern: /\beval\s*\(/i, message: 'Code execution is not allowed' },
  { pattern: /document\.(cookie|write)/i, message: 'Script injection is not allowed' },
]

const SHORT_TEXT_PATTERN = /^[a-zA-Z0-9\s.'\-&,()]+$/

const KEYBOARD_GIBBERISH_PATTERNS = [
  /asdf/i, /qwert/i, /zxcv/i, /hjkl/i, /sdfgh/i, /fghjk/i, /jklq/i, /qwer/i, /yuio/i,
]

function isWordLike(token) {
  const clean = token.replace(/[^a-zA-Z]/g, '')
  if (clean.length < 3) return true
  if (clean.length <= 4 && clean === clean.toUpperCase()) return true
  return /[aeiou]/i.test(clean)
}

function validateMeaningfulLongText(value, { minWords, label }) {
  const trimmed = value.trim()
  for (const pattern of KEYBOARD_GIBBERISH_PATTERNS) {
    if (pattern.test(trimmed)) {
      return `Please enter real ${label}, not random keyboard text.`
    }
  }
  const words = trimmed.split(/[\s,;]+/).map((w) => w.trim()).filter(Boolean)
  if (words.length < minWords) {
    return `${label} must include at least ${minWords} real words describing the project.`
  }
  const substantial = words.filter((w) => w.replace(/[^a-zA-Z]/g, '').length >= 3)
  if (substantial.length < Math.max(2, minWords - 1)) {
    return `Please use clear sentences for ${label.toLowerCase()}, not random characters.`
  }
  const readableWords = substantial.filter(isWordLike).length
  if (readableWords / substantial.length < 0.7) {
    return `Please enter meaningful ${label.toLowerCase()} in plain language, not gibberish.`
  }
  const compact = trimmed.replace(/\s/g, '')
  if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(compact)) {
    return `Please enter readable ${label.toLowerCase()}, not random letters.`
  }
  const compactLower = compact.toLowerCase()
  const uniqueRatio = new Set(compactLower).size / compactLower.length
  if (compactLower.length >= 40 && uniqueRatio > 0.82 && words.length < 10) {
    return `Please enter real ${label.toLowerCase()}, not random text.`
  }
  const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length
  if (letterCount / trimmed.length < 0.65) {
    return `${label} must use mostly letters and normal punctuation.`
  }
  return null
}

function checkMalicious(value) {
  if (!value || typeof value !== 'string') return null
  for (const { pattern, message } of MALICIOUS_PATTERNS) {
    if (pattern.test(value)) return message
  }
  return null
}

function checkMaxLength(fieldName, value) {
  const max = FIELD_LIMITS[fieldName]
  if (max && value && value.length > max) {
    return `Must be ${max} characters or fewer`
  }
  return null
}

export function validateField(fieldName, value, { required = false, minLength = 0, shortText = false } = {}) {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    return 'Must be a text value'
  }

  const trimmed = typeof value === 'string' ? value.trim() : ''

  if (required && !trimmed) {
    const labels = {
      clientName: 'Client name',
      companyName: 'Company name',
      projectTitle: 'Project title',
      projectDescription: 'Project description',
      requiredFeatures: 'Required features',
    }
    return `${labels[fieldName] || fieldName} is required`
  }

  if (!trimmed) return null

  const malicious = checkMalicious(trimmed)
  if (malicious) {
    return `${malicious}. Please use plain text only.`
  }

  const tooLong = checkMaxLength(fieldName, trimmed)
  if (tooLong) return tooLong

  if (minLength > 0 && trimmed.length < minLength) {
    return `Must be at least ${minLength} characters`
  }

  if (shortText && !SHORT_TEXT_PATTERN.test(trimmed)) {
    return 'Contains invalid characters. Use letters, numbers, and common punctuation only.'
  }

  if (fieldName === 'projectDescription' || fieldName === 'requiredFeatures') {
    const compact = trimmed.replace(/\s/g, '')
    if (compact.length >= 20 && /^(.)\1{14,}$/.test(compact)) {
      return 'Please enter meaningful project details, not repeated characters.'
    }
    if (compact.length >= 30 && /[a-z]/i.test(compact) && !/[aeiou]/i.test(compact)) {
      return 'Please enter valid project details in plain language.'
    }
    const meaningfulError = validateMeaningfulLongText(trimmed, {
      minWords: fieldName === 'projectDescription' ? 6 : 3,
      label: fieldName === 'projectDescription' ? 'Project description' : 'Required features',
    })
    if (meaningfulError) return meaningfulError
  }

  return null
}

export function validateProposalPayload(body) {
  const errors = {}

  const checks = [
    { field: 'clientName', required: true, minLength: 2, shortText: true },
    { field: 'companyName', required: true, minLength: 2, shortText: true },
    { field: 'projectTitle', required: true, minLength: 2, shortText: true },
    { field: 'projectDescription', required: true, minLength: 50 },
    { field: 'requiredFeatures', required: true, minLength: 10 },
    { field: 'budgetRange', required: false },
    { field: 'timeline', required: false, shortText: true },
  ]

  for (const { field, ...opts } of checks) {
    const err = validateField(field, body[field], opts)
    if (err) errors[field] = err
  }

  const validPlatforms = ['Web', 'Mobile', 'Desktop', 'Both Web & Mobile']
  if (!body.platformType || !validPlatforms.includes(body.platformType)) {
    errors.platformType = 'Please select a valid platform type'
  }

  return errors
}
