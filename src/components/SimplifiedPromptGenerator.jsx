import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Target, Wand2, Sparkles, Settings, FileText, Eye, Check, RefreshCw, ChevronRight, AlertCircle, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'
import RotatingPromptExamples from './RotatingPromptExamples'
import EnhancedPromptPreview from './EnhancedPromptPreview'
import ModelSelector from './ModelSelector'
import EnrichmentOptions from './EnrichmentOptions'
import ImprovedRoleSelector from './ImprovedRoleSelector'
import { promptEnrichmentService } from '../services/promptEnrichment'
import { UniversalPromptGenerator } from '../utils/universalPromptGenerator'

const DEFAULT_MODEL = 'gpt-4o'

const SimplifiedPromptGenerator = () => {
  const { user, session, isAuthenticated, isPro } = useAuth()
  const [formData, setFormData] = useState({
    role: '',
    task: '',
    context: '',
    requirements: '',
    format: ''
  })
  
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [enrichmentLevel, setEnrichmentLevel] = useState(3) // Default to Balanced
  const [rawPrompt, setRawPrompt] = useState('')
  const [enrichedPrompt, setEnrichedPrompt] = useState('')
  const [enrichmentResult, setEnrichmentResult] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeSection, setActiveSection] = useState(1)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [errorNotification, setErrorNotification] = useState(null)
  const [hasEnhancedCurrentInputs, setHasEnhancedCurrentInputs] = useState(false)

  // Generate model recommendation based on user context
  const getModelRecommendation = () => {
    const role = formData.role?.toLowerCase() || ''
    const task = formData.task?.toLowerCase() || ''
    
    // Simple recommendation logic based on role and task complexity
    if (role.includes('developer') || role.includes('engineer') || task.includes('code') || task.includes('technical')) {
      return {
        primary: {
          model: { name: "Claude-3.5-Sonnet" },
          reasoning: "Excellent for technical tasks and code generation with strong reasoning capabilities",
          confidence: 0.9
        },
        alternatives: [
          {
            model: { name: "GPT-4o" },
            score: 0.85,
            reasoning: "Great alternative for complex technical problem-solving"
          }
        ]
      }
    } else if (role.includes('writer') || role.includes('content') || role.includes('marketing') || task.includes('writing') || task.includes('content')) {
      return {
        primary: {
          model: { name: "GPT-4o" },
          reasoning: "Superior for creative writing, marketing content, and natural language generation",
          confidence: 0.85
        },
        alternatives: [
          {
            model: { name: "Claude-3.5-Sonnet" },
            score: 0.80,
            reasoning: "Excellent alternative with thoughtful, nuanced writing style"
          }
        ]
      }
    } else if (role.includes('analyst') || role.includes('research') || task.includes('analysis') || task.includes('data')) {
      return {
        primary: {
          model: { name: "Claude-3.5-Sonnet" },
          reasoning: "Exceptional analytical thinking and structured reasoning for complex analysis",
          confidence: 0.88
        },
        alternatives: [
          {
            model: { name: "GPT-4o" },
            score: 0.82,
            reasoning: "Strong analytical capabilities with broad knowledge base"
          }
        ]
      }
    } else {
      // Default recommendation for general use
      return {
        primary: {
          model: { name: "GPT-4o" },
          reasoning: "Well-balanced model suitable for most general tasks and conversations",
          confidence: 0.75
        },
        alternatives: [
          {
            model: { name: "Claude-3.5-Sonnet" },
            score: 0.70,
            reasoning: "Great for tasks requiring detailed reasoning and analysis"
          }
        ]
      }
    }
  }

  // Refs for sections
  const contextSectionRef = useRef(null)
  const configureSectionRef = useRef(null)
  const debounceTimeoutRef = useRef(null)
  
  // Validation
  const validation = {
    isValid: formData.role && formData.task && selectedModel,
    errors: []
  }

  // Debounced prompt generation function
  const generateRawPrompt = useCallback(() => {
    if (validation.isValid) {
      try {
        const result = UniversalPromptGenerator.generatePrompt(formData, selectedModel)
        setRawPrompt(result.prompt)
      } catch (error) {
        console.error('Error generating prompt:', error)
        setRawPrompt('')
      }
    } else {
      setRawPrompt('')
    }
  }, [formData, selectedModel, validation.isValid])

  // Update raw prompt when form data changes (debounced)
  useEffect(() => {
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Set new timeout for debounced execution
    debounceTimeoutRef.current = setTimeout(() => {
      generateRawPrompt()
    }, 300)

    // Cleanup timeout on unmount
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [generateRawPrompt])
  
  // Watch for form changes to re-enable enhance button
  useEffect(() => {
    setHasEnhancedCurrentInputs(false)
  }, [formData.role, formData.task, formData.context, formData.requirements, formData.format, enrichmentLevel, selectedModel])




  // Section detection with throttling
  useEffect(() => {
    let throttleTimeout = null
    const sections = [
      { ref: contextSectionRef, id: 1 },
      { ref: configureSectionRef, id: 2 }
    ]
    
    const observer = new IntersectionObserver(
      (entries) => {
        // Throttle updates to improve performance
        if (throttleTimeout) return
        
        throttleTimeout = setTimeout(() => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const section = sections.find(s => s.ref.current === entry.target)
              if (section) {
                setActiveSection(section.id)
              }
            }
          })
          throttleTimeout = null
        }, 100)
      },
      { threshold: 0.3, rootMargin: '-100px 0px -100px 0px' }
    )

    sections.forEach(section => {
      if (section.ref.current) {
        observer.observe(section.ref.current)
      }
    })
    
    return () => {
      observer.disconnect()
      if (throttleTimeout) {
        clearTimeout(throttleTimeout)
      }
    }
  }, [])
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleWorkflowComplete = () => {
    if (configureSectionRef.current) {
      configureSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const generatePrompt = async () => {
    if (!validation.isValid) return

    setIsGenerating(true)
    setErrorNotification(null) // Clear any existing errors
    
    try {
      // Prepare prompt data for the enrichment service
      const promptData = {
        ...formData,
        enrichmentLevel: enrichmentLevel
      }
      
      // Get user token if available
      const userToken = session?.access_token || null
      const userTier = isPro ? 'pro' : 'free'
      
      // Call the real enrichment API
      console.log('Calling enrichment API with enhancement level:', enrichmentLevel)
      const result = await promptEnrichmentService.enrichPrompt(
        promptData,
        userToken,
        userTier
      )
      
      if (result.success) {
        setEnrichedPrompt(result.data.enhancedPrompt)
        setEnrichmentResult(result.data)
        setHasEnhancedCurrentInputs(true) // Mark that current inputs have been enhanced
        
        // Force scroll to ensure the result is visible
        setTimeout(() => {
          if (configureSectionRef.current) {
            const rightPanel = configureSectionRef.current.querySelector('.bg-white.rounded-xl.shadow-md.border.border-gray-200.overflow-hidden')
            if (rightPanel) {
              rightPanel.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }
        }, 100)
      } else {
        throw new Error(result.error || 'Enhancement failed')
      }
    } catch (error) {
      console.error('Error enriching prompt:', error)
      setEnrichedPrompt(rawPrompt)
      setEnrichmentResult(null)
      
      // Show user-friendly error notification
      setErrorNotification({
        title: 'Enhancement Failed',
        message: 'We encountered an issue while enhancing your prompt. The basic version is still available to copy.',
        type: 'error'
      })
      
      // Auto-hide error after 8 seconds
      setTimeout(() => setErrorNotification(null), 8000)
    } finally {
      setIsGenerating(false)
    }
  }

  const scrollToSection = (sectionId) => {
    const refs = {
      1: contextSectionRef,
      2: configureSectionRef
    }
    
    const ref = refs[sectionId]
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Steps for progress indicator
  const steps = [
    {
      id: 1,
      completed: formData.role && formData.task
    },
    {
      id: 2,
      completed: selectedModel && (formData.role && formData.task)
    }
  ]
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
            Build Better AI Prompts
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into structured prompts that deliver exceptional results from any AI model
          </p>
        </div>

        {/* Rotating Examples */}
        <RotatingPromptExamples />

        {/* Error Notification */}
        {errorNotification && (
          <div 
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-in-out"
            role="alert"
            aria-live="assertive"
          >
            <div className={`max-w-md mx-auto rounded-xl shadow-lg border p-4 ${
              errorNotification.type === 'error' 
                ? 'bg-red-50 border-red-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className={`w-5 h-5 ${
                    errorNotification.type === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`} />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className={`text-sm font-medium ${
                    errorNotification.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    {errorNotification.title}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    errorNotification.type === 'error' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {errorNotification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => setErrorNotification(null)}
                    className={`rounded-md inline-flex ${
                      errorNotification.type === 'error' 
                        ? 'text-red-400 hover:text-red-500' 
                        : 'text-yellow-400 hover:text-yellow-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      errorNotification.type === 'error' ? 'focus:ring-red-500' : 'focus:ring-yellow-500'
                    }`}
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Progress Indicator */}
        {showProgressBar && (
          <div className="fixed top-24 right-6 z-40 transition-all duration-500 ease-in-out">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 p-3 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center space-x-3">
                {steps.map((step, index) => (
                  <div key={step.id} className="relative group">
                    <button
                      onClick={() => scrollToSection(step.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        activeSection === step.id
                          ? 'bg-blue-600 text-white shadow-md scale-110'
                          : step.completed
                          ? 'bg-green-500 text-white hover:scale-105'
                          : 'bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-white'
                      }`}
                      aria-label={`Go to step ${step.id}${step.completed ? ' (completed)' : ''}`}
                    >
                      {step.completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-semibold">{step.id}</span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Full Width */}
        <div className="space-y-20">
          
          {/* Section 1: Define Context */}
          <section ref={contextSectionRef} className="scroll-mt-32">
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full text-sm font-semibold text-indigo-700 mb-6 border border-indigo-100">
                <Target className="w-4 h-4 mr-2" />
                Step 1 of 2
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Define Your Context</h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto">Choose your role and describe what you want to accomplish</p>
            </div>

            <div className="relative">
              {/* Visual Connection Line */}
              {formData.role && (
                <div className="hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Role Selection */}
                <div className={`card-scroll-enhanced rounded-2xl shadow-lg p-8 transition-all duration-300 ${
                  formData.role 
                    ? 'border-2 border-blue-200 bg-blue-50/30' 
                    : 'border border-gray-200'
                }`}>
                  <ImprovedRoleSelector
                    selectedRole={formData.role}
                    onRoleChange={(role) => handleFormChange('role', role)}
                    onWorkflowComplete={handleWorkflowComplete}
                  />
                </div>
                
                {/* Task Description */}
                <div className={`card-scroll-enhanced rounded-2xl shadow-lg p-8 transition-all duration-300 ${
                  formData.role 
                    ? 'border-2 border-purple-200 bg-purple-50/30' 
                    : 'border border-gray-200 opacity-75'
                }`}>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Task Description</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Description <span className="text-red-500">*</span>
                    </label>
                    {formData.role && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg contextual-hint">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center animate-pulse">
                            <span className="text-white text-xs">💡</span>
                          </div>
                          <p className="text-sm text-blue-800 font-medium">
                            {formData.role === 'Marketing Specialist' && 'Describe your campaign goals, target audience, or content strategy...'}
                            {formData.role === 'Software Developer' && 'Explain the feature you want to build, bug to fix, or system to design...'}
                            {formData.role === 'UX/UI Designer' && 'Describe the interface, user flow, or design challenge you\'re working on...'}
                            {formData.role === 'Project Manager' && 'Outline the project scope, timeline, or team coordination needs...'}
                            {formData.role === 'Content Writer' && 'Describe the content type, audience, tone, and key messages...'}
                            {formData.role === 'Data Analyst' && 'Explain the data analysis, insights, or reporting requirements...'}
                            {(formData.role && !['Marketing Specialist', 'Software Developer', 'UX/UI Designer', 'Project Manager', 'Content Writer', 'Data Analyst'].includes(formData.role)) && 
                              `As a ${formData.role}, describe your specific goals and requirements...`}
                          </p>
                        </div>
                      </div>
                    )}
                    <textarea
                      value={formData.task}
                      onChange={(e) => handleFormChange('task', e.target.value)}
                      placeholder={
                        formData.role 
                          ? `Describe your ${formData.role.toLowerCase()} task or objective...`
                          : "Describe what you want to accomplish..."
                      }
                      className={`w-full h-32 px-4 py-3 border rounded-lg resize-none form-field-enhanced ${
                        formData.task.length === 0 
                          ? 'border-gray-300' 
                          : formData.task.length < 20 
                            ? 'border-yellow-300 bg-yellow-50' 
                            : formData.task.length > 450 
                              ? 'border-red-300 bg-red-50' 
                              : 'border-green-300 bg-green-50'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className={`text-xs ${
                        formData.task.length === 0 
                          ? 'text-gray-500' 
                          : formData.task.length < 20 
                            ? 'text-yellow-600' 
                            : formData.task.length > 450 
                              ? 'text-red-600' 
                              : 'text-green-600'
                      }`}>
                        {formData.task.length}/500 characters
                        {formData.task.length < 20 && formData.task.length > 0 && (
                          <span className="ml-2">• Add more details for better results</span>
                        )}
                        {formData.task.length > 450 && (
                          <span className="ml-2">• Close to limit</span>
                        )}
                        {formData.task.length >= 20 && formData.task.length <= 450 && (
                          <span className="ml-2">• Great length! ✓</span>
                        )}
                      </p>
                      {formData.task.length >= 20 && (
                        <div className="flex items-center text-xs text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          Auto-saved
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Advanced Options Toggle */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-all duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg group"
                    >
                      <Settings className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''} group-hover:scale-110`} />
                      <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                      <div className={`ml-2 text-xs px-2 py-1 rounded-full transition-all duration-200 ${
                        showAdvanced ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {showAdvanced ? 'Visible' : 'Hidden'}
                      </div>
                    </button>
                  </div>
                  
                  {/* Advanced Fields */}
                  {showAdvanced && (
                    <div className="space-y-4 pt-4 border-t border-gray-100" style={{ animation: 'fadeInUp 0.4s ease-out' }}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Context
                          <span className="text-xs text-gray-600 font-normal ml-2">
                            💡 This helps tailor the tone and complexity of your prompt
                          </span>
                        </label>
                        <textarea
                          value={formData.context}
                          onChange={(e) => handleFormChange('context', e.target.value)}
                          placeholder="Additional context or background information..."
                          className={`w-full h-24 px-4 py-3 border rounded-lg resize-none form-field-enhanced ${
                            formData.context.length === 0 
                              ? 'border-gray-300' 
                              : formData.context.length > 0 
                                ? 'border-blue-300 bg-blue-50' 
                                : 'border-gray-300'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${
                          formData.context.length > 0 ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          {formData.context.length}/300 characters
                          {formData.context.length > 0 && (
                            <span className="ml-2">• Context added ✓</span>
                          )}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Requirements
                          <span className="text-xs text-gray-600 font-normal ml-2">
                            🎯 Specify constraints or must-have elements
                          </span>
                        </label>
                        <textarea
                          value={formData.requirements}
                          onChange={(e) => handleFormChange('requirements', e.target.value)}
                          placeholder="Specific requirements, constraints, or criteria..."
                          className={`w-full h-24 px-4 py-3 border rounded-lg resize-none form-field-enhanced ${
                            formData.requirements.length === 0 
                              ? 'border-gray-300' 
                              : formData.requirements.length > 0 
                                ? 'border-purple-300 bg-purple-50' 
                                : 'border-gray-300'
                          }`}
                        />
                        <p className={`text-xs mt-1 ${
                          formData.requirements.length > 0 ? 'text-purple-700' : 'text-gray-600'
                        }`}>
                          {formData.requirements.length}/200 characters
                          {formData.requirements.length > 0 && (
                            <span className="ml-2">• Requirements specified ✓</span>
                          )}
                        </p>
                      </div>
                      
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Format
                            <span className="text-xs text-gray-600 font-normal ml-2">
                              📄 How should the output be structured?
                            </span>
                          </label>
                          <input
                            type="text"
                            value={formData.format}
                            onChange={(e) => handleFormChange('format', e.target.value)}
                            placeholder="e.g., bullet points, paragraph, step-by-step..."
                            className={`w-full px-4 py-3 border rounded-lg form-field-enhanced ${
                              formData.format.length === 0 
                                ? 'border-gray-300' 
                                : formData.format.length > 0 
                                  ? 'border-green-300 bg-green-50' 
                                  : 'border-gray-300'
                            }`}
                          />
                          <p className={`text-xs mt-1 ${
                            formData.format.length > 0 ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {formData.format.length > 0 && (
                              <span>• Format specified ✓</span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Configure & Enhance */}
          <section ref={configureSectionRef} className="scroll-mt-32">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full text-sm font-semibold text-purple-700 mb-4 border border-purple-100">
                <Wand2 className="w-4 h-4 mr-2" />
                Step 2 of 2
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Configure & Enhance</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Select your AI model, enhance your prompt, and get your optimized result</p>
            </div>

            {/* Consolidated Grid Layout */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                
                {/* Left Column: Model Selection & Enhancement */}
                <div className="space-y-6">
                  {/* AI Model Selection - Compact */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Model</h3>
                        <p className="text-sm text-gray-600">Choose the best model for your task</p>
                      </div>
                    </div>
                    <ModelSelector
                      selectedModel={selectedModel}
                      onModelChange={setSelectedModel}
                      modelRecommendation={formData.role || formData.task ? getModelRecommendation() : null}
                      compact={true}
                    />
                  </div>

                  {/* Enhancement Settings - Compact */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 relative">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Enhancement</h3>
                        <p className="text-sm text-gray-600">Fine-tune your prompt quality</p>
                      </div>
                    </div>
                    
                    {/* Loading Overlay */}
                    {isGenerating && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                          <p className="text-sm font-medium text-purple-600">Enhancing...</p>
                        </div>
                      </div>
                    )}
                    
                    <EnrichmentOptions
                      enrichmentData={{ enrichmentLevel }}
                      onChange={(field, value) => {
                        if (field === 'enrichmentLevel') {
                          setEnrichmentLevel(value)
                        }
                      }}
                      isEnriching={isGenerating}
                    />
                    
                    {/* Enhance Button */}
                    {rawPrompt && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={generatePrompt}
                          disabled={isGenerating || !validation.isValid || hasEnhancedCurrentInputs}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                        >
                          {isGenerating ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Enhancing...</span>
                            </>
                          ) : hasEnhancedCurrentInputs ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Enhanced</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span>Enhance Prompt</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Your Optimized Prompt</h3>
                          <p className="text-sm text-gray-600">
                            {validation.isValid ? 'Ready to copy and use' : 'Complete Step 1 to generate'}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                  
                  <div className="p-6 min-h-[400px]">
                    <EnhancedPromptPreview
                      rawPrompt={rawPrompt}
                      enrichedPrompt={enrichedPrompt}
                      enrichmentResult={enrichmentResult}
                      isLoading={false}
                      hasError={!validation.isValid}
                      validation={validation}
                      selectedModel={selectedModel}
                      isEnriching={isGenerating}
                      hasEnrichment={!!enrichedPrompt}
                      onEnrichNow={isPro && !hasEnhancedCurrentInputs ? generatePrompt : null}
                      isAuthenticated={isAuthenticated}
                      isPro={isPro}
                      formData={formData}
                      hasEnhancedCurrentInputs={hasEnhancedCurrentInputs}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>


        </div>
      </div>
    </div>
  )
}

export default SimplifiedPromptGenerator 