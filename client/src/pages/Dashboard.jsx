import React, { useState } from 'react'

import { useNavigate } from 'react-router-dom'

import toast from 'react-hot-toast'

import ProposalForm from '../components/ProposalForm'

import ProposalOutput from '../components/ProposalOutput'

import SavedProposals from '../components/SavedProposals'

import { clearSession, getCurrentUser } from '../utils/auth'

import { saveProposal } from '../utils/proposalStorage'
import { getApiErrorMessage, getFetchErrorMessage, parseJsonResponse } from '../utils/apiClient'



function Dashboard() {

  const navigate = useNavigate()

  const user = getCurrentUser() || {}

  const [activeTab, setActiveTab] = useState('create')

  const [proposal, setProposal] = useState(null)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)



  const handleGenerateProposal = async (formData) => {

    setLoading(true)

    setError(null)

    setProposal(null)

    setActiveTab('create')

    try {

      const response = await fetch('/api/proposal/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await parseJsonResponse(response)

      if (!response.ok) {
        if (!data) {
          throw new Error(
            response.status === 502 || response.status === 504
              ? 'Backend server is not running. From the project folder run: bash ios.sh'
              : 'Server returned an empty error. Check that the backend is running on port 5001 and .env has a valid API key.'
          )
        }
        throw new Error(getApiErrorMessage(response, data))
      }

      if (!data) {
        throw new Error(
          'Server returned an empty response. Restart with bash ios.sh and confirm ANTHROPIC_API_KEY is set in .env.'
        )
      }

      setProposal({ ...data, formData })
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError(getFetchErrorMessage(err))

      setProposal(null)

    } finally {

      setLoading(false)

    }

  }



  const handleSaveProposal = () => {

    if (!proposal || !user.email) return

    const saved = saveProposal(

      { ...proposal, savedId: proposal.savedId || proposal.id },

      user.email

    )

    setProposal({ ...proposal, savedId: saved.id, id: saved.id })

    toast.success('Proposal saved!', { icon: '💾' })

  }



  const handleSelectSaved = (saved) => {

    const { userEmail, savedAt, formData, ...proposalData } = saved

    setProposal({ ...proposalData, savedId: saved.id, id: saved.id, formData })

    setError(null)

    setActiveTab('create')

    toast.success('Proposal loaded')

  }



  const handleLogout = () => {

    clearSession()

    navigate('/login', { replace: true })

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

                  <p className="text-white font-semibold">{user.fullName || 'User'}</p>

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

        <div className="flex gap-2 mb-6">

          <button

            type="button"

            onClick={() => setActiveTab('create')}

            className={`px-5 py-2 rounded-lg font-medium text-sm transition ${

              activeTab === 'create'

                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'

                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'

            }`}

          >

            Create Proposal

          </button>

          <button

            type="button"

            onClick={() => setActiveTab('saved')}

            className={`px-5 py-2 rounded-lg font-medium text-sm transition ${

              activeTab === 'saved'

                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'

                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'

            }`}

          >

            Saved Proposals

          </button>

        </div>



        {activeTab === 'create' ? (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl h-fit">

              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">

                <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg text-sm font-bold text-white">1</span>

                Project Information

              </h2>

              <p className="text-gray-400 text-sm mb-6">Fill in your project details</p>

              <ProposalForm onSubmit={handleGenerateProposal} loading={loading} />

            </div>



            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">

              <div className="flex justify-between items-start mb-6">

                <div>

                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">

                    <span className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg text-sm font-bold text-white">2</span>

                    Generated Proposal

                  </h2>

                  <p className="text-gray-400 text-sm">Your AI-generated proposal will appear here</p>

                </div>

                {proposal && (

                  <button

                    type="button"

                    onClick={handleSaveProposal}

                    className="px-4 py-2 text-sm font-semibold bg-white/10 hover:bg-white/20 text-cyan-300 border border-cyan-500/30 rounded-lg transition flex items-center gap-2"

                  >

                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />

                    </svg>

                    Save

                  </button>

                )}

              </div>

              <ProposalOutput

                proposal={proposal}

                loading={loading}

                error={error}

                onProposalUpdate={setProposal}

              />

            </div>

          </div>

        ) : (

          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl max-w-3xl">

            <h2 className="text-2xl font-bold text-white mb-2">Saved Proposals</h2>

            <p className="text-gray-400 text-sm mb-6">Search and open your previously saved proposals</p>

            <SavedProposals userEmail={user.email} onSelect={handleSelectSaved} />

          </div>

        )}

      </main>



      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-xl py-6 mt-12">

        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">

          <p>ProposalAI © 2026 | Powered by Claude Haiku & React</p>

        </div>

      </footer>

    </div>

  )

}



export default Dashboard

