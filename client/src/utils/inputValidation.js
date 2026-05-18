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
  const trimmed = typeof value === 'string' ? value.trim() : ''

  if (required && !trimmed) {
    const labels = {
      clientName: 'Client name',
      companyName: 'Company name',
      projectTitle: 'Project title',
      projectDescription: 'Project description',
      requiredFeatures: 'Required features',
      platformType: 'Platform type',
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
    if (
      compact.length >= 30 &&
      /[a-z]/i.test(compact) &&
      !/[aeiou]/i.test(compact)
    ) {
      return 'Please enter valid project details in plain language.'
    }
  }

  return null
}

export function getFirstFormError(errors) {
  const order = [
    'clientName',
    'companyName',
    'projectTitle',
    'projectDescription',
    'requiredFeatures',
    'budgetRange',
    'timeline',
    'platformType',
  ]
  for (const field of order) {
    if (errors[field]) return errors[field]
  }
  return 'Please fix the errors in the form before generating.'
}

export function validateProposalForm(formData) {
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
    const err = validateField(field, formData[field], opts)
    if (err) errors[field] = err
  }

  const validPlatforms = ['Web', 'Mobile', 'Desktop', 'Both Web & Mobile']
  if (!formData.platformType || !validPlatforms.includes(formData.platformType)) {
    errors.platformType = 'Please select a valid platform type'
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
