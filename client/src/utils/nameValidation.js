const NAME_REGEX = /^[a-zA-Z][a-zA-Z\s'.-]*[a-zA-Z.]$|^[a-zA-Z]{2,}$/

const BLOCKED_NAMES = new Set([
  'test',
  'fake',
  'dummy',
  'admin',
  'user',
  'guest',
  'anonymous',
  'asdf',
  'qwerty',
  'sample',
  'null',
  'undefined',
  'abcd',
  'xyz',
  'aaa',
  'bbb',
  'xxx',
  'name',
  'noone',
  'nobody',
  'none',
  'na',
  'n/a',
  'testing',
  'faker',
  'spam',
  'bot',
  'demo',
  'temp',
  'tmp',
  'trash',
  'random',
  'person',
  'account',
])

const BLOCKED_NAME_PHRASES = [
  'test user',
  'fake user',
  'dummy user',
  'test account',
  'fake name',
  'random user',
  'sample user',
]

export const validateFullName = (name) => {
  const trimmed = (name || '').trim().replace(/\s+/g, ' ')

  if (!trimmed) {
    return { valid: false, message: 'Full name is required' }
  }

  if (trimmed.length < 2) {
    return { valid: false, message: 'Full name must be at least 2 characters' }
  }

  if (trimmed.length > 80) {
    return { valid: false, message: 'Full name is too long' }
  }

  if (!NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    }
  }

  if (/\d/.test(trimmed)) {
    return { valid: false, message: 'Name cannot contain numbers' }
  }

  if (/(.)\1{3,}/i.test(trimmed.replace(/\s/g, ''))) {
    return { valid: false, message: 'Please enter a real name' }
  }

  const lower = trimmed.toLowerCase()

  if (BLOCKED_NAME_PHRASES.includes(lower)) {
    return {
      valid: false,
      message: 'Please enter your real full name, not a test or placeholder',
    }
  }

  if (BLOCKED_NAMES.has(lower)) {
    return {
      valid: false,
      message: 'Please enter your real full name, not a test or placeholder name',
    }
  }

  const words = lower.split(' ').filter(Boolean)

  for (const word of words) {
    if (BLOCKED_NAMES.has(word)) {
      return {
        valid: false,
        message: `"${word}" is not allowed. Please enter your real full name`,
      }
    }
    if (word.length < 2) {
      return {
        valid: false,
        message: 'Each part of your name must be at least 2 letters',
      }
    }
  }

  if (words.length < 2) {
    return {
      valid: false,
      message: 'Please enter your full name (first and last name, e.g. John Smith)',
    }
  }

  return { valid: true, message: '' }
}

export const isValidFullName = (name) => validateFullName(name).valid
