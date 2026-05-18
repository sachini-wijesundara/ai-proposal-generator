const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const isValidEmail = (email) => {
  const trimmed = (email || '').trim()
  if (!trimmed || trimmed.length > 254) return false
  return EMAIL_REGEX.test(trimmed)
}

const USERS_KEY = 'registeredUsers'
const SESSION_USER_KEY = 'user'
const SESSION_TOKEN_KEY = 'authToken'

const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const isAuthenticated = () => {
  return Boolean(localStorage.getItem(SESSION_TOKEN_KEY))
}

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_USER_KEY) || 'null')
  } catch {
    return null
  }
}

export const setSession = (user) => {
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user))
  localStorage.setItem(SESSION_TOKEN_KEY, `token_${Date.now()}`)
  window.dispatchEvent(new Event('auth-change'))
}

export const clearSession = () => {
  localStorage.removeItem(SESSION_USER_KEY)
  localStorage.removeItem(SESSION_TOKEN_KEY)
  window.dispatchEvent(new Event('auth-change'))
}

export const registerUser = ({ fullName, email, password }) => {
  const trimmedEmail = (email || '').trim()

  if (!isValidEmail(trimmedEmail)) {
    throw new Error('Please enter a valid email address (e.g. name@example.com)')
  }

  const normalizedEmail = trimmedEmail.toLowerCase()
  const users = getUsers()

  if (users.some((u) => u.email === normalizedEmail)) {
    throw new Error('An account with this email already exists')
  }

  const newUser = {
    id: Date.now(),
    fullName: fullName.trim(),
    email: normalizedEmail,
    password,
  }

  users.push(newUser)
  saveUsers(users)

  const { password: _, ...safeUser } = newUser
  return safeUser
}

export const loginUser = ({ email, password }) => {
  const trimmedEmail = (email || '').trim()

  if (!isValidEmail(trimmedEmail)) {
    throw new Error('Please enter a valid email address')
  }

  const normalizedEmail = trimmedEmail.toLowerCase()
  const users = getUsers()
  const user = users.find((u) => u.email === normalizedEmail)

  if (!user) {
    throw new Error('No account found with this email. Please sign up first.')
  }

  if (user.password !== password) {
    throw new Error('Incorrect password. Please try again.')
  }

  const { password: _, ...safeUser } = user
  setSession(safeUser)
  return safeUser
}

export const resetPassword = ({ email, newPassword }) => {
  const trimmedEmail = (email || '').trim()

  if (!isValidEmail(trimmedEmail)) {
    throw new Error('Please enter a valid email address')
  }

  const normalizedEmail = trimmedEmail.toLowerCase()
  const users = getUsers()
  const userIndex = users.findIndex((u) => u.email === normalizedEmail)

  if (userIndex === -1) {
    throw new Error('No account found with this email. Please sign up first.')
  }

  users[userIndex] = { ...users[userIndex], password: newPassword }
  saveUsers(users)
  return true
}
