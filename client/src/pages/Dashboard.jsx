import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProposalForm from '../components/ProposalForm'
import ProposalOutput from '../components/ProposalOutput'

function Dashboard() {
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleGenerateProposal = async (formData) => {
    setLoading(true)
    setError(null)
    setProposal(null)
    try {
      const response = await fetch('/api/proposal/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate proposal')
      }
      
      const data = await response.json()
      setProposal(data)
      setError(null)
    } catch (error) {
      console.error('Error:', error)
      setError(error.message || 'Error generating proposal. Please check your input and try again.')
      setProposal(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">ProposalAI</h1>
                <p className="text-gray-400 text-sm">Generate professional proposals instantly with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="text-white font-semibold">{user.fullName || user.email}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl h-fit">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg text-sm font-bold text-white">1</span>
              Project Information
            </h2>
            <p className="text-gray-400 text-sm mb-6">Fill in your project details</p>
            <ProposalForm onSubmit={handleGenerateProposal} loading={loading} />
          </div>

          {/* Output Section */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg text-sm font-bold text-white">2</span>
              Generated Proposal
            </h2>
            <p className="text-gray-400 text-sm mb-6">Your AI-generated proposal will appear here</p>
            <ProposalOutput proposal={proposal} loading={loading} error={error} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-xl py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>ProposalAI © 2026 | Powered by Claude Haiku & React</p>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
