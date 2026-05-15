import React from 'react'

function ProposalSection({ title, content }) {
  return (
    <div className="space-y-2 pb-4">
      <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-blue-300 pb-2">
        {title}
      </h3>
      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  )
}

export default ProposalSection
