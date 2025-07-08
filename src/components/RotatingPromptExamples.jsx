import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Crown, Sparkles } from 'lucide-react'

const promptExamples = [
  {
    category: "Marketing Email",
    basic: "Write a marketing email",
    structured: "Write a marketing email for our new product launch targeting existing customers",
    enriched: "Write a compelling marketing email for our new product launch that re-engages existing customers by highlighting exclusive early access benefits, addressing their previous purchase history, and including a personalized discount code with urgency-driven language"
  },
  {
    category: "Social Media",
    basic: "Create an Instagram post",
    structured: "Create an Instagram post about our company milestone with engaging visuals and relevant hashtags",
    enriched: "Create a high-engagement Instagram post celebrating our 10K customer milestone that includes behind-the-scenes team photos, trending industry hashtags (#TechStartup #CustomerLove), user-generated content reshares, and a clear call-to-action driving traffic to our thank-you landing page"
  },
  {
    category: "Product Description",
    basic: "Describe this product",
    structured: "Write a product description that highlights key features, benefits, and target audience for our software tool",
    enriched: "Write a conversion-optimized product description for our project management software that addresses busy team leads' pain points (missed deadlines, poor communication), highlights unique collaborative features with specific time-saving metrics, includes social proof from similar companies, and incorporates SEO keywords while maintaining natural readability"
  },
  {
    category: "Blog Post",
    basic: "Write a blog intro",
    structured: "Write an engaging blog post introduction about industry trends that hooks readers and previews key insights",
    enriched: "Write a captivating blog post introduction about emerging AI trends in marketing that opens with a surprising statistic, relates to current reader challenges (staying competitive), teases 3 actionable insights they'll learn, includes a relevant industry example, and uses storytelling elements to create emotional connection while optimizing for 8-second attention spans"
  },
  {
    category: "Customer Outreach",
    basic: "Write a sales email",
    structured: "Write a personalized sales email that introduces our service and requests a meeting with a potential client",
    enriched: "Write a highly personalized sales email to [Company Name]'s [Title] that references their recent [specific company news/achievement], demonstrates understanding of their industry challenges through relevant case studies, offers specific value propositions tied to their business goals, includes social proof from similar companies, and requests a 15-minute conversation with 3 specific meeting time options"
  },
  {
    category: "Ad Copy",
    basic: "Create an ad for our service",
    structured: "Create Facebook ad copy that targets small business owners and highlights our key benefits with a clear call-to-action",
    enriched: "Create high-converting Facebook ad copy targeting overwhelmed small business owners aged 35-50 who struggle with time management, featuring benefit-driven headlines that emphasize specific time savings (2+ hours daily), include customer testimonials with quantified results, address common objections (price, complexity), and drive clicks with urgency-based CTAs offering limited-time trials"
  },
  {
    category: "Landing Page",
    basic: "Write a headline",
    structured: "Write a compelling landing page headline that communicates our value proposition and motivates visitor action",
    enriched: "Write a conversion-optimized landing page headline that immediately addresses the visitor's primary pain point, communicates our unique value proposition in under 10 words, includes power words that trigger emotional response, incorporates social proof elements, and is A/B tested against 3 variations for maximum click-through rates while maintaining brand voice consistency"
  },
  {
    category: "Video Script",
    basic: "Write a video script",
    structured: "Write a 60-second promotional video script with clear messaging and a strong call-to-action",
    enriched: "Write a 60-second promotional video script optimized for social media that hooks viewers in the first 3 seconds with a pattern interrupt, tells a compelling customer transformation story using the problem-agitation-solution framework, includes visual cues for engagement (text overlays, scene changes), addresses mobile viewing optimization, and ends with a multi-step call-to-action sequence"
  }
]

