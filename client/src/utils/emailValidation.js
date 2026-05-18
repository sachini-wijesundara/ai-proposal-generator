const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Reserved / obvious fake domains (not real inboxes)
const BLOCKED_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'test.test',
  'fake.com',
  'invalid.com',
  'localhost.com',
  'email.test',
  'mail.test',
])

// Common disposable / temporary email providers
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'mailinator.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'throwaway.email',
  '10minutemail.com',
  '10minutemail.net',
  'trashmail.com',
  'trashmail.me',
  'trashmail.net',
  'getnada.com',
  'nada.ltd',
  'fakeinbox.com',
  'dispostable.com',
  'maildrop.cc',
  'mailnesia.com',
  'mintemail.com',
  'mytemp.email',
  'tempail.com',
  'tempr.email',
  'discard.email',
  'discardmail.com',
  'dropmail.me',
  'emailondeck.com',
  'getairmail.com',
  'inboxkitten.com',
  'mailcatch.com',
  'mailpoof.com',
  'mohmal.com',
  'tempinbox.com',
  'tmpmail.net',
  'tmpmail.org',
])

// e.g. test@test.com, fake@fake.com, a@b.co
const FAKE_EMAIL_PATTERNS = [
  /^test@test\./i,
  /^fake@fake\./i,
  /^dummy@dummy\./i,
  /^user@user\./i,
  /^admin@admin\./i,
  /^test@test$/i,
  /^fake@fake$/i,
  /^[a-z]@[a-z]\.[a-z]{2}$/i,
]

const getDomain = (email) => email.split('@')[1]?.toLowerCase() || ''

export const validateEmail = (email) => {
  const trimmed = (email || '').trim()

  if (!trimmed) {
    return { valid: false, message: 'Email is required' }
  }

  if (trimmed.length > 254) {
    return { valid: false, message: 'Email is too long' }
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      valid: false,
      message: 'Please enter a valid email address (e.g. name@gmail.com)',
    }
  }

  const normalized = trimmed.toLowerCase()
  const domain = getDomain(normalized)

  if (BLOCKED_DOMAINS.has(domain)) {
    return {
      valid: false,
      message: 'Test or fake email domains are not allowed. Use a real email (Gmail, Outlook, Yahoo, etc.).',
    }
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      message: 'Temporary/disposable emails are not allowed. Use your real email address.',
    }
  }

  if (FAKE_EMAIL_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return {
      valid: false,
      message: 'Please use a real email address, not a test or fake one.',
    }
  }

  // Domain must have a real-looking name (not just 1–2 chars before TLD)
  const domainParts = domain.split('.')
  const domainName = domainParts[0] || ''
  if (domainName.length < 3) {
    return {
      valid: false,
      message: 'Please use a valid email domain (e.g. gmail.com, outlook.com).',
    }
  }

  return { valid: true, message: '' }
}

export const isValidEmail = (email) => validateEmail(email).valid

export const getEmailValidationMessage = (email) => validateEmail(email).message
