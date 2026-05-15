import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { downloadProposalPdf } from '../utils/exportPdf'

function ProposalOutput({ proposal, loading, error, onProposalUpdate }) {
  const [editingSection, setEditingSection] = useState(null)
  const [editedContent, setEditedContent] = useState({})
  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
        </div>
        <p className="text-gray-300 font-semibold">Generating your proposal...</p>
        <p className="text-sm text-gray-400">This may take a few moments</p>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded">
        <div className="flex gap-3">
          <svg className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-300 font-semibold">Error Generating Proposal</h3>
            <p className="text-red-200 text-sm mt-1">{error}</p>
            <p className="text-red-300/80 text-xs mt-2">Please check your input fields and try again.</p>
          </div>
        </div>
      </div>
    )
  }

  // Empty State
  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <svg className="h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-300 text-lg">Your proposal will appear here</p>
        <p className="text-gray-400 text-sm mt-2">Fill in the form and click Generate Proposal to get started</p>
      </div>
    )
  }

  const handleEditClick = (section) => {
    setEditingSection(section)
    setEditedContent({
      ...editedContent,
      [section]: editedContent[section] || proposal[section]
    })
  }

  const handleSaveClick = (section) => {
    const updated = { ...proposal, [section]: editedContent[section] }
    onProposalUpdate?.(updated)
    setEditingSection(null)
    toast.success('Section updated!')
  }

  const handleCancelClick = () => {
    setEditingSection(null)
    setEditedContent({})
  }

  const handleCopyProposal = () => {
    const text = `${proposal.title}

Client: ${proposal.clientName}
Company: ${proposal.companyName}
Date: ${proposal.date}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTRODUCTION

${proposal.introduction}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UNDERSTANDING YOUR REQUIREMENTS

${proposal.requirementUnderstanding}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROPOSED SOLUTION

${proposal.proposedSolution}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY FEATURES & DELIVERABLES

${proposal.featuresList?.map((f, i) => `${i + 1}. ${f}`).join('\n') || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROJECT TIMELINE

${proposal.timeline}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INVESTMENT & BUDGET

${proposal.budget}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS & CONCLUSION

${proposal.conclusion}`

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Proposal copied to clipboard!', {
        icon: '📋',
        duration: 3000
      })
    }).catch(() => {
      toast.error('Failed to copy proposal')
    })
  }

  const EditableSection = ({ title, sectionKey, icon }) => {
    const isEditing = editingSection === sectionKey
    const content = editedContent[sectionKey] !== undefined ? editedContent[sectionKey] : proposal[sectionKey]

    return (
      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-white">
            {icon} {title}
          </h3>
          {!isEditing && (
            <button
              onClick={() => handleEditClick(sectionKey)}
              className="p-1 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded transition"
              title="Edit section"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setEditedContent({ ...editedContent, [sectionKey]: e.target.value })}
              className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              rows="6"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveClick(sectionKey)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save
              </button>
              <button
                onClick={handleCancelClick}
                className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition font-semibold flex items-center justify-center gap-2 text-sm"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{content}</p>
        )}
      </div>
    )
  }

  // Proposal Display
  return (
    <div className="space-y-6 max-h-[36rem] overflow-y-auto pr-4">
      <Toaster position="top-right" />

      {/* Document Header with Copy Button */}
      <div className="border-b-2 border-cyan-500/50 pb-6 sticky top-0 bg-slate-900/80 backdrop-blur space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{proposal.title}</h2>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span><strong>Client:</strong> {proposal.clientName}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span><strong>Company:</strong> {proposal.companyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5H4v8a2 2 0 002 2h12a2 2 0 002-2V7h-2v1a1 1 0 11-2 0V7H9v1a1 1 0 11-2 0V7H6v1a1 1 0 11-2 0V7z" clipRule="evenodd" />
                </svg>
                <span><strong>Date:</strong> {proposal.date}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleCopyProposal}
            className="bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 transition font-semibold flex items-center gap-2 whitespace-nowrap text-sm"
            title="Copy entire proposal to clipboard"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Proposal
          </button>
        </div>
      </div>

      {/* Introduction */}
      <EditableSection title="Introduction" sectionKey="introduction" icon="📋" />

      {/* Requirement Understanding */}
      <EditableSection title="Understanding Your Requirements" sectionKey="requirementUnderstanding" icon="🎯" />

      {/* Proposed Solution */}
      <EditableSection title="Proposed Solution" sectionKey="proposedSolution" icon="💡" />

      {/* Features List */}
      {proposal.featuresList && Array.isArray(proposal.featuresList) && proposal.featuresList.length > 0 && (
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">✨ Key Features & Deliverables</h3>
          <ul className="space-y-2">
            {proposal.featuresList.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-gray-300 text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline */}
      <EditableSection title="Project Timeline" sectionKey="timeline" icon="⏱️" />

      {/* Budget */}
      <EditableSection title="Investment & Budget" sectionKey="budget" icon="💰" />

      {/* Conclusion */}
      <EditableSection title="Next Steps & Conclusion" sectionKey="conclusion" icon="🎬" />

      {/* Action Buttons */}
      <div className="border-t border-white/10 pt-4 mt-8 flex gap-2 sticky bottom-0 bg-slate-900/80 backdrop-blur">
        <button 
          onClick={() => {
            const featureText = proposal.featuresList?.join('\n') || ''
            const text = `${proposal.title}\n\nClient: ${proposal.clientName}\nCompany: ${proposal.companyName}\nDate: ${proposal.date}\n\n${proposal.introduction}\n\n${proposal.requirementUnderstanding}\n\n${proposal.proposedSolution}\n\nFeatures:\n${featureText}\n\n${proposal.timeline}\n\n${proposal.budget}\n\n${proposal.conclusion}`
            navigator.clipboard.writeText(text)
            toast.success('Copied to clipboard!', {
              icon: '✅'
            })
          }}
          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 text-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Text
        </button>
        <button
          onClick={() => {
            try {
              downloadProposalPdf(proposal)
              toast.success('PDF downloaded!', { icon: '📄' })
            } catch {
              toast.error('Failed to generate PDF')
            }
          }}
          className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 text-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Download PDF
        </button>
      </div>
    </div>
  )
}

export default ProposalOutput
