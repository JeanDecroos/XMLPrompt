import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Crown, Sparkles, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react'

const promptExamples = [
  {
    category: "Marketing Email",
    basic: "Write a marketing email",
    structured: "Write a marketing email for our new product launch targeting existing customers with a compelling subject line and clear call-to-action",
    enriched: "Write a compelling marketing email for our new product launch that re-engages existing customers by highlighting exclusive early access benefits, addressing their previous purchase history, including personalized discount codes with urgency-driven language, and featuring customer testimonials to build trust and drive immediate action"
  },
  {
    category: "Social Media",
    basic: "Create an Instagram post",
    structured: "Create an Instagram post celebrating our 10K customer milestone with engaging visuals, relevant hashtags, and a call-to-action to drive engagement",
    enriched: "Create a high-engagement Instagram carousel post celebrating our 10,000 customer milestone that includes behind-the-scenes team celebration photos, trending industry hashtags (#TechStartup #CustomerLove), user-generated content reshares, customer testimonial graphics, and a clear call-to-action driving traffic to our thank-you landing page with exclusive community perks"
  },
  {
    category: "Product Description",
    basic: "Describe this product",
    structured: "Write a product description for our project management software that highlights key features, benefits, and target audience pain points",
    enriched: "Write a conversion-optimized product description for our project management software that addresses busy team leads' specific pain points (missed deadlines, poor communication), highlights unique collaborative features with specific time-saving metrics, includes social proof from similar companies, incorporates SEO keywords naturally, and features risk-free trial offers with compelling urgency elements"
  },
  {
    category: "Technical Documentation",
    basic: "Write API docs",
    structured: "Create comprehensive API documentation for our REST endpoints with clear examples, error handling, and authentication requirements",
    enriched: "Create developer-friendly API documentation for our REST endpoints that includes interactive code examples, comprehensive error codes with troubleshooting steps, rate limiting guidelines, authentication flows with code samples in multiple languages, and a getting-started tutorial that gets developers to their first successful API call in under 5 minutes"
  },
  {
    category: "Customer Support",
    basic: "Handle customer complaint",
    structured: "Draft a professional response to a customer complaint about delayed shipping that includes empathy, solutions, and appropriate compensation",
    enriched: "Draft an empathetic, solution-focused response to a customer complaint about delayed shipping that acknowledges their frustration, provides specific tracking updates, offers meaningful compensation (expedited shipping + discount), includes proactive steps we're taking to prevent future delays, and ends with a personal touch that rebuilds trust and demonstrates our commitment to their success"
  }
]

