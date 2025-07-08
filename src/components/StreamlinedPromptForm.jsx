import React, { useState, useEffect } from 'react'
import { ChevronRight, ChevronDown, Target, Wand2, Settings, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import GoalFirstRoleSelector from './GoalFirstRoleSelector'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'

const StreamlinedPromptForm = ({ formData, onChange, onReset, validation, onGenerate }) => {
  const { isAuthenticated, isPro } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [completedSteps, setCompletedSteps] = useState(new Set())

  // Determine if Pro features should be enabled
  const isProFeatureEnabled = isAuthEnabled && isAuthenticated && isPro
  const showProFeatures = !isAuthEnabled || isProFeatureEnabled

  // Check step completion
  useEffect(() => {
    const newCompletedSteps = new Set()
    
    // Step 1: Role selection
    if (formData.role) {
      newCompletedSteps.add(1)
    }
    
    // Step 2: Task description
    if (formData.task && formData.task.length > 10) {
      newCompletedSteps.add(2)
    }
    
    // Step 3: Advanced options (optional)
    if (formData.context || formData.requirements || formData.style || formData.output) {
      newCompletedSteps.add(3)
    }
    
    setCompletedSteps(newCompletedSteps)
  }, [formData])

  const handleChange = (field) => (e) => {
    onChange(field, e.target.value)
  }

  const steps = [
    {
      id: 1,
      title: "Choose Your Role",
      description: "Select your professional role to optimize AI responses",
      required: true,
      completed: completedSteps.has(1)
    },
    {
      id: 2,
      title: "Describe Your Task",
      description: "Tell us what you want to accomplish",
      required: true,
      completed: completedSteps.has(2)
    },
    {
      id: 3,
      title: "Fine-tune (Optional)",
      description: "Add context and specific requirements",
      required: false,
      completed: completedSteps.has(3)
    }
  ]

  const canProceedToStep = (stepId) => {
    if (stepId === 1) return true
    if (stepId === 2) return completedSteps.has(1)
    if (stepId === 3) return completedSteps.has(1) && completedSteps.has(2)
    return false
  }

  const getStepIcon = (step) => {
    if (step.completed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }
    if (currentStep === step.id) {
      return <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">{step.id}</div>
    }
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 text-sm font-bold">{step.id}</div>
  }

  const isReadyToGenerate = completedSteps.has(1) && completedSteps.has(2)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <button
                onClick={() => canProceedToStep(step.id) && setCurrentStep(step.id)}
                disabled={!canProceedToStep(step.id)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  currentStep === step.id
                    ? 'bg-primary-50 border-2 border-primary-200'
                    : step.completed
                    ? 'bg-green-50 border-2 border-green-200 hover:bg-green-100'
                    : canProceedToStep(step.id)
                    ? 'bg-gray-50 border-2 border-gray-200 hover:bg-gray-100'
                    : 'bg-gray-50 border-2 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
              >
                {getStepIcon(step)}
                <div className="text-left">
                  <div className={`font-medium ${
                    currentStep === step.id ? 'text-primary-700' : 
                    step.completed ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {step.title}
                    {step.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <Target className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Professional Role</h2>
              <p className="text-gray-600">
                Your role helps us understand the context and select the optimal AI model for your needs.
              </p>
            </div>
            
            <GoalFirstRoleSelector
              selectedRole={formData.role}
              onRoleChange={(role) => onChange('role', role)}
              showRoleDescription={true}
            />
            
            {formData.role && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-primary btn-lg"
                >
                  Continue to Task Description
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Task Description */}
        {currentStep === 2 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <Wand2 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Describe Your Task</h2>
              <p className="text-gray-600">
                Be specific about what you want to accomplish. Clear descriptions lead to better results.
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    What do you want the AI to do? *
                  </label>
                  <textarea
                    value={formData.task}
                    onChange={handleChange('task')}
                    placeholder="Example: Write a compelling product description for our new software tool that helps small businesses manage their inventory. Focus on the time-saving benefits and ease of use."
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    required
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-500">
                      {formData.task.length < 10 ? (
                        <span className="text-amber-600">Please provide more detail (minimum 10 characters)</span>
                      ) : (
                        <span className="text-green-600">✓ Good detail level</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formData.task.length}/1000
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn btn-secondary"
                >
                  Back
                </button>
                
                {formData.task.length > 10 && (
                  <>
                    <button
                      onClick={() => setShowAdvanced(true)}
                      className="btn btn-ghost"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Add Advanced Options
                    </button>
                    
                    <button
                      onClick={onGenerate}
                      className="btn btn-primary btn-lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Prompt
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Advanced Options */}
        {(currentStep === 3 || showAdvanced) && (
          <div className="p-8 bg-gray-50">
            <div className="text-center mb-8">
              <Settings className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fine-tune Your Prompt</h2>
              <p className="text-gray-600">
                Add context and specific requirements to get even better results.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {/* Context */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Context & Background</h3>
                <textarea
                  value={formData.context}
                  onChange={handleChange('context')}
                  placeholder="Provide relevant background information, target audience, or situation context..."
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specific Requirements</h3>
                <textarea
                  value={formData.requirements}
                  onChange={handleChange('requirements')}
                  placeholder="List any specific requirements, constraints, or must-have elements..."
                  className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>

              {/* Style & Output */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Style & Tone</h3>
                  <textarea
                    value={formData.style}
                    onChange={handleChange('style')}
                    placeholder="Describe the desired style, tone, or voice..."
                    className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Output Format</h3>
                  <textarea
                    value={formData.output}
                    onChange={handleChange('output')}
                    placeholder="Specify the desired output format or structure..."
                    className="w-full h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center space-x-4">
              <button
                onClick={() => {
                  setCurrentStep(2)
                  setShowAdvanced(false)
                }}
                className="btn btn-secondary"
              >
                Back to Task
              </button>
              
              <button
                onClick={onGenerate}
                className="btn btn-primary btn-lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Enhanced Prompt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {isReadyToGenerate && currentStep !== 3 && !showAdvanced && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-4 bg-white rounded-lg px-6 py-4 shadow-sm border border-gray-200">
            <div className="flex items-center text-green-600">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Ready to generate!</span>
            </div>
            <button
              onClick={onGenerate}
              className="btn btn-primary"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Prompt
            </button>
          </div>
        </div>
      )}

      {/* Reset Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  )
}

export default StreamlinedPromptForm 