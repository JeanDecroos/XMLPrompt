import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Sparkles, Zap, Target, Wand2, ChevronDown, ChevronUp, Settings } from 'lucide-react'
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

const RedesignedPromptGenerator = () => {
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
    constraints: [],
    enrichmentLevel: 50
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
  
  // Layout control states
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [showSupportingTools, setShowSupportingTools] = useState(false)

  // Debounce timer for session state tracking
  const debounceTimerRef = React.useRef(null)

  // Track significant state changes for session history
  const trackStateChange = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      const currentState = {
        formData,
        enrichmentData,
        selectedModel,
        userHasOverridden,
        timestamp: Date.now()
      }
      pushSessionState(currentState)
    }, 1000)
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

  // Model routing logic
  useEffect(() => {
    if (formData.task && formData.task.length > 10) {
      try {
        const role = formData.role || 'General User';
        const task = `${formData.task} ${formData.context} ${formData.requirements}`.trim();
        
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
        setSuggestedModelId(DEFAULT_MODEL);
        setModelRecommendation(null);
      }
    } else {
      setSuggestedModelId(null);
      setModelRecommendation(null);
    }
  }, [formData, enrichmentData]);

  useEffect(() => {
    if (suggestedModelId && !userHasOverridden) {
      setSelectedModel(suggestedModelId);
    }
  }, [suggestedModelId, userHasOverridden]);

  // Auto-enrich logic
  useEffect(() => {
    if (validation.isValid && isAuthEnabled && isAuthenticated && formData.task) {
      const debounceTimer = setTimeout(() => {
        if (shouldEnrich()) {
          performGPTEnrichment()
        }
      }, 2000)
      
      return () => clearTimeout(debounceTimer)
    }
  }, [validation.isValid, formData, isAuthenticated])

  const shouldEnrich = () => {
    return (
      validation.isValid &&
      !hasEnrichment &&
      !isEnriching &&
      formData.task.length > 20 &&
      isAuthEnabled &&
      isAuthenticated
    )
  }

  const performLegacyEnrichment = async () => {
    if (!validation.isValid) return

    setIsEnriching(true)
    setEnrichmentError(null)

    try {
      const enrichedResult = await enrichPrompt(rawPrompt, formData, selectedModel)
      setEnrichedPrompt(enrichedResult.prompt)
      setEnrichmentResult(enrichedResult)
      setHasEnrichment(true)
    } catch (error) {
      console.error('Enrichment failed:', error)
      setEnrichmentError('Failed to enhance prompt. Please try again.')
    } finally {
      setIsEnriching(false)
    }
  }

  const performGPTEnrichment = async () => {
    if (!validation.isValid) return

    setIsEnriching(true)
    setEnrichmentError(null)

    try {
      const enrichmentRequest = {
        rawPrompt,
        formData: {
          ...formData,
          enrichmentLevel: enrichmentData.enrichmentLevel || 50
        },
        selectedModel,
        userContext: {
          role: formData.role,
          previousPrompts: [],
          preferences: enrichmentData
        }
      }

      const result = await promptEnrichmentService.enhancePrompt(enrichmentRequest)
      
      if (result.success) {
        setEnrichedPrompt(result.data.enhancedPrompt)
        setEnrichmentResult(result.data)
        setHasEnrichment(true)
      } else {
        throw new Error(result.error || 'Enhancement failed')
      }
    } catch (error) {
      console.error('GPT enhancement failed:', error)
      setEnrichmentError('Failed to enhance prompt. Please try again.')
    } finally {
      setIsEnriching(false)
    }
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    trackStateChange()
  }

  const handleEnrichmentChange = (field, value) => {
    setEnrichmentData(prev => ({ ...prev, [field]: value }))
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
    clearSessionHistory()
  }

  const handleModelChange = useCallback((modelId) => {
    setUserHasOverridden(true);
    setSelectedModel(modelId);
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
    setFormData(promptData.formData)
    
    if (promptData.selectedModel) {
      setSelectedModel(promptData.selectedModel)
      setUserHasOverridden(true)
    }
    
    setRawPrompt(promptData.rawPrompt || '')
    setEnrichedPrompt(promptData.enrichedPrompt || '')
    setPromptMetadata(promptData.promptMetadata || null)
    setEnrichmentResult(promptData.enrichmentResult || null)
    setHasEnrichment(!!promptData.enrichedPrompt)

    clearSessionHistory()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-12 bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Streamlined Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-4 animate-fade-in">
            <Sparkles className="w-4 h-4 mr-2" />
            Professional AI Prompt Generator
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Create 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mx-2">
              Professional Prompts
            </span>
            Instantly
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Transform simple ideas into optimized prompts that work with any AI model
          </p>
        </div>

        {/* PRIORITY 1: CORE FUNCTIONALITY - Prompt Builder & Results */}
        <div className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* PRIMARY: Prompt Builder */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Prompt Builder</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    {showAdvancedSettings ? 'Hide' : 'Show'} Advanced
                    {showAdvancedSettings ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                  </button>
                </div>
              </div>
              
              <PromptForm
                formData={formData}
                onChange={handleFormChange}
                onReset={handleReset}
                validation={validation}
                showAdvancedByDefault={showAdvancedSettings}
              />
              
              {/* Advanced Settings Panel */}
              {showAdvancedSettings && (
                <div className="mt-6">
                  <EnrichmentOptions
                    enrichmentData={enrichmentData}
                    onChange={handleEnrichmentChange}
                    validation={validation}
                  />
                </div>
              )}
            </div>

            {/* PRIMARY: Generated Prompts */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Generated Prompts</h2>
              </div>
              
              {/* Model Selection - Compact */}
              <div className="bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 p-4">
                <ModelSelector
                  selectedModel={selectedModel}
                  suggestedModelId={suggestedModelId}
                  modelRecommendation={modelRecommendation}
                  onModelChange={handleModelChange}
                  compact={true}
                />
              </div>
              
              {/* Prompt Results */}
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

        {/* PRIORITY 2: SUPPORTING TOOLS - Collapsible Section */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowSupportingTools(!showSupportingTools)}
              className="inline-flex items-center px-6 py-3 bg-white/70 backdrop-blur-sm rounded-lg border border-gray-200 hover:bg-white/80 transition-all duration-200 shadow-sm"
            >
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              <span className="font-medium text-gray-900">
                {showSupportingTools ? 'Hide' : 'Show'} Supporting Tools
              </span>
              {showSupportingTools ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
            </button>
          </div>

          {showSupportingTools && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Session History */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    Session History
                  </h3>
                  <div className="text-sm text-gray-500 hidden sm:block">
                    Use Ctrl+Z / Ctrl+Y for quick navigation
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
                  <p className="text-sm text-gray-600 mt-3">
                    Navigate through {getHistoryStats().total} prompt variations without losing your work
                  </p>
                )}
              </div>

              {/* Prompt Examples */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Prompt Examples & inspiration
                  </h3>
                </div>
                
                <RotatingPromptExamples />
              </div>
            </div>
          )}
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

export default RedesignedPromptGenerator 