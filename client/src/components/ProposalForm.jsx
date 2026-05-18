import React, { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { getFirstFormError, validateProposalForm } from '../utils/inputValidation'

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
  const formRef = useRef(null)

  const validateForm = () => {
    const { valid, errors: newErrors } = validateProposalForm(formData)
    setErrors(newErrors)
    return { valid, errors: newErrors }
  }

  const scrollToFirstError = (newErrors) => {
    const firstField = [
      'clientName',
      'companyName',
      'projectTitle',
      'projectDescription',
      'requiredFeatures',
      'budgetRange',
      'timeline',
      'platformType',
    ].find((field) => newErrors[field])

    if (firstField) {
      const el = formRef.current?.querySelector(`[name="${firstField}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el?.focus()
    }
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
    const { valid, errors: newErrors } = validateForm()

    if (!valid) {
      const message = getFirstFormError(newErrors)
      toast.error(message, {
        duration: 5000,
        icon: '⚠️',
      })
      scrollToFirstError(newErrors)
      return
    }

    onSubmit(formData)
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {hasErrors && (
        <div
          role="alert"
          className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm flex gap-2"
        >
          <span className="text-lg flex-shrink-0">⚠️</span>
          <p>{getFirstFormError(errors)}</p>
        </div>
      )}
      {/* Client Name */}
      <div>
        <label htmlFor="clientName" className="block text-sm font-semibold text-gray-300 mb-2">
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="clientName"
          name="clientName"
          value={formData.clientName}
          onChange={handleChange}
          placeholder="Enter client's full name"
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition ${
            errors.clientName ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 text-white'
          }`}
        />
        {errors.clientName && <p className="mt-1 text-sm text-red-400">{errors.clientName}</p>}
      </div>

      {/* Company Name */}
      <div>
        <label htmlFor="companyName" className="block text-sm font-semibold text-gray-300 mb-2">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Enter your company name"
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition ${
            errors.companyName ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 text-white'
          }`}
        />
        {errors.companyName && <p className="mt-1 text-sm text-red-400">{errors.companyName}</p>}
      </div>

      {/* Project Title */}
      <div>
        <label htmlFor="projectTitle" className="block text-sm font-semibold text-gray-300 mb-2">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="projectTitle"
          name="projectTitle"
          value={formData.projectTitle}
          onChange={handleChange}
          placeholder="e.g., E-Commerce Platform Redesign"
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition ${
            errors.projectTitle ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 text-white'
          }`}
        />
        {errors.projectTitle && <p className="mt-1 text-sm text-red-400">{errors.projectTitle}</p>}
      </div>

      {/* Project Description */}
      <div>
        <label htmlFor="projectDescription" className="block text-sm font-semibold text-gray-300 mb-2">
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
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition resize-none ${
            errors.projectDescription ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 text-white'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.projectDescription && <p className="text-sm text-red-400">{errors.projectDescription}</p>}
          </div>
          <span className={`text-xs ${formData.projectDescription.length >= 50 ? 'text-green-400' : 'text-gray-500'}`}>
            {formData.projectDescription.length}/50
          </span>
        </div>
      </div>

      {/* Required Features */}
      <div>
        <label htmlFor="requiredFeatures" className="block text-sm font-semibold text-gray-300 mb-2">
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
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition resize-none ${
            errors.requiredFeatures ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 text-white'
          }`}
        />
        <div className="flex justify-between items-center mt-1">
          <div>
            {errors.requiredFeatures && <p className="text-sm text-red-400">{errors.requiredFeatures}</p>}
          </div>
          <span className={`text-xs ${formData.requiredFeatures.length >= 10 ? 'text-green-400' : 'text-gray-500'}`}>
            {formData.requiredFeatures.length}/10
          </span>
        </div>
      </div>

      {/* Budget Range and Timeline (side by side) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Budget Range */}
        <div>
          <label htmlFor="budgetRange" className="block text-sm font-semibold text-gray-300 mb-2">
            Budget Range <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="budgetRange"
            name="budgetRange"
            value={formData.budgetRange}
            onChange={handleChange}
            placeholder="e.g., $5,000 - $10,000"
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition ${
              errors.budgetRange ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 text-white'
            }`}
          />
          {errors.budgetRange && <p className="mt-1 text-sm text-red-400">{errors.budgetRange}</p>}
        </div>

        {/* Timeline */}
        <div>
          <label htmlFor="timeline" className="block text-sm font-semibold text-gray-300 mb-2">
            Timeline <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="text"
            id="timeline"
            name="timeline"
            value={formData.timeline}
            onChange={handleChange}
            placeholder="e.g., 3 months"
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition ${
              errors.timeline ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 text-white'
            }`}
          />
          {errors.timeline && <p className="mt-1 text-sm text-red-400">{errors.timeline}</p>}
        </div>
      </div>

      {/* Platform Type */}
      <div>
        <label htmlFor="platformType" className="block text-sm font-semibold text-gray-300 mb-2">
          Platform Type <span className="text-red-500">*</span>
        </label>
        <select
          id="platformType"
          name="platformType"
          value={formData.platformType}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition ${
            errors.platformType ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5 text-white'
          }`}
        >
          <option value="Web">Web Application</option>
          <option value="Mobile">Mobile Application</option>
          <option value="Desktop">Desktop Application</option>
          <option value="Both Web & Mobile">Both Web & Mobile</option>
        </select>
        {errors.platformType && <p className="mt-1 text-sm text-red-400">{errors.platformType}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 shadow-md hover:shadow-cyan-500/30 flex items-center justify-center gap-2"
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
