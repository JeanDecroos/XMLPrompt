import React from 'react'
import { RotateCcw, User, Target, FileText, CheckSquare, Palette, Download } from 'lucide-react'
import { roles } from '../data/roles'

const PromptForm = ({ formData, onChange, onReset, validation }) => {
  const handleChange = (field) => (e) => {
    onChange(field, e.target.value)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Prompt Configuration
        </h3>
        <button
          onClick={onReset}
          className="btn-secondary flex items-center text-sm"
          title="Reset form"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <User className="w-4 h-4 mr-2" />
            Role *
          </label>
          <select
            value={formData.role}
            onChange={handleChange('role')}
            className="select-field"
            required
          >
            <option value="">Select a role...</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
          {formData.role && (
            <p className="mt-2 text-sm text-gray-600">
              {roles.find(r => r.name === formData.role)?.description}
            </p>
          )}
        </div>

        {/* Task Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Target className="w-4 h-4 mr-2" />
            Task Description *
          </label>
          <textarea
            value={formData.task}
            onChange={handleChange('task')}
            placeholder="Describe what you want Claude to do. Be specific about the task, goals, and expected behavior."
            className="textarea-field"
            rows={4}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Clear, specific task descriptions lead to better results.
          </p>
        </div>

        {/* Context (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Context
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData.context}
            onChange={handleChange('context')}
            placeholder="Provide background information, relevant details, or situational context that will help Claude understand the task better."
            className="textarea-field"
            rows={3}
          />
        </div>

        {/* Requirements (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <CheckSquare className="w-4 h-4 mr-2" />
            Requirements
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData.requirements}
            onChange={handleChange('requirements')}
            placeholder="List specific requirements, constraints, or criteria that must be met. Use bullet points or numbered lists for clarity."
            className="textarea-field"
            rows={3}
          />
        </div>

        {/* Style Guidelines (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Style Guidelines
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData.style}
            onChange={handleChange('style')}
            placeholder="Specify tone, writing style, format preferences, or presentation guidelines."
            className="textarea-field"
            rows={2}
          />
        </div>

        {/* Output Format (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Output Format
            <span className="text-gray-400 ml-1">(Optional)</span>
          </label>
          <textarea
            value={formData.output}
            onChange={handleChange('output')}
            placeholder="Describe the desired output format, structure, or delivery method."
            className="textarea-field"
            rows={2}
          />
        </div>

        {/* Validation Errors */}
        {validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptForm 