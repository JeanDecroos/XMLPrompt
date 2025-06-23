import React from 'react'
import { RotateCcw, User, Target, FileText, CheckSquare, Palette, Download, Lock, Crown, Sparkles } from 'lucide-react'
import { roles } from '../data/roles'

const PromptForm = ({ formData, onChange, onReset, validation }) => {
  const handleChange = (field) => (e) => {
    onChange(field, e.target.value)
  }

  return (
    <div className="card p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary-600" />
            Prompt Configuration
          </h3>
          <p className="text-sm text-gray-500 mt-1">Build your AI prompt step by step</p>
        </div>
        <button
          onClick={onReset}
          className="btn btn-secondary btn-sm flex items-center"
          title="Reset form"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Role Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <User className="w-4 h-4 mr-2 text-primary-600" />
            Role *
            <span className="badge badge-free ml-2">Free</span>
          </label>
          <select
            value={formData.role}
            onChange={handleChange('role')}
            className="select-field"
            required
          >
            <option value="">Select a professional role...</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
          {formData.role && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                {roles.find(r => r.name === formData.role)?.description}
              </p>
            </div>
          )}
        </div>

        {/* Task Description */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Target className="w-4 h-4 mr-2 text-primary-600" />
            Task Description *
            <span className="badge badge-free ml-2">Free</span>
          </label>
          <textarea
            value={formData.task}
            onChange={handleChange('task')}
            placeholder="Describe what you want Claude to do. Be specific about the task, goals, and expected behavior."
            className="textarea-field"
            rows={4}
            required
          />
          <div className="flex items-start space-x-2">
            <div className="w-1 h-1 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-sm text-gray-500">
              Clear, specific task descriptions lead to better results.
            </p>
          </div>
        </div>

        {/* Context (Optional) */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-primary-600" />
            Context
            <span className="text-gray-400 ml-1 text-xs">(Optional)</span>
            <span className="badge badge-free ml-2">Free</span>
          </label>
          <textarea
            value={formData.context}
            onChange={handleChange('context')}
            placeholder="Provide background information, relevant details, or situational context that will help Claude understand the task better."
            className="textarea-field"
            rows={3}
          />
        </div>

        {/* Requirements (Premium Feature Highlight) */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <CheckSquare className="w-4 h-4 mr-2 text-primary-600" />
            Requirements
            <span className="text-gray-400 ml-1 text-xs">(Optional)</span>
            <span className="badge badge-premium ml-2">Premium</span>
          </label>
          <div className="relative">
            <textarea
              value={formData.requirements}
              onChange={handleChange('requirements')}
              placeholder="List specific requirements, constraints, or criteria that must be met. Use bullet points or numbered lists for clarity."
              className="textarea-field"
              rows={3}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-50/50 to-blue-50/50 rounded-lg pointer-events-none opacity-30"></div>
          </div>
          <div className="upgrade-cta">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Enhanced Requirements</p>
                <p className="text-xs text-gray-600">AI-powered requirement optimization</p>
              </div>
              <button className="btn btn-premium btn-sm">
                <Crown className="w-3 h-3 mr-1" />
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Style Guidelines (Premium Feature) */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Palette className="w-4 h-4 mr-2 text-primary-600" />
            Style Guidelines
            <span className="text-gray-400 ml-1 text-xs">(Optional)</span>
            <span className="badge badge-premium ml-2">Premium</span>
          </label>
          <div className="relative">
            <textarea
              value={formData.style}
              onChange={handleChange('style')}
              placeholder="Specify tone, writing style, format preferences, or presentation guidelines."
              className="textarea-field opacity-60"
              rows={2}
              disabled
            />
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
              <div className="text-center">
                <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Premium Feature</p>
                <p className="text-xs text-gray-500">Unlock advanced styling controls</p>
              </div>
            </div>
          </div>
        </div>

        {/* Output Format (Premium Feature) */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Download className="w-4 h-4 mr-2 text-primary-600" />
            Output Format
            <span className="text-gray-400 ml-1 text-xs">(Optional)</span>
            <span className="badge badge-premium ml-2">Premium</span>
          </label>
          <div className="relative">
            <textarea
              value={formData.output}
              onChange={handleChange('output')}
              placeholder="Describe the desired output format, structure, or delivery method."
              className="textarea-field opacity-60"
              rows={2}
              disabled
            />
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
              <div className="text-center">
                <Lock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Premium Feature</p>
                <p className="text-xs text-gray-500">Custom output formatting</p>
              </div>
            </div>
          </div>
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