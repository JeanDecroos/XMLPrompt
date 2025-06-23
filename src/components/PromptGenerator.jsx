import React, { useState, useEffect } from 'react'
import PromptForm from './PromptForm'
import EnrichmentOptions from './EnrichmentOptions'
import EnhancedPromptPreview from './EnhancedPromptPreview'
import { generateClaudePrompt, validatePromptConfig } from '../utils/promptGenerator'
import { enrichPrompt } from '../utils/promptEnricher'

const PromptGenerator = () => {
  const [formData, setFormData] = useState({
    role: '',
    task: '',
    context: '',
    requirements: '',
    style: '',
    output: ''
  })
  
  const [enrichmentData, setEnrichmentData] = useState({
    tone: '',
    goals: '',
    examples: '',
    constraints: []
  })
  
  const [rawPrompt, setRawPrompt] = useState('')
  const [enrichedPrompt, setEnrichedPrompt] = useState('')
  const [validation, setValidation] = useState({ isValid: false, errors: [] })
  const [isEnriching, setIsEnriching] = useState(false)
  const [hasEnrichment, setHasEnrichment] = useState(false)

  // Generate raw prompt whenever form data changes
  useEffect(() => {
    const validation = validatePromptConfig(formData)
    setValidation(validation)
    
    if (validation.isValid) {
      const prompt = generateClaudePrompt(formData)
      setRawPrompt(prompt)
    } else {
      setRawPrompt('')
      setEnrichedPrompt('')
    }
  }, [formData])

  // Trigger enrichment when form data or enrichment options change
  useEffect(() => {
    if (validation.isValid && shouldEnrich()) {
      performEnrichment()
    } else if (!validation.isValid) {
      setEnrichedPrompt('')
      setHasEnrichment(false)
    }
  }, [formData, enrichmentData, validation.isValid])

  const shouldEnrich = () => {
    return (
      enrichmentData.tone ||
      enrichmentData.goals ||
      enrichmentData.examples ||
      (enrichmentData.constraints && enrichmentData.constraints.length > 0)
    )
  }

  const performEnrichment = async () => {
    if (!validation.isValid) return

    setIsEnriching(true)
    setHasEnrichment(true)

    try {
      const enrichedData = await enrichPrompt(formData, enrichmentData)
      const enrichedXMLPrompt = generateClaudePrompt(enrichedData)
      setEnrichedPrompt(enrichedXMLPrompt)
    } catch (error) {
      console.error('Enrichment failed:', error)
      // Fallback to raw prompt if enrichment fails
      setEnrichedPrompt(rawPrompt)
      setHasEnrichment(false)
    } finally {
      setIsEnriching(false)
    }
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEnrichmentChange = (field, value) => {
    setEnrichmentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleReset = () => {
    setFormData({
      role: '',
      task: '',
      context: '',
      requirements: '',
      style: '',
      output: ''
    })
    setEnrichmentData({
      tone: '',
      goals: '',
      examples: '',
      constraints: []
    })
    setHasEnrichment(false)
  }

  const handleEnrichNow = () => {
    if (validation.isValid) {
      performEnrichment()
    }
  }

  return (
    <section id="features" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance">
            Professional AI Prompt Engineering
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            Transform basic prompts into powerful, optimized instructions with our AI-enhanced platform. 
            Built for professionals who demand precision and results.
          </p>
          <div className="flex items-center justify-center space-x-6 mt-8">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Enhancement</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Claude Optimized</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span>Professional Grade</span>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="xl:col-span-1 space-y-6">
            <PromptForm
              formData={formData}
              onChange={handleFormChange}
              onReset={handleReset}
              validation={validation}
            />
            
            {validation.isValid && (
              <EnrichmentOptions
                enrichmentData={enrichmentData}
                onChange={handleEnrichmentChange}
                isEnriching={isEnriching}
              />
            )}

            {/* Quick Stats */}
            {validation.isValid && (
              <div className="card p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                  Enhancement Stats
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {rawPrompt ? rawPrompt.length : 0}
                    </div>
                    <div className="text-xs text-gray-500">Original Length</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {enrichedPrompt ? enrichedPrompt.length : rawPrompt.length}
                    </div>
                    <div className="text-xs text-gray-500">Enhanced Length</div>
                  </div>
                </div>
                {hasEnrichment && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">
                        +{Math.round(((enrichedPrompt?.length || 0) - rawPrompt.length) / rawPrompt.length * 100)}% Enhancement
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="xl:col-span-2 space-y-6">
            <EnhancedPromptPreview
              rawPrompt={rawPrompt}
              enrichedPrompt={enrichedPrompt || rawPrompt}
              isValid={validation.isValid}
              errors={validation.errors}
              isEnriching={isEnriching}
              hasEnrichment={hasEnrichment}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default PromptGenerator 