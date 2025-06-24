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
import { routeToOptimalModel } from '../services/ModelRoutingEngine'
import { DEFAULT_MODEL, getModelById } from '../data/aiModels'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'

const PromptGenerator = () => {
  const { user, session, isAuthenticated, isPro } = useAuth()
  
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [suggestedModelId, setSuggestedModelId] = useState(null)
  const [modelRecommendation, setModelRecommendation] = useState(null)
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
    // Only suggest models when we have meaningful input
    if (formData.task && formData.task.length > 10) {
      try {
        // Use semantic routing engine with role and task context
        const role = formData.role || 'General User';
        const task = `${formData.task} ${formData.context} ${formData.requirements}`.trim();
        
        // Build constraints from enrichment data
        const constraints = {};
        if (enrichmentData.constraints?.includes('budget-friendly')) {
          constraints.maxCost = true;
        }
        if (enrichmentData.constraints?.includes('fast-response')) {
          constraints.prioritizeSpeed = true;
        }
        if (formData.task.toLowerCase().includes('image') || 
            formData.task.toLowerCase().includes('visual') ||
            formData.task.toLowerCase().includes('video') ||
            formData.task.toLowerCase().includes('audio')) {
          constraints.requireMultimodal = true;
        }
        
        const recommendation = routeToOptimalModel(role, task, constraints);
        setModelRecommendation(recommendation);
        setSuggestedModelId(recommendation.primary.modelId);
      } catch (error) {
        console.error('Model routing failed:', error);
        // Fallback to default
        setSuggestedModelId(DEFAULT_MODEL);
        setModelRecommendation(null);
      }
    } else {
      setSuggestedModelId(null);
      setModelRecommendation(null);
    }
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
        {/* Enhanced Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 mr-2" />
            Trusted by 10,000+ AI practitioners
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Simple Ideas Into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Professional AI Prompts
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Generate optimized prompts that get better results from any AI model. 
            <span className="block mt-2 text-lg font-medium text-gray-700">
              Claude, GPT, Gemini, and 14+ models supported
            </span>
          </p>

          {/* Quick Value Demo */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="grid md:grid-cols-2 gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="text-left">
                <div className="text-sm text-gray-500 mb-2 flex items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
                  Before: Basic prompt
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-600">
                  "Write a marketing email"
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm text-purple-600 mb-2 flex items-center font-medium">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                  After: AI-optimized
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg text-sm font-mono text-gray-700 border border-purple-200/50">
                  "Write a compelling marketing email that converts browsers into buyers..."
                </div>
              </div>
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
                modelRecommendation={modelRecommendation}
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