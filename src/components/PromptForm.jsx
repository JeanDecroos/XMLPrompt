import React, { useState } from 'react'
import { RotateCcw, User, Target, FileText, CheckSquare, Palette, Download, Lock, Crown, Sparkles, ChevronDown, ChevronRight, AlertCircle, Plus } from 'lucide-react'
import { roles } from '../data/roles'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'

const PromptForm = ({ formData, onChange, onReset, validation }) => {
  const { isAuthenticated, isPro } = useAuth()
  const [activeTab, setActiveTab] = useState('essentials')
  const [expandedSections, setExpandedSections] = useState({
    context: false,
    requirements: false,
    style: false,
    output: false
  })
  
  const handleChange = (field) => (e) => {
    onChange(field, e.target.value)
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Determine if Pro features should be enabled
  const isProFeatureEnabled = isAuthEnabled && isAuthenticated && isPro
  // In demo mode, show all features as enabled
  const showProFeatures = !isAuthEnabled || isProFeatureEnabled

  // Get field error for specific field
  const getFieldError = (fieldName) => {
    return validation.errors.find(error => 
      error.toLowerCase().includes(fieldName.toLowerCase())
    )
  }

  const tabs = [
    { id: 'essentials', label: 'Essentials', icon: Target, count: 2 },
    { id: 'advanced', label: 'Advanced', icon: Sparkles, count: 4 }
  ]

  return (
    <div className="card p-0 fade-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              Prompt Configuration
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Build your AI prompt step by step
              {!isAuthEnabled && <span className="text-amber-600 ml-2">(Demo Mode)</span>}
            </p>
          </div>
          <button
            onClick={onReset}
            className="btn btn-secondary btn-sm flex items-center hover-lift"
            title="Reset form"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-6 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => {
            const Icon = tab.icon
            const hasErrors = tab.id === 'essentials' 
              ? (getFieldError('role') || getFieldError('task'))
              : false
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {hasErrors && <AlertCircle className="w-4 h-4 text-red-500" />}
                <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'essentials' && (
          <div className="space-y-6 slide-up">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 flex items-center">
                <User className="w-4 h-4 mr-2 text-primary-600" />
                Role *
                <span className="badge badge-free ml-2">Free</span>
                {getFieldError('role') && <AlertCircle className="w-4 h-4 ml-2 text-red-500" />}
              </label>
              <div className="grid grid-cols-1 gap-3">
                <select
                  value={formData.role}
                  onChange={handleChange('role')}
                  className={`select-field ${getFieldError('role') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
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
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg scale-in">
                    <p className="text-sm text-blue-800 font-medium">
                      {roles.find(r => r.name === formData.role)?.description}
                    </p>
                  </div>
                )}
              </div>
              {getFieldError('role') && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('role')}
                </p>
              )}
            </div>

            {/* Task Description */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 flex items-center">
                <Target className="w-4 h-4 mr-2 text-primary-600" />
                Task Description *
                <span className="badge badge-free ml-2">Free</span>
                {getFieldError('task') && <AlertCircle className="w-4 h-4 ml-2 text-red-500" />}
              </label>
              <textarea
                value={formData.task}
                onChange={handleChange('task')}
                placeholder="Describe what you want the AI to do. Be specific about the task, goals, and expected behavior."
                className={`textarea-field ${getFieldError('task') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                rows={4}
                required
              />
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                  <div className="w-1 h-1 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-500">
                    Clear, specific task descriptions lead to better results.
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {formData.task.length}/1000
                </span>
              </div>
              {getFieldError('task') && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError('task')}
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4 slide-up">
            {/* Context Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('context')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Context</h4>
                    <p className="text-sm text-gray-500">Background information and situational details</p>
                  </div>
                  <span className="badge badge-free">Free</span>
                </div>
                <div className="flex items-center space-x-2">
                  {formData.context && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {expandedSections.context ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </button>
              {expandedSections.context && (
                <div className="p-4 pt-0 scale-in">
                  <textarea
                    value={formData.context}
                    onChange={handleChange('context')}
                    placeholder="Provide background information, relevant details, or situational context that will help the AI understand the task better."
                    className="textarea-field"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Requirements Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('requirements')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CheckSquare className="w-5 h-5 text-primary-600" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Requirements</h4>
                    <p className="text-sm text-gray-500">Specific constraints and criteria</p>
                  </div>
                  {isAuthEnabled ? (
                    <span className="badge badge-premium">Pro</span>
                  ) : (
                    <span className="badge badge-free">Demo</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {formData.requirements && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {expandedSections.requirements ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </button>
              {expandedSections.requirements && (
                <div className="p-4 pt-0 scale-in">
                  <textarea
                    value={formData.requirements}
                    onChange={handleChange('requirements')}
                    placeholder="List specific requirements, constraints, or criteria that must be met. Use bullet points or numbered lists for clarity."
                    className={`textarea-field ${!showProFeatures ? 'bg-gray-50 border-gray-200' : ''}`}
                    rows={3}
                    disabled={!showProFeatures}
                  />
                  <div className="mt-2">
                    {!isAuthEnabled ? (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                        <span>All features available in demo mode</span>
                      </div>
                    ) : !isProFeatureEnabled ? (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Lock className="w-3 h-3 mr-1 text-gray-400" />
                        <span>Enhanced with AI optimization in Pro version</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-blue-500" />
                        <span>Enhanced with AI optimization</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Style Guidelines Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('style')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Palette className="w-5 h-5 text-primary-600" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Style Guidelines</h4>
                    <p className="text-sm text-gray-500">Tone, format, and presentation preferences</p>
                  </div>
                  {isAuthEnabled ? (
                    <span className="badge badge-premium">Pro</span>
                  ) : (
                    <span className="badge badge-free">Demo</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {formData.style && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {expandedSections.style ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </button>
              {expandedSections.style && (
                <div className="p-4 pt-0 scale-in">
                  <textarea
                    value={formData.style}
                    onChange={handleChange('style')}
                    placeholder={showProFeatures 
                      ? "Specify tone, writing style, format preferences, or presentation guidelines."
                      : "Specify tone, writing style, format preferences, or presentation guidelines. (Pro feature for advanced styling)"
                    }
                    className={`textarea-field ${!showProFeatures ? 'bg-gray-50 border-gray-200' : ''}`}
                    rows={2}
                    disabled={!showProFeatures}
                  />
                  <div className="mt-2">
                    {!isAuthEnabled ? (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                        <span>All styling controls available in demo mode</span>
                      </div>
                    ) : !isProFeatureEnabled ? (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Lock className="w-3 h-3 mr-1 text-gray-400" />
                        <span>Advanced styling controls available with Pro</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-blue-500" />
                        <span>Advanced styling controls enabled</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Output Format Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('output')}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-primary-600" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Output Format</h4>
                    <p className="text-sm text-gray-500">Structure and delivery specifications</p>
                  </div>
                  {isAuthEnabled ? (
                    <span className="badge badge-premium">Pro</span>
                  ) : (
                    <span className="badge badge-free">Demo</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {formData.output && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {expandedSections.output ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </button>
              {expandedSections.output && (
                <div className="p-4 pt-0 scale-in">
                  <textarea
                    value={formData.output}
                    onChange={handleChange('output')}
                    placeholder={showProFeatures
                      ? "Describe the desired output format, structure, or delivery method."
                      : "Describe the desired output format, structure, or delivery method. (Pro feature for custom formatting)"
                    }
                    className={`textarea-field ${!showProFeatures ? 'bg-gray-50 border-gray-200' : ''}`}
                    rows={2}
                    disabled={!showProFeatures}
                  />
                  <div className="mt-2">
                    {!isAuthEnabled ? (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                        <span>All output formatting available in demo mode</span>
                      </div>
                    ) : !isProFeatureEnabled ? (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Lock className="w-3 h-3 mr-1 text-gray-400" />
                        <span>Custom output formatting available with Pro</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-blue-500" />
                        <span>Custom output formatting enabled</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {validation.errors.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 scale-in">
            <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Please fix the following:
            </h4>
            <ul className="text-sm text-red-700 space-y-2">
              {validation.errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="w-1 h-1 bg-red-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {Object.values(formData).filter(Boolean).length}/6 fields completed
              </span>
              <span className="flex items-center">
                <Target className="w-3 h-3 mr-1" />
                {validation.isValid ? 'Ready to generate' : 'Missing required fields'}
              </span>
            </div>
            {activeTab === 'advanced' && (
              <button
                onClick={() => {
                  setExpandedSections({
                    context: true,
                    requirements: true,
                    style: true,
                    output: true
                  })
                }}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                Expand All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptForm 