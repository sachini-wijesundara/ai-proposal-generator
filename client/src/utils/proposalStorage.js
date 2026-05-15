const STORAGE_KEY = 'savedProposals'

const getAllProposals = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const persist = (proposals) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals))
  window.dispatchEvent(new Event('proposals-change'))
}

export const saveProposal = (proposal, userEmail) => {
  const proposals = getAllProposals()
  const entry = {
    id: proposal.savedId || `prop_${Date.now()}`,
    userEmail,
    savedAt: new Date().toISOString(),
    ...proposal,
  }

  const existingIndex = proposals.findIndex((p) => p.id === entry.id)
  if (existingIndex >= 0) {
    proposals[existingIndex] = entry
  } else {
    proposals.unshift(entry)
  }

  persist(proposals)
  return entry
}

export const getProposalsForUser = (userEmail) => {
  return getAllProposals().filter((p) => p.userEmail === userEmail)
}

export const searchProposals = (userEmail, query) => {
  const q = query.trim().toLowerCase()
  const userProposals = getProposalsForUser(userEmail)
  if (!q) return userProposals

  return userProposals.filter((p) => {
    const haystack = [
      p.title,
      p.clientName,
      p.companyName,
      p.projectTitle,
      p.introduction,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

export const deleteProposal = (id, userEmail) => {
  const proposals = getAllProposals().filter(
    (p) => !(p.id === id && p.userEmail === userEmail)
  )
  persist(proposals)
}

export const getProposalById = (id, userEmail) => {
  return getAllProposals().find((p) => p.id === id && p.userEmail === userEmail) || null
}
