import React, { useState, useEffect, useRef } from 'react'
import { Target, Wand2, Sparkles, Settings, FileText, Eye, Check, RefreshCw, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'
import ModelSelector from './ModelSelector'
import ImprovedRoleSelector from './ImprovedRoleSelector'
import EnhancedPromptPreview from './EnhancedPromptPreview'
import RotatingPromptExamples from './RotatingPromptExamples'
import { promptEnrichmentService } from '../services/promptEnrichment'
import { UniversalPromptGenerator } from '../utils/universalPromptGenerator'

const DEFAULT_MODEL = 'gpt-4'

const SimplifiedPromptGenerator = () => {
  const { user, session, isAuthenticated, isPro } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState({
    role: '',
    task: '',
    context: '',
    requirements: '',
    style: '',
    output: ''
  })
  
  // UI state
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [showProgressBar, setShowProgressBar] = useState(false)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [error, setError] = useState(null)
  
  // Prompt state
  const [rawPrompt, setRawPrompt] = useState('')
  const [enrichedPrompt, setEnrichedPrompt] = useState('')
  const [enrichmentResult, setEnrichmentResult] = useState(null)
  const [isEnriching, setIsEnriching] = useState(false)
  const [hasEnrichment, setHasEnrichment] = useState(false)
  
  // Refs for scrolling
  const contextSectionRef = useRef(null)
  const configureSectionRef = useRef(null)
  const resultSectionRef = useRef(null)
  
  // Generate raw prompt
  useEffect(() => {
    if (formData.role && formData.task) {
      const result = UniversalPromptGenerator.generatePrompt(formData, selectedModel)
      setRawPrompt(result.prompt)
    } else {
      setRawPrompt('')
    }
  }, [formData, selectedModel])
  
  // Validation
  const validation = {
    isValid: formData.role && formData.task.trim().length > 0,
    errors: []
  }
  
  // Step completion logic
  const stepCompletion = {
    1: formData.role && formData.task.trim().length > 0,
    2: validation.isValid && selectedModel,
    3: validation.isValid && (rawPrompt || enrichedPrompt)
  }
  
  // Scroll detection for active section
  useEffect(() => {
    let scrollTimeout
    
    const handleScroll = () => {
      const sections = [
        { ref: contextSectionRef, id: 1 },
        { ref: configureSectionRef, id: 2 },
        { ref: resultSectionRef, id: 3 }
      ]
      
      const scrollPosition = window.scrollY + 200
      let currentSection = 0
      
      // Track scroll offset and scrolling state
      setScrollOffset(window.scrollY)
      setIsScrolling(true)
      
      // Clear existing timeout
      clearTimeout(scrollTimeout)
      
      // Set scrolling to false after scroll stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
      
      // Check if we've reached the prompt builder section
      if (contextSectionRef.current) {
        const rect = contextSectionRef.current.getBoundingClientRect()
        const absoluteTop = rect.top + window.scrollY
        
        if (scrollPosition >= absoluteTop - 100) {
          setShowProgressBar(true)
        } else {
          setShowProgressBar(false)
        }
      }
      
      // Determine active section
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i]
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect()
          const absoluteTop = rect.top + window.scrollY
          
          if (scrollPosition >= absoluteTop) {
            currentSection = section.id
            break
          }
        }
      }
      
      setActiveSection(currentSection)
    }
    
    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])
  
  // Handle form changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  // Handle model selection
  const handleModelChange = (modelId) => {
    setSelectedModel(modelId)
  }
  
  // Handle enrichment
  const handleEnrichment = async () => {
    if (!validation.isValid || !rawPrompt) return
    
    setIsEnriching(true)
    setError(null)
    
    try {
      const userToken = session?.access_token
      const result = await promptEnrichmentService.enrichPrompt(formData, userToken)
      
      if (result.success) {
        setEnrichedPrompt(result.data.enrichedPrompt)
        setEnrichmentResult(result.data)
        setHasEnrichment(true)
      } else {
        setEnrichedPrompt(result.fallback?.enrichedPrompt || rawPrompt)
        setEnrichmentResult(result.fallback)
        setHasEnrichment(false)
      }
    } catch (error) {
      console.error('Enhancement failed:', error)
      setEnrichedPrompt(rawPrompt)
      setHasEnrichment(false)
    } finally {
      setIsEnriching(false)
    }
  }
  
  // Handle reset
  const handleReset = () => {
    setFormData({
      role: '',
      task: '',
      context: '',
      requirements: '',
      style: '',
      output: ''
    })
    setSelectedModel(DEFAULT_MODEL)
    setRawPrompt('')
    setEnrichedPrompt('')
    setHasEnrichment(false)
    setEnrichmentResult(null)
    setError(null)
  }

  // Scroll to section
  const scrollToSection = (sectionNumber) => {
    const refs = [contextSectionRef, configureSectionRef, resultSectionRef]
    const targetRef = refs[sectionNumber - 1]
    
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
    }
  }
  
  const steps = [
    {
      id: 1,
      title: 'Define Your Context',
      description: 'Choose your role and describe your task',
      icon: Target,
      completed: stepCompletion[1]
    },
    {
      id: 2,
      title: 'Configure & Enhance',
      description: 'Select AI model and enhance your prompt',
      icon: Wand2,
      completed: stepCompletion[2]
    },
    {
      id: 3,
      title: 'Get Your Prompt',
      description: 'Copy and use your optimized prompt',
      icon: Sparkles,
      completed: stepCompletion[3]
    }
  ]
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Flowing Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Multi-layered gradient base with smooth transitions */}
        <div className={`absolute inset-0 transition-all duration-[3000ms] ease-in-out ${
          activeSection === 1 
            ? 'bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-white' 
            : activeSection === 2
            ? 'bg-gradient-to-br from-purple-50/80 via-pink-50/60 to-white'
            : 'bg-gradient-to-br from-emerald-50/80 via-green-50/60 to-white'
        }`}></div>
        
        {/* Elegant floating elements */}
        <div className="absolute inset-0">
          {/* Soft gradient cloud 1 */}
          <div 
            className={`absolute w-[500px] h-[300px] transition-all duration-[6000ms] ease-out opacity-15 ${
              activeSection === 1 
                ? 'bg-gradient-to-br from-blue-200/20 via-blue-100/10 to-transparent' 
                : activeSection === 2
                ? 'bg-gradient-to-br from-purple-200/20 via-purple-100/10 to-transparent'
                : 'bg-gradient-to-br from-emerald-200/20 via-emerald-100/10 to-transparent'
            }`}
            style={{
              left: `${-100 + Math.sin(activeSection * 0.2) * 80}px`,
              top: `${50 + Math.cos(activeSection * 0.15) * 60}px`,
                              transform: `rotate(${activeSection * 8}deg) scale(${Math.max(0.1, 0.8 + Math.sin(activeSection * 0.3) * 0.2)})`,
              borderRadius: '60% 40% 70% 30%',
              filter: 'blur(60px)'
            }}
          ></div>
          
          {/* Soft gradient cloud 2 */}
          <div 
            className={`absolute w-[400px] h-[400px] transition-all duration-[7000ms] ease-out opacity-12 ${
              activeSection === 1 
                ? 'bg-gradient-to-tl from-indigo-200/18 via-indigo-100/8 to-transparent' 
                : activeSection === 2
                ? 'bg-gradient-to-tl from-pink-200/18 via-pink-100/8 to-transparent'
                : 'bg-gradient-to-tl from-teal-200/18 via-teal-100/8 to-transparent'
            }`}
            style={{
              right: `${-80 + Math.cos(activeSection * 0.25) * 100}px`,
              top: `${200 + Math.sin(activeSection * 0.18) * 80}px`,
              transform: `rotate(${-activeSection * 12}deg) scale(${0.9 + Math.cos(activeSection * 0.4) * 0.2})`,
              borderRadius: '45% 55% 35% 65%',
              filter: 'blur(80px)'
            }}
          ></div>
          
          {/* Flowing ribbon element */}
          <div 
            className={`absolute w-[600px] h-[120px] transition-all duration-[8000ms] ease-out opacity-8 ${
              activeSection === 1 
                ? 'bg-gradient-to-r from-transparent via-blue-200/15 to-transparent' 
                : activeSection === 2
                ? 'bg-gradient-to-r from-transparent via-purple-200/15 to-transparent'
                : 'bg-gradient-to-r from-transparent via-emerald-200/15 to-transparent'
            }`}
            style={{
              left: `${100 + Math.sin(activeSection * 0.3) * 150}px`,
              bottom: `${150 + Math.cos(activeSection * 0.2) * 100}px`,
              transform: `rotate(${activeSection * 5 + Math.sin(activeSection * 0.5) * 15}deg) scaleY(${Math.max(0.1, 0.6 + Math.sin(activeSection * 0.4) * 0.3)})`,
              borderRadius: '100px',
              filter: 'blur(40px)'
            }}
          ></div>
          
          {/* Elegant ellipse */}
          <div 
            className={`absolute w-[350px] h-[200px] transition-all duration-[5500ms] ease-out opacity-10 ${
              activeSection === 1 
                ? 'bg-gradient-to-br from-cyan-200/12 via-blue-100/6 to-transparent' 
                : activeSection === 2
                ? 'bg-gradient-to-br from-violet-200/12 via-purple-100/6 to-transparent'
                : 'bg-gradient-to-br from-green-200/12 via-emerald-100/6 to-transparent'
            }`}
            style={{
              right: `${50 + Math.sin(activeSection * 0.35) * 120}px`,
              bottom: `${80 + Math.cos(activeSection * 0.28) * 60}px`,
                              transform: `rotate(${activeSection * 20}deg) scale(${Math.max(0.1, 0.7 + Math.cos(activeSection * 0.6) * 0.3)})`,
              borderRadius: '50%',
              filter: 'blur(50px)'
            }}
          ></div>
        </div>
        
        {/* Elegant floating dots */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full transition-all duration-[3000ms] ease-out ${
                i % 4 === 0 ? 'w-1 h-1' : i % 4 === 1 ? 'w-1.5 h-1.5' : i % 4 === 2 ? 'w-2 h-2' : 'w-0.5 h-0.5'
              } ${
                activeSection === 1 
                  ? 'bg-blue-300/25' 
                  : activeSection === 2
                  ? 'bg-purple-300/25'
                  : 'bg-emerald-300/25'
              }`}
              style={{
                left: `${15 + (i * 6)}%`,
                top: `${20 + (i * 5.5)}%`,
                transform: `translate(
                  ${Math.sin(i * 0.8 + activeSection * 0.4) * 40}px, 
                  ${Math.cos(i * 0.6 + activeSection * 0.3) * 30}px
                ) scale(${Math.max(0.1, 0.5 + Math.sin(i * 0.5 + activeSection * 0.8) * 0.4)})`,
                opacity: 0.3 + Math.sin(i * 0.7 + activeSection * 0.5) * 0.4,
                filter: `blur(${0.5 + Math.sin(i * 0.3) * 1}px)`,
                animationDelay: `${i * 200}ms`
              }}
            ></div>
          ))}
        </div>

        {/* Groovy abstract figures - only move when scrolling */}
        <div className="absolute inset-0">
          {/* Groovy blob 1 - morphing abstract shape */}
          <div 
            className={`absolute w-32 h-40 transition-all duration-[2000ms] ease-out opacity-8 ${
              activeSection === 1 
                ? 'bg-gradient-to-br from-blue-300/12 to-indigo-200/8' 
                : activeSection === 2
                ? 'bg-gradient-to-br from-purple-300/12 to-pink-200/8'
                : 'bg-gradient-to-br from-emerald-300/12 to-green-200/8'
            }`}
            style={{
              left: `${15 + (isScrolling ? Math.sin(scrollOffset * 0.002) * 25 : 0)}%`,
              top: `${25 + (isScrolling ? Math.cos(scrollOffset * 0.003) * 20 : 0)}%`,
              transform: `rotate(${isScrolling ? scrollOffset * 0.1 + Math.sin(scrollOffset * 0.005) * 30 : 0}deg) 
                         scale(${0.8 + (isScrolling ? Math.cos(scrollOffset * 0.004) * 0.3 : 0)})
                         skew(${isScrolling ? Math.sin(scrollOffset * 0.006) * 15 : 0}deg, ${isScrolling ? Math.cos(scrollOffset * 0.004) * 10 : 0}deg)`,
              borderRadius: `${Math.sin(scrollOffset * 0.008) * 30 + 70}% ${Math.cos(scrollOffset * 0.007) * 25 + 55}% ${Math.sin(scrollOffset * 0.009) * 35 + 45}% ${Math.cos(scrollOffset * 0.006) * 30 + 65}%`,
              filter: `blur(${12 + (isScrolling ? Math.sin(scrollOffset * 0.005) * 8 : 0)}px)`,
              clipPath: `polygon(
                ${Math.sin(scrollOffset * 0.005) * 15 + 35}% ${Math.cos(scrollOffset * 0.004) * 12 + 15}%, 
                ${Math.cos(scrollOffset * 0.006) * 20 + 75}% ${Math.sin(scrollOffset * 0.005) * 15 + 25}%, 
                ${Math.sin(scrollOffset * 0.007) * 25 + 65}% ${Math.cos(scrollOffset * 0.006) * 20 + 80}%, 
                ${Math.cos(scrollOffset * 0.004) * 30 + 30}% ${Math.sin(scrollOffset * 0.007) * 15 + 65}%,
                ${Math.sin(scrollOffset * 0.006) * 12 + 18}% ${Math.cos(scrollOffset * 0.008) * 25 + 45}%
              )`
            }}
          ></div>

          {/* Groovy blob 2 - wavy abstract form */}
          <div 
            className={`absolute w-28 h-36 transition-all duration-[2000ms] ease-out opacity-7 ${
              activeSection === 1 
                ? 'bg-gradient-to-tl from-cyan-200/10 to-blue-300/6' 
                : activeSection === 2
                ? 'bg-gradient-to-tl from-violet-200/10 to-purple-300/6'
                : 'bg-gradient-to-tl from-teal-200/10 to-emerald-300/6'
            }`}
            style={{
              right: `${20 + (isScrolling ? Math.cos(scrollOffset * 0.003) * 30 : 0)}%`,
              top: `${40 + (isScrolling ? Math.sin(scrollOffset * 0.004) * 25 : 0)}%`,
              transform: `rotate(${isScrolling ? -scrollOffset * 0.15 + Math.cos(scrollOffset * 0.006) * 40 : 0}deg) 
                         scale(${0.9 + (isScrolling ? Math.sin(scrollOffset * 0.005) * 0.4 : 0)})
                         perspective(100px) rotateX(${isScrolling ? Math.sin(scrollOffset * 0.004) * 20 : 0}deg)`,
              borderRadius: `${Math.cos(scrollOffset * 0.01) * 35 + 65}% ${Math.sin(scrollOffset * 0.009) * 30 + 50}% ${Math.cos(scrollOffset * 0.007) * 25 + 75}% ${Math.sin(scrollOffset * 0.008) * 40 + 40}%`,
              filter: `blur(${15 + (isScrolling ? Math.sin(scrollOffset * 0.006) * 10 : 0)}px)`,
              clipPath: `ellipse(${Math.sin(scrollOffset * 0.007) * 20 + 55}% ${Math.cos(scrollOffset * 0.008) * 25 + 75}% at ${Math.cos(scrollOffset * 0.004) * 15 + 55}% ${Math.sin(scrollOffset * 0.006) * 20 + 55}%)`
            }}
          ></div>

          {/* Groovy blob 3 - twisted organic shape */}
          <div 
            className={`absolute w-24 h-32 transition-all duration-[2000ms] ease-out opacity-9 ${
              activeSection === 1 
                ? 'bg-gradient-to-r from-indigo-300/12 to-cyan-200/8' 
                : activeSection === 2
                ? 'bg-gradient-to-r from-pink-300/12 to-violet-200/8'
                : 'bg-gradient-to-r from-green-300/12 to-teal-200/8'
            }`}
            style={{
              left: `${60 + (isScrolling ? Math.sin(scrollOffset * 0.004) * 20 : 0)}%`,
              bottom: `${30 + (isScrolling ? Math.cos(scrollOffset * 0.005) * 15 : 0)}%`,
              transform: `rotate(${isScrolling ? scrollOffset * 0.2 + Math.sin(scrollOffset * 0.007) * 25 : 0}deg) 
                         scale(${0.7 + (isScrolling ? Math.cos(scrollOffset * 0.006) * 0.5 : 0)})
                         skew(${isScrolling ? Math.cos(scrollOffset * 0.007) * 20 : 0}deg, ${isScrolling ? Math.sin(scrollOffset * 0.008) * 15 : 0}deg)`,
              borderRadius: `${Math.sin(scrollOffset * 0.012) * 45 + 55}% ${Math.cos(scrollOffset * 0.01) * 30 + 70}% ${Math.sin(scrollOffset * 0.009) * 35 + 45}% ${Math.cos(scrollOffset * 0.011) * 40 + 60}%`,
              filter: `blur(${18 + (isScrolling ? Math.sin(scrollOffset * 0.005) * 12 : 0)}px) hue-rotate(${isScrolling ? scrollOffset * 0.5 : 0}deg)`
            }}
          ></div>

          {/* Groovy blob 4 - flowing ribbon-like shape */}
          <div 
            className={`absolute w-20 h-44 transition-all duration-[2000ms] ease-out opacity-6 ${
              activeSection === 1 
                ? 'bg-gradient-to-bl from-blue-200/9 to-indigo-300/6' 
                : activeSection === 2
                ? 'bg-gradient-to-bl from-purple-200/9 to-pink-300/6'
                : 'bg-gradient-to-bl from-emerald-200/9 to-green-300/6'
            }`}
            style={{
              right: `${10 + (isScrolling ? Math.sin(scrollOffset * 0.005) * 35 : 0)}%`,
              bottom: `${20 + (isScrolling ? Math.cos(scrollOffset * 0.004) * 20 : 0)}%`,
              transform: `rotate(${isScrolling ? -scrollOffset * 0.25 + Math.cos(scrollOffset * 0.006) * 35 : 0}deg) 
                         scale(${0.6 + (isScrolling ? Math.sin(scrollOffset * 0.008) * 0.6 : 0)})
                         skew(${isScrolling ? Math.sin(scrollOffset * 0.009) * 25 : 0}deg, ${isScrolling ? Math.cos(scrollOffset * 0.007) * 12 : 0}deg)`,
              borderRadius: `${Math.cos(scrollOffset * 0.015) * 50 + 50}% ${Math.sin(scrollOffset * 0.012) * 25 + 75}% ${Math.cos(scrollOffset * 0.011) * 30 + 70}% ${Math.sin(scrollOffset * 0.014) * 25 + 55}%`,
              filter: `blur(${20 + (isScrolling ? Math.sin(scrollOffset * 0.006) * 15 : 0)}px)`,
              clipPath: `polygon(
                ${Math.cos(scrollOffset * 0.008) * 12 + 25}% 0%, 
                ${Math.sin(scrollOffset * 0.007) * 15 + 85}% ${Math.cos(scrollOffset * 0.009) * 8 + 20}%, 
                ${Math.cos(scrollOffset * 0.01) * 20 + 80}% ${Math.sin(scrollOffset * 0.009) * 12 + 50}%, 
                ${Math.sin(scrollOffset * 0.006) * 25 + 75}% ${Math.cos(scrollOffset * 0.011) * 15 + 85}%,
                ${Math.cos(scrollOffset * 0.009) * 15 + 35}% 100%,
                ${Math.sin(scrollOffset * 0.012) * 20 + 20}% ${Math.cos(scrollOffset * 0.005) * 12 + 75}%,
                0% ${Math.sin(scrollOffset * 0.008) * 15 + 35}%
              )`
            }}
          ></div>

          {/* Groovy blob 5 - abstract amoeba-like form */}
          <div 
            className={`absolute w-36 h-24 transition-all duration-[2000ms] ease-out opacity-8 ${
              activeSection === 1 
                ? 'bg-gradient-to-tr from-cyan-300/10 to-blue-200/7' 
                : activeSection === 2
                ? 'bg-gradient-to-tr from-violet-300/10 to-purple-200/7'
                : 'bg-gradient-to-tr from-teal-300/10 to-emerald-200/7'
            }`}
            style={{
              left: `${5 + (isScrolling ? Math.cos(scrollOffset * 0.005) * 25 : 0)}%`,
              top: `${60 + (isScrolling ? Math.sin(scrollOffset * 0.003) * 20 : 0)}%`,
              transform: `rotate(${isScrolling ? scrollOffset * 0.13 + Math.cos(scrollOffset * 0.008) * 45 : 0}deg) 
                         scale(${0.9 + (isScrolling ? Math.sin(scrollOffset * 0.005) * 0.3 : 0)})
                         perspective(150px) rotateY(${isScrolling ? Math.cos(scrollOffset * 0.006) * 30 : 0}deg)`,
              borderRadius: `${Math.sin(scrollOffset * 0.017) * 40 + 60}% ${Math.cos(scrollOffset * 0.015) * 35 + 65}% ${Math.sin(scrollOffset * 0.013) * 30 + 70}% ${Math.cos(scrollOffset * 0.016) * 25 + 55}%`,
              filter: `blur(${16 + (isScrolling ? Math.sin(scrollOffset * 0.007) * 12 : 0)}px)`,
              clipPath: `ellipse(${Math.cos(scrollOffset * 0.01) * 25 + 75}% ${Math.sin(scrollOffset * 0.009) * 20 + 60}% at ${Math.sin(scrollOffset * 0.006) * 12 + 40}% ${Math.cos(scrollOffset * 0.008) * 15 + 70}%)`
            }}
          ></div>

          {/* Groovy blob 6 - twisted spiral-like shape */}
          <div 
            className={`absolute w-22 h-38 transition-all duration-[2000ms] ease-out opacity-5 ${
              activeSection === 1 
                ? 'bg-gradient-to-l from-indigo-200/8 to-blue-300/5' 
                : activeSection === 2
                ? 'bg-gradient-to-l from-pink-200/8 to-violet-300/5'
                : 'bg-gradient-to-l from-green-200/8 to-teal-300/5'
            }`}
            style={{
              right: `${40 + (isScrolling ? Math.sin(scrollOffset * 0.006) * 30 : 0)}%`,
              top: `${15 + (isScrolling ? Math.cos(scrollOffset * 0.005) * 25 : 0)}%`,
              transform: `rotate(${isScrolling ? scrollOffset * 0.3 + Math.sin(scrollOffset * 0.009) * 20 : 0}deg) 
                         scale(${0.5 + (isScrolling ? Math.cos(scrollOffset * 0.007) * 0.7 : 0)})
                         skew(${isScrolling ? Math.sin(scrollOffset * 0.01) * 30 : 0}deg, ${isScrolling ? Math.cos(scrollOffset * 0.009) * 18 : 0}deg)`,
              borderRadius: `${Math.cos(scrollOffset * 0.02) * 35 + 65}% ${Math.sin(scrollOffset * 0.017) * 40 + 60}% ${Math.cos(scrollOffset * 0.016) * 25 + 75}% ${Math.sin(scrollOffset * 0.019) * 30 + 50}%`,
              filter: `blur(${22 + (isScrolling ? Math.cos(scrollOffset * 0.006) * 18 : 0)}px) saturate(${isScrolling ? Math.sin(scrollOffset * 0.005) * 0.3 + 1.2 : 1.2})`
            }}
          ></div>
        </div>
        
        {/* Flowing geometric shapes */}
        <div className="absolute inset-0">
          {/* Morphing blob shapes */}
          <div 
            className={`absolute w-32 h-32 transition-all duration-[3000ms] ease-out opacity-20 ${
              activeSection === 1 
                ? 'bg-blue-300/20' 
                : activeSection === 2
                ? 'bg-purple-300/20'
                : 'bg-emerald-300/20'
            }`}
            style={{
              left: `${15 + activeSection * 25}%`,
              top: `${20 + Math.sin(activeSection) * 30}%`,
              transform: `rotate(${activeSection * 90}deg) scale(${0.6 + activeSection * 0.4})`,
              borderRadius: `${30 + Math.sin(activeSection * 2) * 40}% ${70 - Math.cos(activeSection) * 30}% ${50 + Math.sin(activeSection * 1.5) * 30}% ${40 - Math.cos(activeSection * 2) * 20}%`,
              clipPath: `ellipse(${40 + Math.sin(activeSection * 3) * 20}% ${60 + Math.cos(activeSection * 2) * 20}% at 50% 50%)`
            }}
          ></div>
          
          {/* Flowing lines/paths */}
          <div 
            className={`absolute w-24 h-48 transition-all duration-[4000ms] ease-out opacity-15 ${
              activeSection === 1 
                ? 'bg-indigo-200/15' 
                : activeSection === 2
                ? 'bg-pink-200/15'
                : 'bg-teal-200/15'
            }`}
            style={{
              right: `${10 + activeSection * 20}%`,
              bottom: `${30 + Math.cos(activeSection * 1.5) * 25}%`,
              transform: `rotate(${-activeSection * 45}deg) skew(${Math.sin(activeSection) * 15}deg) scale(${0.8 + Math.cos(activeSection * 2) * 0.3})`,
              borderRadius: `${60 + Math.sin(activeSection * 4) * 30}% ${20 + Math.cos(activeSection * 3) * 40}%`,
              clipPath: `polygon(${20 + Math.sin(activeSection) * 20}% 0%, ${80 + Math.cos(activeSection) * 15}% ${30 + Math.sin(activeSection * 2) * 20}%, ${60 - Math.cos(activeSection) * 25}% 100%, ${10 + Math.sin(activeSection * 1.5) * 15}% ${70 - Math.cos(activeSection * 2) * 20}%)`
            }}
          ></div>
          
          {/* Organic flowing shapes */}
          <div 
            className={`absolute w-40 h-28 transition-all duration-[3500ms] ease-out opacity-12 ${
              activeSection === 1 
                ? 'bg-cyan-300/12' 
                : activeSection === 2
                ? 'bg-violet-300/12'
                : 'bg-green-300/12'
            }`}
            style={{
              left: `${60 + Math.sin(activeSection * 0.8) * 30}%`,
              top: `${40 + Math.cos(activeSection * 1.2) * 35}%`,
              transform: `rotate(${activeSection * 60}deg) scale(${0.7 + Math.sin(activeSection * 1.8) * 0.4})`,
              borderRadius: `${Math.sin(activeSection * 5) * 50 + 50}% ${Math.cos(activeSection * 4) * 40 + 60}% ${Math.sin(activeSection * 3) * 45 + 55}% ${Math.cos(activeSection * 6) * 35 + 65}%`
            }}
          ></div>
        </div>
        
        {/* Dynamic sketch-like flowing lines */}
        <div className="absolute inset-0 opacity-15">
          <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
            {/* Flowing sketch lines */}
            {[...Array(8)].map((_, i) => (
              <path
                key={i}
                d={`M${i * 150 + Math.sin(activeSection * (0.3 + i * 0.1)) * 100},${100 + i * 60 + Math.cos(activeSection * (0.5 + i * 0.15)) * 80} 
                    Q${200 + i * 120 + Math.sin(activeSection * (0.7 + i * 0.2)) * 120},${150 + i * 70 + Math.cos(activeSection * (0.4 + i * 0.12)) * 90}
                    ${400 + i * 100 + Math.cos(activeSection * (0.6 + i * 0.18)) * 100},${200 + i * 50 + Math.sin(activeSection * (0.8 + i * 0.25)) * 70}
                    T${800 + i * 80 + Math.sin(activeSection * (0.9 + i * 0.3)) * 80},${250 + i * 40 + Math.cos(activeSection * (1.1 + i * 0.22)) * 60}
                    ${1000 + Math.cos(activeSection * (1.2 + i * 0.28)) * 60},${300 + i * 30 + Math.sin(activeSection * (1.4 + i * 0.35)) * 50}`}
                stroke={
                  activeSection === 1 
                    ? `rgba(59, 130, 246, ${0.1 + Math.sin(i + activeSection) * 0.05})` 
                    : activeSection === 2
                    ? `rgba(147, 51, 234, ${0.1 + Math.sin(i + activeSection) * 0.05})`
                    : `rgba(16, 185, 129, ${0.1 + Math.sin(i + activeSection) * 0.05})`
                }
                strokeWidth={1 + Math.sin(i * 0.5 + activeSection) * 0.5}
                fill="none"
                className="transition-all duration-[3000ms] ease-out"
                style={{
                  strokeDasharray: `${5 + Math.sin(i + activeSection * 2) * 3} ${3 + Math.cos(i + activeSection * 1.5) * 2}`,
                  strokeDashoffset: activeSection * 10 + i * 2,
                }}
              />
            ))}
            
            {/* Organic flowing curves */}
            {[...Array(5)].map((_, i) => (
              <path
                key={`curve-${i}`}
                d={`M${100 + i * 200 + Math.sin(activeSection * (0.4 + i * 0.2)) * 150},${400 + Math.cos(activeSection * (0.6 + i * 0.15)) * 100}
                    C${300 + i * 180 + Math.cos(activeSection * (0.8 + i * 0.25)) * 120},${300 + Math.sin(activeSection * (1.0 + i * 0.3)) * 80}
                    ${500 + i * 160 + Math.sin(activeSection * (1.2 + i * 0.35)) * 100},${500 + Math.cos(activeSection * (0.7 + i * 0.2)) * 90}
                    ${700 + i * 140 + Math.cos(activeSection * (1.4 + i * 0.4)) * 80},${450 + Math.sin(activeSection * (1.6 + i * 0.45)) * 70}`}
                stroke={
                  activeSection === 1 
                    ? `rgba(99, 102, 241, ${0.08 + Math.cos(i + activeSection * 1.5) * 0.04})` 
                    : activeSection === 2
                    ? `rgba(236, 72, 153, ${0.08 + Math.cos(i + activeSection * 1.5) * 0.04})`
                    : `rgba(52, 211, 153, ${0.08 + Math.cos(i + activeSection * 1.5) * 0.04})`
                }
                strokeWidth={0.8 + Math.cos(i * 0.7 + activeSection * 1.2) * 0.4}
                fill="none"
                className="transition-all duration-[4000ms] ease-out"
                style={{
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                }}
              />
            ))}
            
            {/* Scattered organic dots/nodes */}
            {[...Array(15)].map((_, i) => (
              <circle
                key={`dot-${i}`}
                cx={150 + (i * 73) % 1000 + Math.sin(activeSection * (0.5 + i * 0.1)) * 60}
                cy={200 + (i * 47) % 400 + Math.cos(activeSection * (0.7 + i * 0.15)) * 50}
                r={Math.max(0.1, 1 + Math.sin(i + activeSection * 2) * 0.8)}
                fill={
                  activeSection === 1 
                    ? `rgba(37, 99, 235, ${0.2 + Math.sin(i * 2 + activeSection) * 0.1})` 
                    : activeSection === 2
                    ? `rgba(168, 85, 247, ${0.2 + Math.sin(i * 2 + activeSection) * 0.1})`
                    : `rgba(5, 150, 105, ${0.2 + Math.sin(i * 2 + activeSection) * 0.1})`
                }
                className="transition-all duration-[2500ms] ease-out"
              />
            ))}
            
            {/* Connecting lines between elements */}
            {[...Array(6)].map((_, i) => (
              <line
                key={`connector-${i}`}
                x1={200 + i * 150 + Math.sin(activeSection * (0.3 + i * 0.2)) * 80}
                y1={300 + Math.cos(activeSection * (0.5 + i * 0.18)) * 60}
                x2={350 + i * 130 + Math.cos(activeSection * (0.7 + i * 0.25)) * 70}
                y2={250 + Math.sin(activeSection * (0.9 + i * 0.22)) * 50}
                stroke={
                  activeSection === 1 
                    ? `rgba(59, 130, 246, ${0.06 + Math.sin(i + activeSection * 0.8) * 0.03})` 
                    : activeSection === 2
                    ? `rgba(147, 51, 234, ${0.06 + Math.sin(i + activeSection * 0.8) * 0.03})`
                    : `rgba(16, 185, 129, ${0.06 + Math.sin(i + activeSection * 0.8) * 0.03})`
                }
                strokeWidth={0.5}
                className="transition-all duration-[3500ms] ease-out"
                style={{
                  strokeDasharray: '2 4',
                  strokeDashoffset: activeSection * 5 + i,
                }}
              />
            ))}
          </svg>
        </div>
        
        {/* Dynamic mesh gradient overlay */}
        <div 
          className="absolute inset-0 transition-all duration-[3000ms] ease-out opacity-30"
          style={{
            background: `
              radial-gradient(circle at ${30 + Math.sin(activeSection) * 40}% ${40 + Math.cos(activeSection * 0.8) * 30}%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at ${70 + Math.cos(activeSection * 1.2) * 25}% ${60 + Math.sin(activeSection * 0.6) * 35}%, rgba(255,255,255,0.08) 0%, transparent 60%),
              radial-gradient(circle at ${50 + Math.sin(activeSection * 1.5) * 30}% ${30 + Math.cos(activeSection) * 40}%, rgba(255,255,255,0.06) 0%, transparent 70%)
            `
          }}
        ></div>
        
        {/* Subtle animated noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.02] transition-transform duration-[2000ms] ease-out"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")`,
            transform: `translate(${Math.sin(activeSection * 0.3) * 10}px, ${Math.cos(activeSection * 0.4) * 8}px) scale(${1 + Math.sin(activeSection * 0.2) * 0.1})`
          }}
        ></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Professional AI Prompt Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your ideas into optimized prompts that get better results from any AI model
          </p>
        </div>

        {/* Rotating Examples */}
        <RotatingPromptExamples />

        {/* Floating Progress Indicator */}
        {showProgressBar && (
          <div className="fixed top-24 right-8 z-40 transition-all duration-500 ease-in-out">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/60 p-4 transition-all duration-300 hover:bg-white/95 hover:shadow-2xl">
              <div className="flex items-center space-x-3">
                {steps.map((step, index) => (
                  <div key={step.id} className="relative group">
                    <button
                      onClick={() => scrollToSection(step.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        activeSection === step.id
                          ? 'bg-blue-600 text-white shadow-md scale-110'
                          : step.completed
                          ? 'bg-green-500 text-white hover:scale-105'
                          : 'bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-white'
                      }`}
                    >
                      {step.completed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Connection Line */}
                    {index < steps.length - 1 && (
                      <div className={`absolute top-1/2 left-full w-6 h-0.5 -translate-y-1/2 transition-colors duration-300 ${
                        step.completed ? 'bg-green-400' : 'bg-gray-300'
                      }`} />
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        {step.title}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))}
                
                {/* Reset Button */}
                <div className="ml-2 pl-2 border-l border-gray-200">
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 transition-all duration-200 flex items-center justify-center group"
                    title="Start Over"
                  >
                    <RefreshCw className="w-4 h-4" />
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                        Start Over
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Full Width */}
        <div className="space-y-16">
          
          {/* Section 1: Define Context */}
          <section ref={contextSectionRef} className="scroll-mt-32">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-4">
                <Target className="w-4 h-4 mr-2" />
                Step 1
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Define Your Context</h2>
              <p className="text-gray-600">Choose your role and describe your task</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Role Selection */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <ImprovedRoleSelector
                  selectedRole={formData.role}
                  onRoleChange={(role) => handleFormChange('role', role)}
                  showDescription={true}
                />
              </div>
              
              {/* Task Description */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Describe Your Task</h3>
                    <p className="text-sm text-gray-500">What do you want to accomplish?</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Task Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.task}
                      onChange={(e) => handleFormChange('task', e.target.value)}
                      placeholder="Describe what you want to accomplish..."
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.task.length}/500 characters
                    </p>
                  </div>
                  
                  {/* Advanced Options Toggle */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <Settings className="w-4 h-4" />
                      <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                    </button>
                  </div>
                  
                  {/* Advanced Fields */}
                  {showAdvanced && (
                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Context
                        </label>
                        <textarea
                          value={formData.context}
                          onChange={(e) => handleFormChange('context', e.target.value)}
                          placeholder="Additional context or background information..."
                          className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Requirements
                        </label>
                        <textarea
                          value={formData.requirements}
                          onChange={(e) => handleFormChange('requirements', e.target.value)}
                          placeholder="Specific requirements or constraints..."
                          className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Style
                          </label>
                          <input
                            type="text"
                            value={formData.style}
                            onChange={(e) => handleFormChange('style', e.target.value)}
                            placeholder="e.g., formal, casual, technical"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Output Format
                          </label>
                          <input
                            type="text"
                            value={formData.output}
                            onChange={(e) => handleFormChange('output', e.target.value)}
                            placeholder="e.g., bullet points, essay, code"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Configure & Enhance */}
          <section ref={configureSectionRef} className="scroll-mt-32">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium text-purple-800 mb-4">
                <Wand2 className="w-4 h-4 mr-2" />
                Step 2
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Configure & Enhance</h2>
              <p className="text-gray-600">Select AI model and enhance your prompt</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Model Selection */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI Model Selection</h3>
                    <p className="text-sm text-gray-500">Choose the optimal AI model</p>
                  </div>
                </div>
                
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={handleModelChange}
                  compact={false}
                />
              </div>
              
              {/* Enhancement Preview */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Prompt Preview</h3>
                    <p className="text-sm text-gray-500">See your generated prompt</p>
                  </div>
                </div>
                
                {validation.isValid ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 max-h-40 overflow-y-auto">
                        {rawPrompt}
                      </pre>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{rawPrompt.length} characters</span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                        Ready for enhancement
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Complete Step 1 to see your prompt preview</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section 3: Get Your Prompt */}
          <section ref={resultSectionRef} className="scroll-mt-32">
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 rounded-full text-sm font-medium text-green-800 mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                Step 3
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Your Prompt</h2>
              <p className="text-gray-600">Copy and use your optimized prompt</p>
            </div>

            <div className="max-w-4xl mx-auto">
              {validation.isValid ? (
                <EnhancedPromptPreview
                  rawPrompt={rawPrompt}
                  enrichedPrompt={enrichedPrompt}
                  enrichmentResult={enrichmentResult}
                  selectedModel={selectedModel}
                  validation={validation}
                  isEnriching={isEnriching}
                  hasEnrichment={hasEnrichment}
                  onEnrichNow={handleEnrichment}
                  isAuthenticated={isAuthenticated}
                  isPro={isPro}
                  formData={formData}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Complete Previous Steps
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Fill in your role and task description to generate your optimized prompt
                  </p>
                  <button
                    onClick={() => scrollToSection(1)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Go to Step 1
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

export default SimplifiedPromptGenerator 