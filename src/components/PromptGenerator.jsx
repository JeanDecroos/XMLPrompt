import React, { useState, useEffect, useCallback } from 'react'
import { Sparkles, Zap, Target, Wand2 } from 'lucide-react'
import PromptForm from './PromptForm'
import EnrichmentOptions from './EnrichmentOptions'
import EnhancedPromptPreview from './EnhancedPromptPreview'
import ModelSelector from './ModelSelector'
import PromptHistory from './PromptHistory'
import { generateClaudePrompt, validatePromptConfig } from '../utils/promptGenerator'
import { enrichPrompt } from '../utils/promptEnricher'
import { promptEnrichmentService } from '../services/promptEnrichment'
import { UniversalPromptGenerator } from '../utils/universalPromptGenerator'
import { suggestModelForPrompt } from '../utils/modelInferenceEngine'
import { DEFAULT_MODEL, getModelById } from '../data/aiModels'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'

const PromptGenerator = () => {
  const { user, session, isAuthenticated, isPro } = useAuth()
  
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [suggestedModelId, setSuggestedModelId] = useState(null)
  const [userHasOverridden, setUserHasOverridden] = useState(false)

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
  
  // History modal state
  const [showHistory, setShowHistory] = useState(false)

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

  // New: Infer model based on prompt configuration
  useEffect(() => {
    const suggested = suggestModelForPrompt(formData, enrichmentData);
    setSuggestedModelId(suggested);
  }, [formData, enrichmentData]);

  // New: Update selected model to suggestion if user hasn't overridden
  useEffect(() => {
    if (suggestedModelId && !userHasOverridden) {
      setSelectedModel(suggestedModelId);
    }
  }, [suggestedModelId, userHasOverridden]);

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

  const handleModelChange = useCallback((modelId) => {
    setUserHasOverridden(true);
    setSelectedModel(modelId);
  }, []);

  const handleEnrichNow = () => {
    if (validation.isValid) {
      if (isAuthEnabled && isAuthenticated) {
        performGPTEnrichment()
      } else {
        performLegacyEnrichment()
      }
    }
  }

  const handleLoadPrompt = (promptData) => {
    // Load form data
    setFormData(promptData.formData)
    
    // Load model selection
    if (promptData.selectedModel) {
      setSelectedModel(promptData.selectedModel)
      setUserHasOverridden(true)
    }
    
    // Load prompts and metadata
    setRawPrompt(promptData.rawPrompt || '')
    setEnrichedPrompt(promptData.enrichedPrompt || '')
    setPromptMetadata(promptData.promptMetadata || null)
    setEnrichmentResult(promptData.enrichmentResult || null)
    setHasEnrichment(!!promptData.enrichedPrompt)
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Prompt Engineering
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Create Perfect Prompts for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Any AI Model
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Generate optimized prompts with intelligent format adaptation, model-specific guidelines, 
            and AI-powered enhancement. Save your creations and build a library of effective prompts.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-500" />
              Universal Format Support
            </div>
            <div className="flex items-center">
              <Zap className="w-4 h-4 mr-2 text-blue-500" />
              AI Enhancement
            </div>
            <div className="flex items-center">
              <Wand2 className="w-4 h-4 mr-2 text-purple-500" />
              Smart Model Selection
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Prompt Configuration */}
          <div className="xl:col-span-1 space-y-8 relative z-20">
            <div>
              <PromptForm
                formData={formData}
                onChange={handleFormChange}
                onReset={handleReset}
                validation={validation}
              />
            </div>
          </div>

          {/* Right Column - Model Selection & Results */}
          <div className="xl:col-span-2 space-y-8 relative z-30">
            <div>
              <ModelSelector
                selectedModel={selectedModel}
                suggestedModelId={suggestedModelId}
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
                formData={formData}
                onOpenHistory={() => setShowHistory(true)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Prompt History Modal */}
      <PromptHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadPrompt={handleLoadPrompt}
      />
    </section>
  )
}

export default PromptGenerator 