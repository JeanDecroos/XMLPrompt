import React, { useState, useEffect } from 'react'
import { Sparkles, Zap, Target, Wand2 } from 'lucide-react'
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
    <section id="features" className="py-20 hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-20 fade-in">
          <div className="inline-flex items-center justify-center p-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200/60 mb-6 hover-lift">
            <Wand2 className="w-6 h-6 text-purple-600 mr-2" />
            <span className="text-sm font-semibold text-purple-600 px-3">
              Professional AI Prompt Engineering
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-shimmer">
            Craft Perfect Prompts
          </h1>
          <h2 className="text-2xl lg:text-3xl font-light text-gray-600 mb-8">
            For Any AI Model, Every Time
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Transform your ideas into optimized prompts with intelligent format adaptation. 
            Professional-grade prompt engineering made accessible to everyone.
          </p>
          
          {/* Enhanced Status Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <div className="status-indicator stagger-1">
              <div className="status-dot bg-green-500"></div>
              <span className="font-medium">7 AI Models</span>
            </div>
            <div className="status-indicator stagger-2">
              <div className="status-dot bg-blue-500"></div>
              <span className="font-medium">Smart Formatting</span>
            </div>
            <div className="status-indicator stagger-3">
              <div className="status-dot bg-purple-500"></div>
              <span className="font-medium">
                {isAuthEnabled ? 'Enhanced Mode' : 'Demo Mode'}
              </span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <div className="card hover-lift p-6 text-center slide-up stagger-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Precision Targeting</h3>
              <p className="text-gray-600 text-sm">
                Optimized for each AI model's unique capabilities and requirements
              </p>
            </div>
            
            <div className="card hover-lift p-6 text-center slide-up stagger-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Enhancement</h3>
              <p className="text-gray-600 text-sm">
                Intelligent prompt enrichment for better results and clarity
              </p>
            </div>
            
            <div className="card hover-lift p-6 text-center slide-up stagger-3">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Generation</h3>
              <p className="text-gray-600 text-sm">
                Real-time prompt creation with immediate preview and validation
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Main Interface */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Prompt Configuration */}
          <div className="xl:col-span-1 space-y-8">
            <div className="slide-up stagger-1">
              <PromptForm
                formData={formData}
                onChange={handleFormChange}
                onReset={handleReset}
                validation={validation}
              />
            </div>
          </div>

          {/* Right Column - Model Selection & Results */}
          <div className="xl:col-span-2 space-y-8">
            <div>
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
              />
            </div>
            
            <div>
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
      </div>
    </section>
  )
}

export default PromptGenerator 