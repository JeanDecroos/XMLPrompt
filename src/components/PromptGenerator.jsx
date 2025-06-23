import React, { useState, useEffect } from 'react'
import PromptForm from './PromptForm'
import EnrichmentOptions from './EnrichmentOptions'
import EnhancedPromptPreview from './EnhancedPromptPreview'
import ModelSelector from './ModelSelector'
import { generateClaudePrompt, validatePromptConfig } from '../utils/promptGenerator'
import { enrichPrompt } from '../utils/promptEnricher'
import { promptEnrichmentService } from '../services/promptEnrichment'
import { UniversalPromptGenerator } from '../utils/universalPromptGenerator'
import { DEFAULT_MODEL, getModelById } from '../data/aiModels'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'

const PromptGenerator = () => {
  const { user, session, isAuthenticated, isPro } = useAuth()
  
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
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
  const [promptMetadata, setPromptMetadata] = useState(null)
  const [enrichmentResult, setEnrichmentResult] = useState(null)
  const [validation, setValidation] = useState({ isValid: false, errors: [] })
  const [isEnriching, setIsEnriching] = useState(false)
  const [hasEnrichment, setHasEnrichment] = useState(false)
  const [enrichmentError, setEnrichmentError] = useState(null)

  // Generate raw prompt whenever form data or model changes
  useEffect(() => {
    const validation = UniversalPromptGenerator.validatePrompt(formData, selectedModel)
    setValidation(validation)
    
    if (validation.isValid) {
      try {
        const result = UniversalPromptGenerator.generatePrompt(formData, selectedModel)
        setRawPrompt(result.prompt)
        setPromptMetadata(result.metadata)
      } catch (error) {
        console.error('Prompt generation failed:', error)
        // Fallback to Claude format for compatibility
        const prompt = generateClaudePrompt(formData)
        setRawPrompt(prompt)
        setPromptMetadata({ format: 'xml', estimatedTokens: Math.ceil(prompt.length / 4) })
      }
    } else {
      setRawPrompt('')
      setEnrichedPrompt('')
      setEnrichmentResult(null)
      setPromptMetadata(null)
    }
  }, [formData, selectedModel])

  // Auto-enrich for authenticated users when form data changes (only if auth is enabled)
  useEffect(() => {
    if (validation.isValid && isAuthEnabled && isAuthenticated && formData.task) {
      const debounceTimer = setTimeout(() => {
        performGPTEnrichment()
      }, 1000) // Debounce to avoid too many API calls
      
      return () => clearTimeout(debounceTimer)
    }
  }, [formData, validation.isValid, isAuthenticated])

  const shouldEnrich = () => {
    return (
      enrichmentData.tone ||
      enrichmentData.goals ||
      enrichmentData.examples ||
      (enrichmentData.constraints && enrichmentData.constraints.length > 0)
    )
  }

  const performLegacyEnrichment = async () => {
    if (!validation.isValid) return

    setIsEnriching(true)
    setHasEnrichment(true)

    try {
      const enrichedData = await enrichPrompt(formData, enrichmentData)
      const enrichedXMLPrompt = generateClaudePrompt(enrichedData)
      setEnrichedPrompt(enrichedXMLPrompt)
    } catch (error) {
      console.error('Legacy enrichment failed:', error)
      setEnrichedPrompt(rawPrompt)
      setHasEnrichment(false)
    } finally {
      setIsEnriching(false)
    }
  }

  const performGPTEnrichment = async () => {
    if (!validation.isValid) return

    setIsEnriching(true)
    setEnrichmentError(null)

    try {
      const userToken = session?.access_token
      const result = await promptEnrichmentService.enrichPrompt(formData, userToken)
      
      if (result.success) {
        setEnrichedPrompt(result.data.enrichedPrompt)
        setEnrichmentResult(result.data)
        setHasEnrichment(true)
      } else {
        // Use fallback if enrichment fails
        setEnrichedPrompt(result.fallback?.enrichedPrompt || rawPrompt)
        setEnrichmentResult(result.fallback)
        setEnrichmentError(result.error)
        setHasEnrichment(false)
      }
    } catch (error) {
      console.error('GPT enrichment failed:', error)
      setEnrichedPrompt(rawPrompt)
      setEnrichmentError('Failed to enhance prompt')
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
    setEnrichmentResult(null)
    setEnrichmentError(null)
    setPromptMetadata(null)
  }

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId)
  }

  const handleEnrichNow = () => {
    if (validation.isValid) {
      if (isAuthEnabled && isAuthenticated) {
        performGPTEnrichment()
      } else {
        performLegacyEnrichment()
      }
    }
  }

  return (
    <section id="features" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Universal AI Prompt Engineering
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Create optimized prompts for any AI model with intelligent format adaptation. 
            Professional prompt engineering made simple.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>7 AI Models Supported</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Smart Format Detection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>{isAuthEnabled ? 'Authentication Active' : 'Demo Mode'}</span>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Configuration */}
          <div className="xl:col-span-1 space-y-6">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              estimatedTokens={promptMetadata?.estimatedTokens}
            />
            
            <PromptForm
              formData={formData}
              onChange={handleFormChange}
              onReset={handleReset}
              validation={validation}
            />
          </div>

          {/* Right Column - Results */}
          <div className="xl:col-span-2">
            <EnhancedPromptPreview
              rawPrompt={rawPrompt}
              enrichedPrompt={enrichedPrompt}
              enrichmentResult={enrichmentResult}
              promptMetadata={promptMetadata}
              selectedModel={selectedModel}
              validation={validation}
              isEnriching={isEnriching}
              hasEnrichment={hasEnrichment}
              onEnrichNow={handleEnrichNow}
              enrichmentError={enrichmentError}
              isAuthenticated={isAuthenticated}
              isPro={isPro}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default PromptGenerator 