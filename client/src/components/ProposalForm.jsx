import React, { useState } from 'react'

function ProposalForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    projectTitle: '',
    projectDescription: '',
    requiredFeatures: '',
    budgetRange: '',
    timeline: '',
    platformType: 'Web',
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    // Client Name validation (required, min 2 chars)
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required'
    } else if (formData.clientName.trim().length < 2) {
      newErrors.clientName = 'Client name must be at least 2 characters'
    }

    // Company Name validation (required, min 2 chars)
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters'
    }

    // Project Title validation (required, min 2 chars)
    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required'
    } else if (formData.projectTitle.trim().length < 2) {
      newErrors.projectTitle = 'Project title must be at least 2 characters'
    }

    // Project Description validation (required, min 50 characters)
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Project description is required'
    } else if (formData.projectDescription.trim().length < 50) {
      newErrors.projectDescription = 'Description must be at least 50 characters'
    }

    // Required Features validation (required, min 10 characters)
    if (!formData.requiredFeatures.trim()) {
      newErrors.requiredFeatures = 'Required features are required'
    } else if (formData.requiredFeatures.trim().length < 10) {
      newErrors.requiredFeatures = 'Features must be at least 10 characters'
    }

    // Platform Type validation (must be selected)
    if (!formData.platformType) {
      newErrors.platformType = 'Platform type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Client Name */}
      <div>
        <label htmlFor="clientName" className="block text-sm font-semibold text-gray-700 mb-2">
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          placeholder="Enter client's full name"
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.clientName ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.clientName && <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>}
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Enter your company name"
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.companyName ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
      </div>

      {/* Project Title */}
      <div>
        <label htmlFor="projectTitle" className="block text-sm font-semibold text-gray-700 mb-2">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="projectTitle"
          name="projectTitle"
          value={formData.projectTitle}
          onChange={handleChange}
          placeholder="e.g., E-Commerce Platform Redesign"
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.projectTitle ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors.projectTitle && <p className="mt-1 text-sm text-red-600">{errors.projectTitle}</p>}
      </div>

      {/* Project Description */}
      <div>
        <label htmlFor="projectDescription" className="block text-sm font-semibold text-gray-700 mb-2">
          Project Description <span className="text-red-500">*</span>
          <span className="text-xs font-normal text-gray-500 ml-2">(Min. 50 characters)</span>
        </label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          value={formData.projectDescription}
          onChange={handleChange}
          placeholder="Describe the project goals, scope, and any specific requirements..."
          rows="4"
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
            errors.projectDescription ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.projectDescription && <p className="text-sm text-red-600">{errors.projectDescription}</p>}
          </div>
          <span className={`text-xs ${formData.projectDescription.length >= 50 ? 'text-green-600' : 'text-gray-500'}`}>
            {formData.projectDescription.length}/50
          </span>
        </div>
      </div>

      {/* Required Features */}
      <div>
        <label htmlFor="requiredFeatures" className="block text-sm font-semibold text-gray-700 mb-2">
          Required Features <span className="text-red-500">*</span>
          <span className="text-xs font-normal text-gray-500 ml-2">(Min. 10 characters, comma-separated)</span>
        </label>
        <textarea
          id="requiredFeatures"
          name="requiredFeatures"
          value={formData.requiredFeatures}
          onChange={handleChange}
          placeholder="e.g., User authentication, Payment gateway, Dashboard, Analytics, Real-time notifications"
          rows="3"
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none ${
            errors.requiredFeatures ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.requiredFeatures && <p className="text-sm text-red-600">{errors.requiredFeatures}</p>}
          </div>
          <span className={`text-xs ${formData.requiredFeatures.length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
            {formData.requiredFeatures.length}/10
          </span>
        </div>
      </div>

      {/* Budget Range and Timeline (side by side) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Budget Range */}
        <div>
          <label htmlFor="budgetRange" className="block text-sm font-semibold text-gray-700 mb-2">
            Budget Range <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="budgetRange"
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            placeholder="e.g., $5,000 - $10,000"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>

        {/* Timeline */}
        <div>
          <label htmlFor="timeline" className="block text-sm font-semibold text-gray-700 mb-2">
            Timeline <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            placeholder="e.g., 3 months"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Platform Type */}
      <div>
        <label htmlFor="platformType" className="block text-sm font-semibold text-gray-700 mb-2">
          Platform Type <span className="text-red-500">*</span>
        </label>
        <select
          id="platformType"
          name="platformType"
          value={formData.platformType}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
            errors.platformType ? 'border-red-500 bg-red-50' : 'border-gray-300'
          }`}
        >
          <option value="Web">Web Application</option>
          <option value="Mobile">Mobile Application</option>
          <option value="Desktop">Desktop Application</option>
          <option value="Both Web & Mobile">Both Web & Mobile</option>
        </select>
        {errors.platformType && <p className="mt-1 text-sm text-red-600">{errors.platformType}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 transition duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Proposal...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Proposal
          </>
        )}
      </button>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 text-center">
        Fields marked with <span className="text-red-500">*</span> are required
      </p>
    </form>
  )
}

export default ProposalForm
