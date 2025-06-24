import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Sparkles, Zap, Target, Wand2 } from 'lucide-react'
import PromptForm from './PromptForm'
import EnrichmentOptions from './EnrichmentOptions'
import EnhancedPromptPreview from './EnhancedPromptPreview'
import ModelSelector from './ModelSelector'
import PromptHistory from './PromptHistory'
import RotatingPromptExamples from './RotatingPromptExamples'
import SessionHistoryControls from './SessionHistoryControls'
import { generateClaudePrompt, validatePromptConfig } from '../utils/promptGenerator'
import { enrichPrompt } from '../utils/promptEnricher'
import { promptEnrichmentService } from '../services/promptEnrichment'
import { UniversalPromptGenerator } from '../utils/universalPromptGenerator'
import { routeToOptimalModel } from '../services/ModelRoutingEngine'
import { DEFAULT_MODEL, getModelById } from '../data/aiModels'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'
import { useSessionHistory } from '../hooks/useSessionHistory'

const PromptGenerator = () => {
  const { user, session, isAuthenticated, isPro } = useAuth()
  
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [suggestedModelId, setSuggestedModelId] = useState(null)
  const [modelRecommendation, setModelRecommendation] = useState(null)
  const [userHasOverridden, setUserHasOverridden] = useState(false)

  const initialFormData = {
    role: '',
    task: '',
    context: '',
    requirements: '',
    style: '',
    output: ''
  }

  const initialEnrichmentData = {
    tone: '',
    goals: '',
    examples: '',
    constraints: []
  }

  // Initialize session history with initial state
  const initialSessionState = useMemo(() => ({
    formData: initialFormData,
    enrichmentData: initialEnrichmentData,
    selectedModel: DEFAULT_MODEL,
    userHasOverridden: false,
    timestamp: Date.now()
  }), [])

  const {
    pushState: pushSessionState,
    undo: undoSessionState,
    redo: redoSessionState,
    clearHistory: clearSessionHistory,
    canUndo,
    canRedo,
    getHistoryStats
  } = useSessionHistory(initialSessionState)

  const [formData, setFormData] = useState(initialFormData)
  const [enrichmentData, setEnrichmentData] = useState(initialEnrichmentData)
  
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

  // Debounce timer for session state tracking
  const debounceTimerRef = React.useRef(null)

  // Track significant state changes for session history
  const trackStateChange = useCallback(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer to debounce rapid changes
    debounceTimerRef.current = setTimeout(() => {
      const currentState = {
        formData,
        enrichmentData,
        selectedModel,
        userHasOverridden,
        timestamp: Date.now()
      }
      pushSessionState(currentState)
    }, 1000) // 1 second debounce
  }, [formData, enrichmentData, selectedModel, userHasOverridden, pushSessionState])

  // Handle session history navigation
  const handleUndo = useCallback(() => {
    const previousState = undoSessionState()
    if (previousState) {
      setFormData(previousState.formData)
      setEnrichmentData(previousState.enrichmentData)
      setSelectedModel(previousState.selectedModel)
      setUserHasOverridden(previousState.userHasOverridden)
    }
  }, [undoSessionState])

  const handleRedo = useCallback(() => {
    const nextState = redoSessionState()
    if (nextState) {
      setFormData(nextState.formData)
      setEnrichmentData(nextState.enrichmentData)
      setSelectedModel(nextState.selectedModel)
      setUserHasOverridden(nextState.userHasOverridden)
    }
  }, [redoSessionState])

  const handleClearSessionHistory = useCallback(() => {
    clearSessionHistory()
  }, [clearSessionHistory])

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
    // Track state change for session history
    trackStateChange()
  }

  const handleEnrichmentChange = (field, value) => {
    setEnrichmentData(prev => ({
      ...prev,
      [field]: value
    }))
    // Track state change for session history
    trackStateChange()
  }

  const handleReset = () => {
    setFormData(initialFormData)
    setEnrichmentData(initialEnrichmentData)
    setSelectedModel(DEFAULT_MODEL)
    setUserHasOverridden(false)
    setHasEnrichment(false)
    setEnrichmentResult(null)
    setEnrichmentError(null)
    setPromptMetadata(null)
    
    // Clear session history on reset
    clearSessionHistory()
  }

  const handleModelChange = useCallback((modelId) => {
    setUserHasOverridden(true);
    setSelectedModel(modelId);
    // Track state change for session history
    trackStateChange()
  }, [trackStateChange]);

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

    // Clear session history when loading a prompt
    clearSessionHistory()
  }

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if user is typing in an input/textarea
      const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || 
                      e.target.contentEditable === 'true'
      
      if (!isTyping && (e.ctrlKey || e.metaKey)) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          if (canUndo) {
            handleUndo()
          }
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault()
          if (canRedo) {
            handleRedo()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, handleUndo, handleRedo])

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
              Claude, GPT, Gemini, and 40+ models supported
            </span>
          </p>

          {/* Dynamic Rotating Examples */}
          <RotatingPromptExamples />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Prompt Configuration */}
          <div className="xl:col-span-1 space-y-8 relative z-20">
            {/* Session History Controls */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-blue-600" />
                  Session History
                </h3>
                <div className="text-xs text-gray-500 hidden sm:block">
                  Ctrl+Z / Ctrl+Y
                </div>
              </div>
              <SessionHistoryControls
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onClear={handleClearSessionHistory}
                historyStats={getHistoryStats()}
              />
              {getHistoryStats().total > 1 && (
                <p className="text-xs text-gray-500 mt-2">
                  Navigate through your prompt variations without losing work
                </p>
              )}
            </div>

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