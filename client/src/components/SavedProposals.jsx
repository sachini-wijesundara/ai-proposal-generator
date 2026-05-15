import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { deleteProposal, searchProposals } from '../utils/proposalStorage'

function SavedProposals({ userEmail, onSelect }) {
  const [query, setQuery] = useState('')
  const [proposals, setProposals] = useState([])

  const loadProposals = () => {
    setProposals(searchProposals(userEmail, query))
  }

  useEffect(() => {
    loadProposals()
    window.addEventListener('proposals-change', loadProposals)
    return () => window.removeEventListener('proposals-change', loadProposals)
  }, [userEmail, query])

  const handleDelete = (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    deleteProposal(id, userEmail)
    toast.success('Proposal deleted')
    loadProposals()
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by client name, company, or title..."
          className="w-full px-4 py-3 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
        <svg
          className="absolute left-3 top-3.5 w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {proposals.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No saved proposals yet</p>
          <p className="text-sm mt-2">Generate a proposal and click Save to store it here</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[32rem] overflow-y-auto pr-2">
          {proposals.map((item) => (
            <li
              key={item.id}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/30 transition group"
            >
              <div className="flex justify-between items-start gap-3">
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="text-left flex-1"
                >
                  <p className="text-white font-semibold group-hover:text-cyan-300 transition">
                    {item.title || item.projectTitle || 'Untitled Proposal'}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {item.clientName} · {item.companyName}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Saved {new Date(item.savedAt).toLocaleDateString()}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.title || item.clientName)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                  title="Delete proposal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SavedProposals
