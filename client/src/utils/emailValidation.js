const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

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

// Blocked username part (before @) — applies to gmail.com, outlook.com, etc.
const BLOCKED_LOCAL_PARTS = new Set([
  'test',
  'fake',
  'dummy',
  'admin',
  'user',
  'guest',
  'temp',
  'tmp',
  'trash',
  'spam',
  'demo',
  'sample',
  'null',
  'void',
  'none',
  'na',
  'asdf',
  'qwerty',
  'abcd',
  'xyz',
  'aaa',
  'bbb',
  'xxx',
  '123',
  '1234',
  'tester',
  'testing',
  'faker',
  'anonymous',
  'nobody',
  'noone',
  'donotreply',
  'noreply',
  'mail',
  'email',
  'account',
  'name',
  'person',
  'someone',
  'something',
  'whatever',
  'random',
  'notreal',
  'invalid',
])

const FAKE_LOCAL_PATTERNS = [
  /^test\d*$/i,
  /^fake\d*$/i,
  /^dummy\d*$/i,
  /^temp\d*$/i,
  /^user\d+$/i,
  /^admin\d*$/i,
  /^sample\d*$/i,
  /^demo\d*$/i,
  /^asdf\d*$/i,
  /^abc\d*$/i,
  /^xyz\d*$/i,
  /^[a-z]{1,2}\d+$/i,
  /^(.)\1{3,}$/i,
  /^\d+$/,
]

const FAKE_EMAIL_PATTERNS = [
  /^test@test\./i,
  /^fake@fake\./i,
  /^dummy@dummy\./i,
  /^user@user\./i,
  /^admin@admin\./i,
]

const GMAIL_DOMAINS = new Set(['gmail.com', 'googlemail.com'])

const getDomain = (email) => email.split('@')[1]?.toLowerCase() || ''

const getLocalPart = (email) => {
  let local = email.split('@')[0]?.toLowerCase() || ''
  const plusIndex = local.indexOf('+')
  if (plusIndex !== -1) {
    local = local.slice(0, plusIndex)
  }
  const domain = getDomain(email)
  if (GMAIL_DOMAINS.has(domain)) {
    local = local.replace(/\./g, '')
  }
  return local
}

const hasVowel = (text) => /[aeiou]/i.test(text)

// Catches random typing like stttf@gmail.com, bcdfgh@outlook.com
const looksLikeRandomString = (local) => {
  if (local.length >= 4 && !hasVowel(local)) {
    return {
      random: true,
      reason:
        'This email looks random or fake (e.g. stttf@gmail.com). Use your real email based on your name.',
    }
  }

  if (local.length >= 5) {
    const vowelCount = (local.match(/[aeiou]/gi) || []).length
    if (vowelCount / local.length < 0.15) {
      return {
        random: true,
        reason: 'Please use a real email address that matches your name.',
      }
    }
  }

  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(local)) {
    return {
      random: true,
      reason: 'This email username looks random. Use your real email (e.g. yourname@gmail.com).',
    }
  }

  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', 'stttf', 'hjkl']
  if (keyboardPatterns.some((pat) => local.includes(pat))) {
    return {
      random: true,
      reason: 'Please use your real email address, not random keyboard characters.',
    }
  }

  return { random: false, reason: '' }
}

const getNameParts = (fullName) =>
  (fullName || '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ''))
    .filter((w) => w.length >= 3)

const emailMatchesName = (local, fullName) => {
  const parts = getNameParts(fullName)
  if (parts.length === 0) return false

  return parts.some((part) => {
    if (local.includes(part)) return true

    if (parts.length >= 2) {
      const first = parts[0]
      const last = parts[parts.length - 1]
      const withInitial = first[0] + last
      if (local.includes(withInitial) && local.length >= 4) return true
      if (local.includes(first + last)) return true
      if (local.includes(first) && local.includes(last)) return true
    }
    return false
  })
}

const isFakeLocalPart = (local) => {
  if (!local || local.length < 3) {
    return { fake: true, reason: 'Email username is too short. Use your real email address.' }
  }

  const randomCheck = looksLikeRandomString(local)
  if (randomCheck.random) {
    return { fake: true, reason: randomCheck.reason }
  }

  if (BLOCKED_LOCAL_PARTS.has(local)) {
    return {
      fake: true,
      reason: 'Please use your real email address, not a test or placeholder (e.g. not fake@gmail.com).',
    }
  }

  if (FAKE_LOCAL_PATTERNS.some((pattern) => pattern.test(local))) {
    return {
      fake: true,
      reason: 'Please use your real email address, not a test or fake one.',
    }
  }

  for (const blocked of BLOCKED_LOCAL_PARTS) {
    if (local.startsWith(blocked) && local.length <= blocked.length + 3) {
      return {
        fake: true,
        reason: 'Please use your real email address, not a test or placeholder.',
      }
    }
  }

  return { fake: false, reason: '' }
}

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
      message: 'Please enter a valid email address (e.g. yourname@gmail.com)',
    }
  }

  const normalized = trimmed.toLowerCase()
  const domain = getDomain(normalized)
  const localPart = getLocalPart(normalized)

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

  const localCheck = isFakeLocalPart(localPart)
  if (localCheck.fake) {
    return { valid: false, message: localCheck.reason }
  }

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

/** Stricter check for signup: email must look real AND match the user's name */
export const validateEmailForSignup = (email, fullName) => {
  const base = validateEmail(email)
  if (!base.valid) return base

  const normalized = (email || '').trim().toLowerCase()
  const localPart = getLocalPart(normalized)

  if (!emailMatchesName(localPart, fullName)) {
    return {
      valid: false,
      message:
        'Email must match your name (e.g. sanjika.perera@gmail.com). Random emails like stttf@gmail.com are not allowed.',
    }
  }

  return { valid: true, message: '' }
}

export const isValidEmail = (email) => validateEmail(email).valid

export const getEmailValidationMessage = (email) => validateEmail(email).message
