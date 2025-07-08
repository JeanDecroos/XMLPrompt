import React, { useState, useEffect } from 'react'
import { ChevronRight, CheckCircle, Circle, ArrowRight } from 'lucide-react'

const NavigationFlow = ({ 
  currentSection, 
  formData, 
  onSectionChange, 
  validation,
  isVisible = true 
}) => {
  const [completedSteps, setCompletedSteps] = useState(new Set())

  const flowSteps = [
    {
      id: 'basics',
      title: 'Essential Info',
      description: 'Role & task description',
      isComplete: () => formData.role && formData.task.length > 10,
      isRequired: true,
      section: 'form'
    },
    {
      id: 'model',
      title: 'AI Model',
      description: 'Choose optimal model',
      isComplete: () => !!formData.selectedModel,
      isRequired: true,
      section: 'model'
    },
    {
      id: 'advanced',
      title: 'Fine-tune',
      description: 'Context & requirements',
      isComplete: () => formData.context || formData.requirements || formData.style,
      isRequired: false,
      section: 'advanced'
    },
    {
      id: 'generate',
      title: 'Generate',
      description: 'Create your prompt',
      isComplete: () => validation.isValid,
      isRequired: true,
      section: 'preview'
    }
  ]

  useEffect(() => {
    const newCompletedSteps = new Set()
    flowSteps.forEach(step => {
      if (step.isComplete()) {
        newCompletedSteps.add(step.id)
      }
    })
    setCompletedSteps(newCompletedSteps)
  }, [formData, validation])

  const getStepStatus = (step) => {
    if (completedSteps.has(step.id)) return 'completed'
    if (step.id === currentSection) return 'current'
    if (step.isRequired && !completedSteps.has(step.id)) return 'required'
    return 'optional'
  }

  const getStepColors = (status) => {
    const colors = {
      completed: 'bg-green-500 border-green-500 text-white',
      current: 'bg-blue-500 border-blue-500 text-white',
      required: 'bg-white border-gray-300 text-gray-700',
      optional: 'bg-gray-50 border-gray-200 text-gray-500'
    }
    return colors[status] || colors.optional
  }

  const getConnectorColors = (step, nextStep) => {
    if (completedSteps.has(step.id) && completedSteps.has(nextStep.id)) {
      return 'border-green-500'
    }
    if (completedSteps.has(step.id)) {
      return 'border-blue-500'
    }
    return 'border-gray-300'
  }

  const handleStepClick = (step) => {
    if (onSectionChange) {
      onSectionChange(step.section)
    }
  }

  if (!isVisible) return null

  return (
    <div className="card-secondary p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
        <div className="text-sm text-gray-500">
          {completedSteps.size} of {flowSteps.filter(s => s.isRequired).length} required steps
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {flowSteps.map((step, index) => {
          const status = getStepStatus(step)
          const isClickable = status === 'completed' || status === 'current'
          
          return (
            <React.Fragment key={step.id}>
              <div 
                className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                  isClickable ? 'hover:scale-105' : ''
                }`}
                onClick={() => isClickable && handleStepClick(step)}
              >
                <div 
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-200 ${
                    getStepColors(status)
                  }`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    status === 'completed' ? 'text-green-700' :
                    status === 'current' ? 'text-blue-700' :
                    'text-gray-700'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </div>
                  {!step.isRequired && (
                    <div className="text-xs text-gray-400 mt-1">
                      Optional
                    </div>
                  )}
                </div>
              </div>
              
              {index < flowSteps.length - 1 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className={`h-0.5 w-full border-t-2 border-dashed transition-colors duration-200 ${
                    getConnectorColors(step, flowSteps[index + 1])
                  }`} />
                  <ArrowRight className="w-4 h-4 text-gray-400 mx-2" />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {completedSteps.size === flowSteps.filter(s => s.isRequired).length ? (
              <span className="text-green-600 font-medium">✓ Ready to generate!</span>
            ) : (
              <span>Complete the required steps to generate your prompt</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {completedSteps.size > 0 && (
              <button
                onClick={() => handleStepClick(flowSteps.find(s => s.id === 'generate'))}
                className="btn btn-primary btn-sm"
                disabled={!validation.isValid}
              >
                Generate Prompt
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavigationFlow 