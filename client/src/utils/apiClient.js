/**
 * Safely parse JSON from a fetch Response.
 * Avoids "Unexpected end of JSON input" when the body is empty (proxy/backend down).
 */
export async function parseJsonResponse(response) {
  const text = await response.text()
  if (!text || !text.trim()) {
    return null
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(
      'Server returned an invalid response. Ensure the backend is running (bash ios.sh) and try again.'
    )
  }
}

export function getApiErrorMessage(response, data) {
  if (data?.details && typeof data.details === 'object') {
    return Object.values(data.details).join('. ')
  }
  return data?.message || data?.error || `Request failed (${response.status})`
}

export function getFetchErrorMessage(err) {
  if (err?.message?.includes('JSON')) {
    return 'Cannot reach the API server. Start the app with: bash ios.sh (backend must run on port 5001).'
  }
  if (err?.name === 'TypeError' && /fetch|network/i.test(err.message)) {
    return 'Network error — is the backend running? Use: bash ios.sh'
  }
  return err?.message || 'Failed to generate proposal. Please try again.'
}
