import React, { useState, useEffect } from 'react'
import { RotateCcw, User, Target, FileText, CheckSquare, Palette, Download, Lock, Sparkles, ChevronDown, ChevronRight, Eye, EyeOff, Info } from 'lucide-react'
import { roles, getRolesByCategory } from '../data/roles'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'

const PromptForm = ({ formData, onChange, onReset, validation, showAdvancedByDefault = null, forceShowAdvanced = false }) => {
  const { isAuthenticated, isPro } = useAuth()
  const [expandedSections, setExpandedSections] = useState(() => {
    // Initialize from localStorage or default to all collapsed
    // If forceShowAdvanced is true, expand all sections
    if (forceShowAdvanced) {
      return {
        context: true,
        requirements: true,
        style: true,
        output: true
      }
    }
    
    try {
      const stored = localStorage.getItem('expandedSections')
      return stored ? JSON.parse(stored) : {
        context: false,
        requirements: false,
        style: false,
        output: false
      }
    } catch (error) {
      console.error("Failed to parse expandedSections from localStorage", error)
      return {
        context: false,
        requirements: false,
        style: false,
        output: false
      }
    }
  })
  
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(() => {
    // If forceShowAdvanced is true, always show advanced options
    if (forceShowAdvanced) {
      return true
    }
    
    // If showAdvancedByDefault is explicitly provided, use that value
    if (showAdvancedByDefault !== null) {
      return showAdvancedByDefault
    }
    
    try {
      const storedPref = localStorage.getItem('advancedOptionsDefaultOpen')
      return storedPref !== null ? JSON.parse(storedPref) : true // Default to true if not set
    } catch (error) {
      console.error("Failed to parse advancedOptionsDefaultOpen from localStorage", error)
      return true // Default to true on error
    }
  })

  // Update showAdvancedOptions when showAdvancedByDefault changes
  useEffect(() => {
    if (forceShowAdvanced) {
      setShowAdvancedOptions(true)
    } else if (showAdvancedByDefault !== null) {
      setShowAdvancedOptions(showAdvancedByDefault)
    }
  }, [showAdvancedByDefault, forceShowAdvanced])

  // Update expandedSections when forceShowAdvanced changes
  useEffect(() => {
    if (forceShowAdvanced) {
      setExpandedSections({
        context: true,
        requirements: true,
        style: true,
        output: true
      })
    }
  }, [forceShowAdvanced])

  // Effect to save expanded sections to localStorage (only when not forced)
  useEffect(() => {
    if (!forceShowAdvanced) {
      try {
        localStorage.setItem('expandedSections', JSON.stringify(expandedSections))
      } catch (error) {
        console.error("Failed to save expandedSections to localStorage", error)
      }
    }
  }, [expandedSections, forceShowAdvanced])

  const handleChange = (field) => (e) => {
    onChange(field, e.target.value)
  }

  const toggleSection = (section) => {
    // Don't allow toggling when forceShowAdvanced is true
    if (forceShowAdvanced) return
    
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleShowAdvancedOptions = () => {
    // Don't allow toggling when forceShowAdvanced is true
    if (forceShowAdvanced) return
    
    setShowAdvancedOptions(prev => {
      const newState = !prev
      try {
        localStorage.setItem('advancedOptionsDefaultOpen', JSON.stringify(newState))
      } catch (error) {
        console.error("Failed to save advancedOptionsDefaultOpen to localStorage", error)
      }
      return newState
    })
  }

  // Auto-exit quick start when user fills required fields (now less relevant with persistent toggle)
  // const isReadyForAdvanced = formData.role && formData.task.length > 20

  // Determine if Pro features should be enabled
  const isProFeatureEnabled = isAuthEnabled && isAuthenticated && isPro
  // In demo mode, show all features as enabled
  const showProFeatures = !isAuthEnabled || isProFeatureEnabled

  const [showRoleTooltip, setShowRoleTooltip] = useState(false)
  const rolesByCategory = getRolesByCategory()

  return (
    <div className="card p-6 fade-in">
      {/* Header with Progress and Advanced Options Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary-600" />
              Prompt Builder
            </h3>
            <div className="flex items-center space-x-2">
              {/* Only show toggle button when not forced */}
              {!forceShowAdvanced && (
                <>
                  {showAdvancedOptions ? (
                    <button
                      onClick={toggleShowAdvancedOptions}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    >
                      <EyeOff className="w-3 h-3 mr-1" />
                      Hide Advanced Options
                    </button>
                  ) : (
                    <button
                      onClick={toggleShowAdvancedOptions}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Show Advanced Options
                    </button>
                  )}
                </>
              )}
              <button
                onClick={onReset}
                className="btn btn-secondary btn-sm flex items-center hover-lift"
                title="Reset form"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </button>
            </div>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-1.5 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, 
                    (formData.role ? 30 : 0) + 
                    (formData.task.length > 10 ? 40 : formData.task.length * 3) + 
                    (showAdvancedOptions ? (
                      (formData.context && expandedSections.context ? 10 : 0) +
                      (formData.requirements && expandedSections.requirements ? 10 : 0) +
                      (formData.style && expandedSections.style ? 5 : 0) +
                      (formData.output && expandedSections.output ? 5 : 0)
                    ) : 0)
                  )}%` 
                }}
              />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              {formData.role && formData.task.length > 10 ? 'Ready' : 'Getting started'}
            </span>
          </div>
          
          <p className="text-sm text-gray-500">
            {forceShowAdvanced ? 
              "All advanced prompt fields are available for professional use."
              : showAdvancedOptions ? 
                "Fine-tune your prompt with advanced options and unlock full potential."
                : "Start with the basics or show advanced options to fine-tune your prompts."
            }
            {!isAuthEnabled && <span className="text-amber-600 ml-2">(Demo Mode)</span>}
          </p>
        </div>
      </div>

      {/* Essential Fields - Always Visible */}
      <div className="space-y-6 mb-8">
        <div className="pb-4 border-b border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-4 h-4 mr-2 text-primary-600" />
            Essential Information
          </h4>
          
          {/* Role Selection */}
          <div className="space-y-3 mb-6">
            <label className="block text-sm font-semibold text-gray-900 flex items-center">
              <User className="w-4 h-4 mr-2 text-primary-600" />
              Role *
              <div className="relative ml-2">
                <button
                  type="button"
                  onMouseEnter={() => setShowRoleTooltip(true)}
                  onMouseLeave={() => setShowRoleTooltip(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Info className="w-4 h-4" />
                </button>
                {showRoleTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap z-50">
                    Your role helps select the optimal AI model for your task
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            </label>
            <select
              value={formData.role}
              onChange={handleChange('role')}
              className="select-field"
              required
            >
              <option value="">Select a professional role...</option>
              {Object.entries(rolesByCategory).map(([category, categoryRoles]) => (
                <optgroup key={category} label={`${category} Roles`}>
                  {categoryRoles.map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            {formData.role && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg scale-in">
                <p className="text-sm text-blue-800 font-medium">
                  {roles.find(r => r.name === formData.role)?.description}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  💡 This role preference will help select the most suitable AI model for your tasks
                </p>
              </div>
            )}
          </div>

          {/* Task Description */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900 flex items-center">
              <Target className="w-4 h-4 mr-2 text-primary-600" />
              Task Description *
            </label>
            <textarea
              value={formData.task}
              onChange={handleChange('task')}
              placeholder="Describe what you want the AI to do. Be specific about the task, goals, and expected behavior."
              className="textarea-field"
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
          </div>
        </div>
      </div>

      {/* Optional Fields - Collapsible (or always visible when forced) */}
      {showAdvancedOptions && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-primary-600" />
              Advanced Options
            </h4>
            {/* Only show expand/collapse button when not forced */}
            {!forceShowAdvanced && (
              <button
                onClick={() => {
                  const allExpanded = Object.values(expandedSections).every(Boolean)
                  const newState = allExpanded ? false : true
                  setExpandedSections({
                    context: newState,
                    requirements: newState,
                    style: newState,
                    output: newState
                  })
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {Object.values(expandedSections).every(Boolean) ? 'Collapse All' : 'Expand All'}
              </button>
            )}
          </div>

          {/* Context Section */}
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('context')}
              className={`w-full p-4 flex items-center justify-between transition-colors rounded-lg ${
                forceShowAdvanced ? 'cursor-default' : 'hover:bg-gray-50'
              }`}
              disabled={forceShowAdvanced}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-primary-600" />
                <div className="text-left">
                  <h5 className="font-semibold text-gray-900">Context</h5>
                  <p className="text-sm text-gray-500">Background information and situational details</p>
                </div>
                <span className="badge badge-free">Free</span>
              </div>
              <div className="flex items-center space-x-2">
                {formData.context && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                {!forceShowAdvanced && (
                  expandedSections.context ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
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
              className={`w-full p-4 flex items-center justify-between transition-colors rounded-lg ${
                forceShowAdvanced ? 'cursor-default' : 'hover:bg-gray-50'
              }`}
              disabled={forceShowAdvanced}
            >
              <div className="flex items-center space-x-3">
                <CheckSquare className="w-5 h-5 text-primary-600" />
                <div className="text-left">
                  <h5 className="font-semibold text-gray-900">Requirements</h5>
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
                {!forceShowAdvanced && (
                  expandedSections.requirements ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
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
              className={`w-full p-4 flex items-center justify-between transition-colors rounded-lg ${
                forceShowAdvanced ? 'cursor-default' : 'hover:bg-gray-50'
              }`}
              disabled={forceShowAdvanced}
            >
              <div className="flex items-center space-x-3">
                <Palette className="w-5 h-5 text-primary-600" />
                <div className="text-left">
                  <h5 className="font-semibold text-gray-900">Style Guidelines</h5>
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
                {!forceShowAdvanced && (
                  expandedSections.style ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
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
              className={`w-full p-4 flex items-center justify-between transition-colors rounded-lg ${
                forceShowAdvanced ? 'cursor-default' : 'hover:bg-gray-50'
              }`}
              disabled={forceShowAdvanced}
            >
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-primary-600" />
                <div className="text-left">
                  <h5 className="font-semibold text-gray-900">Output Format</h5>
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
                {!forceShowAdvanced && (
                  expandedSections.output ? 
                    <ChevronDown className="w-5 h-5 text-gray-400" /> : 
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
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

      {/* Simple Validation Errors - only show if there are errors */}
      {validation.errors.length > 0 && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Please complete required fields:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress indicator */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            {Object.values(formData).filter(Boolean).length}/6 fields completed
          </span>
          <span>
            {validation.isValid ? '✓ Ready to generate' : 'Missing required fields'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PromptForm 