import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const promptExamples = [
  {
    category: "Marketing Email",
    before: "Write a marketing email",
    after: "Write a compelling marketing email that converts browsers into buyers by highlighting product benefits, using urgency, and including a strong CTA"
  },
  {
    category: "Social Media",
    before: "Create an Instagram post",
    after: "Create an engaging Instagram post that drives traffic to our website with trending hashtags, compelling visuals, and a clear call-to-action"
  },
  {
    category: "Product Description",
    before: "Describe this product",
    after: "Write a persuasive product description that highlights unique benefits, addresses customer pain points, and includes SEO keywords to boost conversions"
  },
  {
    category: "Blog Post",
    before: "Write a blog intro",
    after: "Write an attention-grabbing blog introduction that hooks readers in the first sentence, previews key insights, and encourages them to read more"
  },
  {
    category: "Ad Copy",
    before: "Create an ad for our service",
    after: "Create high-converting Facebook ad copy that targets busy professionals, emphasizes time-saving benefits, and includes social proof with urgency"
  },
  {
    category: "Landing Page",
    before: "Write a headline",
    after: "Write a compelling landing page headline that immediately communicates our unique value proposition and motivates visitors to take action"
  },
  {
    category: "Customer Outreach",
    before: "Write a sales email",
    after: "Write a personalized sales email that references the prospect's recent company news, offers specific value, and requests a 15-minute conversation"
  },
  {
    category: "Press Release",
    before: "Write a press release",
    after: "Write a newsworthy press release with a compelling headline, key statistics, expert quotes, and clear contact information for media inquiries"
  },
  {
    category: "Newsletter",
    before: "Create a newsletter",
    after: "Create an engaging weekly newsletter that provides valuable industry insights, highlights customer success stories, and drives traffic to our blog"
  },
  {
    category: "Video Script",
    before: "Write a video script",
    after: "Write a 60-second video script that captures attention in 3 seconds, tells a compelling story, and ends with a clear call-to-action"
  },
  {
    category: "LinkedIn Post",
    before: "Post about our company update",
    after: "Create a professional LinkedIn post that shares our company milestone, demonstrates industry expertise, and encourages meaningful engagement from our network"
  },
  {
    category: "Website Copy",
    before: "Write about us page content",
    after: "Write compelling 'About Us' page copy that builds trust through our story, showcases team expertise, and connects our mission to customer benefits"
  },
  {
    category: "Customer Support",
    before: "Reply to a complaint",
    after: "Write an empathetic customer service response that acknowledges the issue, provides a clear solution, and rebuilds trust with a follow-up offer"
  },
  {
    category: "Event Promotion",
    before: "Promote our webinar",
    after: "Create persuasive webinar promotion copy that highlights exclusive insights, features expert speakers, and drives registrations with early-bird incentives"
  }
]

const RotatingPromptExamples = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating) return

    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % promptExamples.length)
        setIsTransitioning(false)
      }, 150) // Brief transition delay
    }, 4000) // Change every 4 seconds

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
    <div className="max-w-4xl mx-auto mb-12">
      <div className="relative">
        {/* Category indicator */}
        <div className="text-center mb-4">
          <span className={`inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full transition-opacity duration-300 ${
            isTransitioning ? 'opacity-50' : 'opacity-100'
          }`}>
            {currentExample.category} Example
          </span>
        </div>

        {/* Main comparison */}
        <div className={`grid md:grid-cols-2 gap-4 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg transition-all duration-300 ${
          isTransitioning ? 'opacity-80 scale-[0.98]' : 'opacity-100 scale-100'
        }`}>
          <div className="text-left">
            <div className="text-sm text-gray-500 mb-2 flex items-center">
              <div className="w-3 h-3 bg-red-400 rounded-full mr-2"></div>
              Before: Basic prompt
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-sm font-mono text-gray-600 min-h-[80px] flex items-center transition-all duration-300">
              "{currentExample.before}"
            </div>
          </div>
          <div className="text-left">
            <div className="text-sm text-purple-600 mb-2 flex items-center font-medium">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
              After: AI-optimized
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg text-sm font-mono text-gray-700 border border-purple-200/50 min-h-[80px] flex items-center transition-all duration-300">
              "{currentExample.after}"
            </div>
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center justify-center mt-6 space-x-4">
          <button
            onClick={goToPrevious}
            className="p-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105"
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
            className="p-2 rounded-full bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:scale-105"
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