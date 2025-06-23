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
    <section id="features" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 text-balance">
            Universal AI Prompt Engineering
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            Generate optimized prompts for any AI model with intelligent format adaptation. 
            From Claude to GPT, Gemini to Llama - we've got you covered.
          </p>
          <div className="flex items-center justify-center space-x-6 mt-8">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Status</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{isAuthEnabled ? 'Authentication Active' : 'Demo Mode'}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>7 AI Models</span>
            </div>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="xl:col-span-1 space-y-6">
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
              estimatedTokens={promptMetadata?.estimatedTokens || 0}
            />
            
            <PromptForm
              formData={formData}
              onChange={handleFormChange}
              onReset={handleReset}
              validation={validation}
            />
            
            {validation.isValid && !isAuthenticated && (
              <EnrichmentOptions
                enrichmentData={enrichmentData}
                onChange={handleEnrichmentChange}
                isEnriching={isEnriching}
              />
            )}

            {/* Enhanced Stats for Authenticated Users */}
            {validation.isValid && enrichmentResult && (
              <div className="card p-4">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                  Enhancement Stats
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {enrichmentResult.qualityScore || 7}
                    </div>
                    <div className="text-xs text-gray-500">Quality Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {enrichmentResult.tokensUsed || 0}
                    </div>
                    <div className="text-xs text-gray-500">Tokens Used</div>
                  </div>
                </div>
                {enrichmentResult.processingTime && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">
                        Processed in {enrichmentResult.processingTime}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legacy Stats for Non-authenticated Users */}
            {validation.isValid && !enrichmentResult && (
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
          <div className="xl:col-span-2">
            <EnhancedPromptPreview
              rawPrompt={rawPrompt}
              enrichedPrompt={enrichedPrompt}
              enrichmentResult={enrichmentResult}
              promptMetadata={promptMetadata}
              selectedModel={selectedModel}
              isEnriching={isEnriching}
              hasEnrichment={hasEnrichment}
              onEnrichNow={handleEnrichNow}
              validation={validation}
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