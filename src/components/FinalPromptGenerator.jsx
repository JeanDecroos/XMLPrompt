import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Sparkles, Zap, Target, Wand2, ChevronDown, ChevronUp, Settings, Crown, ArrowDown } from 'lucide-react'
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

const FinalPromptGenerator = () => {
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

  // Session history
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
  
  const [showHistory, setShowHistory] = useState(false)
  const [showSupportingTools, setShowSupportingTools] = useState(false)

  const debounceTimerRef = React.useRef(null)

  // Track state changes
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

  // Session history handlers
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

  // Determine if user has access to all features
  const hasFullAccess = !isAuthEnabled || (isAuthEnabled && isAuthenticated && isPro)

  // Generate prompt
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

  // Model routing
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

  // Auto-enrichment
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

  const performGPTEnrichment = async () => {
    if (!validation.isValid) return
    setIsEnriching(true)
    setEnrichmentError(null)

    try {
      const enrichmentRequest = {
        rawPrompt,
        formData,
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

  // Event handlers
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    trackStateChange()
  }

  const handleEnrichmentChange = (field, value) => {
    setEnrichmentData(prev => ({ ...prev, [field]: value }))
    trackStateChange()
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
          if (canUndo) handleUndo()
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault()
          if (canRedo) handleRedo()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [canUndo, canRedo, handleUndo, handleRedo])

  // Auto-enrich
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

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-8 bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* PRIORITY 1: VALUE DEMONSTRATION - Basic → Structured → Enhanced */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 mr-2" />
            See The Transformation In Action
          </div>
          
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Turn Basic Ideas Into
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">
              Professional AI Prompts
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Watch how our AI transforms simple requests into optimized prompts that get better results
          </p>

          {/* Featured Examples - Value Demonstration */}
          <div className="mb-12">
            <RotatingPromptExamples />
          </div>

          {/* Call to Action - Direct to Core Functionality */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex flex-col items-center">
              <p className="text-md font-medium text-gray-700 mb-3">
                Ready to create your own professional prompts?
              </p>
              <ArrowDown className="w-6 h-6 text-blue-600 animate-bounce" />
            </div>
          </div>
        </div>

        {/* PRIORITY 2: CORE FUNCTIONALITY - Prompt Enriching & Enhancement */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Create Your Optimized Prompts
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Professional prompt builder with AI enhancement for better results
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT: Prompt Builder */}
            <div className="card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Prompt Builder</h3>
                  {hasFullAccess && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200/60">
                      <Crown className="w-3 h-3 text-purple-600" />
                      <span className="text-xs text-purple-700 font-medium">Full Access</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Always show all form fields for premium users */}
              <PromptForm
                formData={formData}
                onChange={handleFormChange}
                onReset={handleReset}
                validation={validation}
                showAdvancedByDefault={hasFullAccess} // Show all fields for premium users
                forceShowAdvanced={hasFullAccess} // Force all fields to be visible for premium
              />
              

            </div>

            {/* RIGHT: Generated Prompts & Results */}
            <div className="card p-6 space-y-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Generated Prompts</h3>
              </div>
              
              {/* Model Selection - Integrated */}
              <div className="card-secondary p-4">
                <ModelSelector
                  selectedModel={selectedModel}
                  suggestedModelId={suggestedModelId}
                  modelRecommendation={modelRecommendation}
                  onModelChange={handleModelChange}
                  compact={true}
                />
              </div>
              
              {/* Enhanced Prompt Results */}
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
              
              {/* Enhanced Enrichment Options for Premium Users */}
              {hasFullAccess && (
                <div className="mt-6 card p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h4 className="text-lg font-semibold text-gray-900">AI Enhancement Options</h4>
                  </div>
                  <EnrichmentOptions
                    enrichmentData={enrichmentData}
                    onChange={handleEnrichmentChange}
                    validation={validation}
                  />
                </div>
              )}
              
              {/* Premium Upgrade Prompt for Free Users */}
              {!hasFullAccess && isAuthEnabled && (
                <div className="mt-4 card p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 text-amber-600" />
                    <h4 className="text-lg font-semibold text-gray-900">Unlock Full Potential</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Get access to all prompt fields, AI enhancement options, and advanced features
                  </p>
                  <button className="btn btn-premium btn-sm">
                    <Crown className="w-4 h-4 mr-1" />
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRIORITY 3: SUPPORTING FEATURES - Organized and Accessible */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <button
              onClick={() => setShowSupportingTools(!showSupportingTools)}
              className="inline-flex items-center px-6 py-3 card-secondary rounded-lg hover:shadow-md transition-all duration-200"
            >
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              <span className="font-medium text-gray-900">
                {showSupportingTools ? 'Hide' : 'Show'} Prompt Library & History
              </span>
              {showSupportingTools ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
            </button>
          </div>

          {showSupportingTools && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
              
              {/* Session History & Workflow Tools */}
              <div className="card-secondary p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-blue-600" />
                    Session History & Workflow
                  </h3>
                  <div className="text-sm text-gray-500 hidden sm:block">
                    Ctrl+Z / Ctrl+Y
                  </div>
                </div>
                
                <SessionHistoryControls
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  onClear={clearSessionHistory}
                  historyStats={getHistoryStats()}
                />
                
                {getHistoryStats().total > 1 && (
                  <p className="text-sm text-gray-600 mt-3">
                    Navigate through {getHistoryStats().total} prompt variations without losing your work
                  </p>
                )}

                {/* Additional workflow tools */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="btn btn-secondary btn-sm w-full"
                  >
                    View Saved Prompts Library
                  </button>
                </div>
              </div>

              {/* Analytics & Insights (Premium Feature) */}
              <div className={hasFullAccess ? "card-accent p-6" : "card-secondary p-6"}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-600" />
                    Analytics & Insights
                    {hasFullAccess && (
                      <Crown className="w-4 h-4 ml-2 text-purple-600" />
                    )}
                  </h3>
                </div>
                
                {hasFullAccess ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{getHistoryStats().total}</div>
                        <div className="text-sm text-blue-700">Prompts Created</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{hasEnrichment ? '✓' : '○'}</div>
                        <div className="text-sm text-purple-700">AI Enhanced</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Track your prompt performance and optimization patterns
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Unlock detailed analytics and insights about your prompt performance
                    </p>
                    <button className="btn btn-premium btn-sm">
                      Upgrade for Analytics
                    </button>
                  </div>
                )}
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

export default FinalPromptGenerator 