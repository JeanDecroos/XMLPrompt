import React, { useState, useEffect } from 'react'
import { HelpCircle, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react'

const SmartFormField = ({ 
  field,
  value,
  onChange,
  validation,
  placeholder,
  examples = [],
  tips = [],
  isRequired = false,
  type = 'text',
  className = ''
}) => {
  const [showHelp, setShowHelp] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [currentExample, setCurrentExample] = useState(0)
  const [fieldFocused, setFieldFocused] = useState(false)

  const fieldConfig = {
    role: {
      label: 'Professional Role',
      icon: '👤',
      helpText: 'Your role helps us understand the context and expertise level needed for your prompts.',
      examples: [
        'Marketing Manager',
        'Content Writer', 
        'Product Manager',
        'Data Analyst',
        'Software Developer'
      ],
      tips: [
        'Choose the role that best matches your current task',
        'Different roles get different types of optimization',
        'You can always change this later'
      ]
    },
    task: {
      label: 'Task Description',
      icon: '🎯',
      helpText: 'Describe what you want the AI to do. Be specific about the goal and desired outcome.',
      examples: [
        'Write a compelling product description for our new software tool',
        'Create a social media post announcing our company milestone',
        'Generate a weekly newsletter for our customer base'
      ],
      tips: [
        'Be specific about what you want to achieve',
        'Include the target audience if relevant',
        'Mention the desired format or length'
      ]
    },
    context: {
      label: 'Context & Background',
      icon: '📋',
      helpText: 'Provide relevant background information that will help the AI understand your situation.',
      examples: [
        'We\'re a B2B SaaS company targeting small businesses',
        'This is for our annual product launch campaign',
        'Our audience is primarily technical professionals'
      ],
      tips: [
        'Include industry or domain-specific information',
        'Mention your target audience demographics',
        'Provide relevant company or project background'
      ]
    },
    requirements: {
      label: 'Requirements & Constraints',
      icon: '📝',
      helpText: 'Specify any specific requirements, constraints, or criteria the output must meet.',
      examples: [
        'Must be under 280 characters for Twitter',
        'Include a call-to-action button',
        'Use formal, professional tone'
      ],
      tips: [
        'Mention length or format requirements',
        'Include tone and style preferences',
        'Specify what should be included or avoided'
      ]
    },
    style: {
      label: 'Style & Tone',
      icon: '🎨',
      helpText: 'Define the writing style, tone, and voice that matches your brand or preference.',
      examples: [
        'Professional and authoritative',
        'Casual and friendly',
        'Technical and detailed'
      ],
      tips: [
        'Match your brand voice',
        'Consider your audience expectations',
        'Be consistent with your other communications'
      ]
    },
    output: {
      label: 'Output Format',
      icon: '📄',
      helpText: 'Specify the desired format and structure for the AI\'s response.',
      examples: [
        'Structured with headers and bullet points',
        'Single paragraph with clear intro and conclusion',
        'Step-by-step numbered list'
      ],
      tips: [
        'Consider how you\'ll use the output',
        'Think about readability for your audience',
        'Specify any formatting requirements'
      ]
    }
  }

  const config = fieldConfig[field] || {}
  const fieldExamples = examples.length > 0 ? examples : (config.examples || [])
  const fieldTips = tips.length > 0 ? tips : (config.tips || [])

  // Auto-cycle through examples
  useEffect(() => {
    if (showExamples && fieldExamples.length > 1) {
      const timer = setInterval(() => {
        setCurrentExample((prev) => (prev + 1) % fieldExamples.length)
      }, 3000)
      return () => clearInterval(timer)
    }
  }, [showExamples, fieldExamples.length])

  const getValidationStatus = () => {
    if (!validation) return null
    if (validation.isValid) return 'valid'
    if (validation.errors?.length > 0) return 'error'
    return null
  }

  const getValidationColor = () => {
    const status = getValidationStatus()
    switch (status) {
      case 'valid': return 'border-green-500 focus:ring-green-500'
      case 'error': return 'border-red-500 focus:ring-red-500'
      default: return 'border-gray-300 focus:ring-blue-500'
    }
  }

  const handleExampleClick = (example) => {
    onChange(field, example)
    setShowExamples(false)
  }

  const renderInput = () => {
    const baseClasses = `w-full px-4 py-3 rounded-lg border transition-all duration-200 ${getValidationColor()} ${className}`
    
    if (type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className={`${baseClasses} resize-vertical`}
          rows={4}
          onFocus={() => setFieldFocused(true)}
          onBlur={() => setFieldFocused(false)}
        />
      )
    }
    
    if (type === 'select') {
      return (
        <select
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          className={baseClasses}
          onFocus={() => setFieldFocused(true)}
          onBlur={() => setFieldFocused(false)}
        >
          <option value="">Select...</option>
          {fieldExamples.map((option, index) => (
            <option key={index} value={option}>{option}</option>
          ))}
        </select>
      )
    }
    
    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        placeholder={placeholder}
        className={baseClasses}
        onFocus={() => setFieldFocused(true)}
        onBlur={() => setFieldFocused(false)}
      />
    )
  }

  return (
    <div className="space-y-3">
      {/* Field Label and Controls */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-900 flex items-center">
          {config.icon && <span className="mr-2">{config.icon}</span>}
          {config.label || field}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="flex items-center space-x-2">
          {fieldExamples.length > 0 && (
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              <Lightbulb className="w-3 h-3 mr-1" />
              Examples
            </button>
          )}
          
          {config.helpText && (
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Help
            </button>
          )}
        </div>
      </div>

      {/* Input Field */}
      <div className="relative">
        {renderInput()}
        
        {/* Validation Status Icon */}
        {getValidationStatus() && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getValidationStatus() === 'valid' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        )}
      </div>

      {/* Help Text */}
      {showHelp && config.helpText && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{config.helpText}</p>
          {fieldTips.length > 0 && (
            <div className="mt-2 space-y-1">
              {fieldTips.map((tip, index) => (
                <div key={index} className="flex items-start text-xs text-blue-700">
                  <span className="mr-2">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      {showExamples && fieldExamples.length > 0 && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Examples:</span>
            <span className="text-xs text-gray-500">
              {currentExample + 1} of {fieldExamples.length}
            </span>
          </div>
          <div className="space-y-2">
            {fieldExamples.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleExampleClick(example)}
                className={`w-full text-left p-2 rounded-md text-sm transition-all duration-200 ${
                  index === currentExample 
                    ? 'bg-blue-100 border border-blue-300 text-blue-800' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {getValidationStatus() === 'error' && validation.errors && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-700 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Character Count for textareas */}
      {type === 'textarea' && value && (
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{value.length} characters</span>
          {value.length > 100 && (
            <span className="text-green-600">✓ Good detail level</span>
          )}
        </div>
      )}
    </div>
  )
}

export default SmartFormField 