const RotatingPromptExamples = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [containerHeight, setContainerHeight] = useState(null)
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const measurementTimeoutRef = useRef(null)

  // Debounced height calculation function
  const calculateOptimalHeight = useCallback(() => {
    if (!contentRef.current) return

    // Clear any pending measurements
    if (measurementTimeoutRef.current) {
      clearTimeout(measurementTimeoutRef.current)
    }

    measurementTimeoutRef.current = setTimeout(() => {
      // Create a temporary container to measure heights of all examples
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.visibility = 'hidden'
      tempContainer.style.top = '-9999px'
      tempContainer.style.left = '-9999px'
      tempContainer.style.width = contentRef.current.offsetWidth + 'px'
      tempContainer.style.fontFamily = window.getComputedStyle(contentRef.current).fontFamily
      document.body.appendChild(tempContainer)

      let maxHeight = 0

      // Measure each example
      promptExamples.forEach((example) => {
        tempContainer.innerHTML = `
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4" style="width: ${contentRef.current.offsetWidth}px;">
            <div class="bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-4">
              <div class="text-sm text-gray-500 mb-3 flex items-center">
                <div class="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span class="font-medium">Basic</span>
              </div>
              <div class="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-600 min-h-[120px] flex items-start leading-relaxed">
                <span class="block w-full">"${example.basic}"</span>
              </div>
              <div class="mt-3 text-xs text-gray-500">
                Raw input - what most people start with
              </div>
            </div>
            <div class="bg-white/60 backdrop-blur-sm rounded-xl border border-blue-200/50 shadow-sm p-4 relative">
              <div class="text-sm text-blue-600 mb-3 flex items-center">
                <div class="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                <span class="font-medium">Structured</span>
                <span class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">FREE</span>
              </div>
              <div class="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg text-sm font-mono text-gray-700 border border-blue-200/50 min-h-[120px] flex items-start leading-relaxed">
                <span class="block w-full">"${example.structured}"</span>
              </div>
              <div class="mt-3 text-xs text-blue-600">
                ✨ Better structure and clarity - available to all users
              </div>
            </div>
            <div class="bg-white/60 backdrop-blur-sm rounded-xl border border-purple-200/50 shadow-lg p-4 relative">
              <div class="text-sm text-purple-600 mb-3 flex items-center">
                <div class="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                <span class="font-medium">AI-Enriched</span>
                <span class="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full flex items-center">
                  PRO
                </span>
              </div>
              <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg text-sm font-mono text-gray-700 border border-purple-200/50 min-h-[120px] flex items-start leading-relaxed">
                <span class="block w-full">"${example.enriched}"</span>
              </div>
              <div class="mt-3 text-xs text-purple-600 flex items-center">
                Full AI optimization with context and strategy
              </div>
            </div>
          </div>
        `
        
        const height = tempContainer.offsetHeight
        if (height > maxHeight) {
          maxHeight = height
        }
      })

      document.body.removeChild(tempContainer)
      
      // Add some padding for safety and smooth transitions
      setContainerHeight(maxHeight + 32)
    }, 150) // Debounce delay
  }, [])

  // Calculate and set the maximum height needed for all examples
  useEffect(() => {
    calculateOptimalHeight()
  }, [calculateOptimalHeight])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      calculateOptimalHeight()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      if (measurementTimeoutRef.current) {
        clearTimeout(measurementTimeoutRef.current)
      }
    }
  }, [calculateOptimalHeight])

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promptExamples.length)
        setIsTransitioning(false)
      }, 150) // Brief transition delay
    }, 6000) // Change every 6 seconds (longer for 3 sections)

    return () => clearInterval(interval)
  }, [isAutoRotating])

  const goToPrevious = () => {
    setIsAutoRotating(false)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + promptExamples.length) % promptExamples.length)
      setIsTransitioning(false)
    }, 150)
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsAutoRotating(true), 10000)
  }

  const goToNext = () => {
    setIsAutoRotating(false)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % promptExamples.length)
      setIsTransitioning(false)
    }, 150)
    // Resume auto-rotation after 10 seconds
    setTimeout(() => setIsAutoRotating(true), 10000)
  }

  const goToIndex = (index) => {
    setIsAutoRotating(false)
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 150)
    setTimeout(() => setIsAutoRotating(true), 10000)
  }

  const currentExample = promptExamples[currentIndex]

  return (
    <div className="max-w-5xl mx-auto mb-12">
      <div className="relative">
        {/* Category indicator */}
        <div className="text-center mb-6">
          <span className={`inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full transition-opacity duration-300 ${
            isTransitioning ? 'opacity-50' : 'opacity-100'
          }`}>
            {currentExample.category} Example
          </span>
          <p className="text-sm text-gray-600 mt-2">See how prompts evolve from basic to AI-enhanced</p>
        </div>

        {/* 3-Tier Comparison with Fixed Height Container */}
        <div 
          ref={containerRef}
          className="relative overflow-hidden transition-all duration-300 ease-in-out"
          style={{ 
            height: containerHeight ? `${containerHeight}px` : 'auto',
            minHeight: containerHeight ? `${containerHeight}px` : '400px'
          }}
        >
          <div 
            ref={contentRef}
            className={`grid grid-cols-1 lg:grid-cols-3 gap-4 transition-all duration-300 ${
              isTransitioning ? 'opacity-80 scale-[0.98]' : 'opacity-100 scale-100'
            }`}
          >
            
            {/* Basic Prompt */}
            <div className="card-secondary p-4 h-fit">
              <div className="text-sm text-gray-500 mb-3 flex items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                <span className="font-medium">Basic</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-600 min-h-[120px] flex items-start leading-relaxed">
                <span className="block w-full">"{currentExample.basic}"</span>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Raw input - what most people start with
              </div>
            </div>

            {/* Structured Prompt (Free) */}
            <div className="card-accent p-4 relative h-fit">
              <div className="text-sm text-blue-600 mb-3 flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                <span className="font-medium">Structured</span>
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">FREE</span>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg text-sm font-mono text-gray-700 border border-blue-200/50 min-h-[120px] flex items-start leading-relaxed">
                <span className="block w-full">"{currentExample.structured}"</span>
              </div>
              <div className="mt-3 text-xs text-blue-600">
                ✨ Better structure and clarity - available to all users
              </div>
            </div>

            {/* AI-Enriched Prompt (Pro) */}
            <div className="card-premium p-4 relative h-fit">
              <div className="text-sm text-purple-600 mb-3 flex items-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                <span className="font-medium">AI-Enriched</span>
                <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full flex items-center">
                  <Crown className="w-3 h-3 mr-1" />
                  PRO
                </span>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg text-sm font-mono text-gray-700 border border-purple-200/50 min-h-[120px] flex items-start leading-relaxed">
                <span className="block w-full">"{currentExample.enriched}"</span>
              </div>
              <div className="mt-3 text-xs text-purple-600 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Full AI optimization with context and strategy
              </div>
            </div>
          </div>
        </div>

        {/* Value Progression Indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-4 text-sm text-gray-600">
            <span>Basic</span>
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-blue-300 hidden lg:block"></div>
              <div className="w-0.5 h-8 bg-blue-300 lg:hidden"></div>
              <ChevronRight className="w-4 h-4 text-blue-400 mx-1 hidden lg:block" />
              <div className="w-4 h-4 text-blue-400 mx-1 lg:hidden rotate-90">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <span className="text-blue-600">Structured</span>
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-purple-300 hidden lg:block"></div>
              <div className="w-0.5 h-8 bg-purple-300 lg:hidden"></div>
              <ChevronRight className="w-4 h-4 text-purple-400 mx-1 hidden lg:block" />
              <div className="w-4 h-4 text-purple-400 mx-1 lg:hidden rotate-90">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <span className="text-purple-600">AI-Enhanced</span>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full card-secondary transition-all duration-200 hover:scale-105"
            aria-label="Previous example"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          {/* Dot indicators */}
          <div className="flex space-x-2">
            {promptExamples.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 hover:scale-125 ${
                  index === currentIndex 
                    ? 'bg-purple-600 scale-110' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to example ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            className="p-2 rounded-full card-secondary transition-all duration-200 hover:scale-105"
            aria-label="Next example"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default RotatingPromptExamples 