const RotatingPromptExamples = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef(null)

  const currentExample = promptExamples[currentIndex]

  // Auto-advance through examples with fade transition
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex(prev => (prev + 1) % promptExamples.length)
          setIsTransitioning(false)
        }, 150) // 150ms fade out duration
      }, 7000) // 7 seconds per example
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isAutoPlaying])

  const handlePrevious = useCallback(() => {
    setIsAutoPlaying(false)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(prev => prev === 0 ? promptExamples.length - 1 : prev - 1)
      setIsTransitioning(false)
    }, 150)
    
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const handleNext = useCallback(() => {
    setIsAutoPlaying(false)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % promptExamples.length)
      setIsTransitioning(false)
    }, 150)
    
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const handleDotClick = useCallback((index) => {
    setIsAutoPlaying(false)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 150)
    
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const promptVersions = [
    {
      title: "Basic Input",
      subtitle: "What you start with",
      text: currentExample.basic,
      icon: Target,
      bgColor: "from-gray-50 to-gray-100",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      badgeColor: "bg-gray-500",
      step: 1
    },
    {
      title: "Structured Prompt",
      subtitle: "After initial processing",
      text: currentExample.structured,
      icon: Zap,
      bgColor: "from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      badgeColor: "bg-blue-500",
      step: 2
    },
    {
      title: "AI-Enhanced Result",
      subtitle: "Professional optimization",
      text: currentExample.enriched,
      icon: Sparkles,
      bgColor: "from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      textColor: "text-purple-800",
      badgeColor: "bg-purple-500",
      step: 3
    }
  ]

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200/50 shadow-lg mb-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-4">
          <Sparkles className="w-4 h-4 mr-2" />
          See the Transformation
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          From Simple Ideas to Professional Prompts
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Watch how our AI transforms basic requests into detailed, effective prompts that get better results
        </p>
      </div>

      {/* Example Category and Navigation */}
      <div className={`flex items-center justify-between mb-8 max-w-6xl mx-auto transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-500">Example:</span>
          <span className="text-xl font-bold text-gray-900">{currentExample.category}</span>
        </div>
        
        {/* Subtle Navigation */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full bg-white/60 hover:bg-white border border-gray-200/60 transition-all duration-200 hover:shadow-md"
            aria-label="Previous example"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          {/* Progress Dots */}
          <div className="flex space-x-2">
            {promptExamples.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-600 w-6' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to example ${index + 1}`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-white/60 hover:bg-white border border-gray-200/60 transition-all duration-200 hover:shadow-md"
            aria-label="Next example"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Linear Flow - Horizontal Layout */}
      <div className="max-w-7xl mx-auto">
        {/* Process Flow Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4 bg-white/60 rounded-full px-6 py-3 border border-gray-200/60">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Basic</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-600">Structured</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-600">Enhanced</span>
            </div>
          </div>
        </div>

        {/* Horizontal Card Layout */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-300 via-blue-300 to-purple-300 transform -translate-y-1/2 z-0"></div>
          
          <div className={`relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
            {promptVersions.map((version, index) => (
              <div key={version.title} className="relative">
                {/* Card */}
                <div className={`bg-gradient-to-br ${version.bgColor} rounded-xl border ${version.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col`} style={{ height: '480px' }}>
                  {/* Step Indicator */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className={`w-8 h-8 rounded-full ${version.badgeColor} flex items-center justify-center shadow-lg border-2 border-white`}>
                      <span className="text-white text-sm font-bold">{version.step}</span>
                    </div>
                  </div>

                  {/* Enhancement Badge for final version - overlapping the card edge */}
                  {index === 2 && (
                    <div className="absolute -top-2 -right-2 z-30">
                      <div className="inline-flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg">
                        <Crown className="w-4 h-4 text-white" />
                        <span className="text-sm text-white font-medium">Pro Enhanced</span>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className="p-6 pb-4 pt-8 flex-shrink-0">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${version.badgeColor} flex items-center justify-center shadow-sm`}>
                        <version.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${version.textColor}`}>{version.title}</h3>
                        <p className="text-sm text-gray-500">{version.subtitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-6 flex-1 flex flex-col">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 flex-1 flex items-start shadow-sm overflow-hidden">
                      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2 w-full">
                        {index === 0 ? (
                          // Basic prompt - centered and larger
                          <div className="flex items-center justify-center h-full">
                            <p className={`text-lg font-semibold ${version.textColor} text-center`}>
                              "{version.text}"
                            </p>
                          </div>
                        ) : (
                          // Structured and Enhanced prompts - simple text
                          <p className={`text-sm leading-relaxed ${version.textColor} font-medium`}>
                            "{version.text}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow indicator (desktop only) */}
                {index < promptVersions.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-20">
                    <div className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="mt-12 bg-white/50 rounded-xl p-8 max-w-5xl mx-auto">
        <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
          Why This Transformation Matters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Clear Structure</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Organized format that AI models understand better, leading to more accurate responses
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Context Aware</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Includes relevant details, constraints, and specifications for targeted results
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-promptr-900 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <img src="/logos/PromptrLogo.png" alt="Promptr Logo" className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-gray-900 mb-2">Optimized Results</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Professional quality output that saves time and delivers better outcomes
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-8">
        <p className="text-gray-600 mb-4 text-lg">
          Ready to transform your prompts? Start building below ↓
        </p>
      </div>
    </div>
  )
}

export default RotatingPromptExamples 