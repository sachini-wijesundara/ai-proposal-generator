import React, { useState, useCallback, useRef, useLayoutEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { downloadProposalPdf } from '../utils/exportPdf'

function ProposalSectionEditor({
  title,
  sectionKey,
  icon,
  content,
  isEditing,
  onEdit,
  onChange,
  onSave,
  onCancel,
}) {
  const textareaRef = useRef(null)

  useLayoutEffect(() => {
    if (isEditing && textareaRef.current) {
      const ta = textareaRef.current
      ta.focus({ preventScroll: true })
      const len = ta.value.length
      ta.setSelectionRange(len, len)
    }
  }, [isEditing])

  return (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-white">
          {icon} {title}
        </h3>
        {!isEditing && (
          <button
            type="button"
            onClick={() => onEdit(sectionKey)}
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
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(sectionKey, e.target.value)}
            className="w-full min-h-[12rem] px-4 py-3 bg-white/5 border-2 border-cyan-500/50 rounded-lg text-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-y"
            rows={8}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSave(sectionKey)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 text-sm"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition font-semibold text-sm"
            >
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

function ProposalOutput({ proposal, loading, error, onProposalUpdate }) {
  const [editingSection, setEditingSection] = useState(null)
  const [editedContent, setEditedContent] = useState({})
  const scrollRef = useRef(null)
  const scrollTopRef = useRef(0)

  useLayoutEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollTopRef.current
    }
  })

  const handleContentChange = useCallback((section, value) => {
    if (scrollRef.current) {
      scrollTopRef.current = scrollRef.current.scrollTop
    }
    setEditedContent((prev) => ({ ...prev, [section]: value }))
  }, [])

  const handleEditClick = useCallback((section) => {
    setEditingSection(section)
    setEditedContent((prev) => ({
      ...prev,
      [section]: prev[section] ?? proposal[section],
    }))
    requestAnimationFrame(() => {
      document.getElementById(`section-${section}`)?.scrollIntoView({ block: 'nearest' })
    })
  }, [proposal])

  const handleSaveClick = useCallback((section) => {
    onProposalUpdate?.({ ...proposal, [section]: editedContent[section] })
    setEditingSection(null)
    toast.success('Section updated!')
  }, [proposal, editedContent, onProposalUpdate])

  const handleCancelClick = useCallback(() => {
    setEditingSection(null)
  }, [])

  const getSectionContent = (sectionKey) => {
    if (editingSection === sectionKey && editedContent[sectionKey] !== undefined) {
      return editedContent[sectionKey]
    }
    return proposal?.[sectionKey]
  }

  const handleCopyProposal = () => {
    const text = `${proposal.title}

Client: ${proposal.clientName}
Company: ${proposal.companyName}
Date: ${proposal.date}

INTRODUCTION
${proposal.introduction}

UNDERSTANDING YOUR REQUIREMENTS
${proposal.requirementUnderstanding}

PROPOSED SOLUTION
${proposal.proposedSolution}

KEY FEATURES
${proposal.featuresList?.map((f, i) => `${i + 1}. ${f}`).join('\n') || 'N/A'}

TIMELINE
${proposal.timeline}

BUDGET
${proposal.budget}

CONCLUSION
${proposal.conclusion}`

    navigator.clipboard.writeText(text).then(() => {
      toast.success('Proposal copied to clipboard!', { icon: '📋' })
    }).catch(() => {
      toast.error('Failed to copy proposal')
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
        </div>
        <p className="text-gray-300 font-semibold">Generating your proposal...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded">
        <h3 className="text-red-300 font-semibold">Error Generating Proposal</h3>
        <p className="text-red-200 text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-gray-300 text-lg">Your proposal will appear here</p>
        <p className="text-gray-400 text-sm mt-2">Fill in the form and click Generate Proposal</p>
      </div>
    )
  }

  const sections = [
    { title: 'Introduction', sectionKey: 'introduction', icon: '📋' },
    { title: 'Understanding Your Requirements', sectionKey: 'requirementUnderstanding', icon: '🎯' },
    { title: 'Proposed Solution', sectionKey: 'proposedSolution', icon: '💡' },
    { title: 'Project Timeline', sectionKey: 'timeline', icon: '⏱️' },
    { title: 'Investment & Budget', sectionKey: 'budget', icon: '💰' },
    { title: 'Next Steps & Conclusion', sectionKey: 'conclusion', icon: '🎬' },
  ]

  return (
    <div
      ref={scrollRef}
      className="space-y-6 max-h-[36rem] overflow-y-auto pr-4"
      style={{ overflowAnchor: 'none' }}
    >
      <Toaster position="top-right" />

      <div className="border-b-2 border-cyan-500/50 pb-6">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{proposal.title}</h2>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
              <span><strong>Client:</strong> {proposal.clientName}</span>
              <span><strong>Company:</strong> {proposal.companyName}</span>
              <span><strong>Date:</strong> {proposal.date}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyProposal}
            className="bg-cyan-600 text-white py-2 px-4 rounded-lg hover:bg-cyan-700 text-sm font-semibold"
          >
            Copy Proposal
          </button>
        </div>
      </div>

      {sections.map(({ title, sectionKey, icon }) => (
        <div key={sectionKey} id={`section-${sectionKey}`}>
          <ProposalSectionEditor
            title={title}
            sectionKey={sectionKey}
            icon={icon}
            content={getSectionContent(sectionKey)}
            isEditing={editingSection === sectionKey}
            onEdit={handleEditClick}
            onChange={handleContentChange}
            onSave={handleSaveClick}
            onCancel={handleCancelClick}
          />
        </div>
      ))}

      {proposal.featuresList?.length > 0 && (
        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
          <h3 className="text-lg font-bold text-white mb-3">✨ Key Features & Deliverables</h3>
          <ul className="space-y-2">
            {proposal.featuresList.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-gray-300 text-sm">
                <span className="text-blue-400">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t border-white/10 pt-4 flex gap-2 pb-2">
        <button
          type="button"
          onClick={() => {
            const featureText = proposal.featuresList?.join('\n') || ''
            navigator.clipboard.writeText(
              `${proposal.title}\n\n${proposal.introduction}\n\n${proposal.requirementUnderstanding}\n\n${proposal.proposedSolution}\n\n${featureText}\n\n${proposal.timeline}\n\n${proposal.budget}\n\n${proposal.conclusion}`
            )
            toast.success('Copied to clipboard!')
          }}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold"
        >
          Copy Text
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              downloadProposalPdf(proposal)
              toast.success('PDF downloaded!', { icon: '📄' })
            } catch {
              toast.error('Failed to generate PDF')
            }
          }}
          className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold"
        >
          Download PDF
        </button>
      </div>
    </div>
  )
}

export default ProposalOutput
