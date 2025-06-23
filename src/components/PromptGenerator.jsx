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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          AI-Enhanced XML Prompt Generator
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Create structured, effective prompts with AI-powered enhancement. Start with basic input, 
          then watch as intelligent optimization transforms it into a professional Claude Sonnet prompt.
        </p>
      </div>

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
  )
}

export default PromptGenerator 