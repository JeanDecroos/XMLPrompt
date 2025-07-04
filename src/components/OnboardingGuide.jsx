import React, { useState, useEffect } from 'react'
import { ChevronRight, X, Lightbulb, Target, Sparkles, CheckCircle } from 'lucide-react'

const OnboardingGuide = ({ onComplete, isVisible = true }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed')
    if (completed) {
      setHasCompletedOnboarding(true)
    }
  }, [])

  const steps = [
    {
      title: "Welcome to PromptCraft AI",
      content: "Let's get you creating professional AI prompts in 3 simple steps",
      icon: <Sparkles className="w-5 h-5" />,
      position: "center",
      highlight: null
    },
    {
      title: "Step 1: Choose Your Role",
      content: "Select your professional role to get contextually relevant prompts",
      icon: <Target className="w-5 h-5" />,
      position: "left",
      highlight: "role-section"
    },
    {
      title: "Step 2: Describe Your Task",
      content: "Tell us what you want the AI to do - be as specific as possible",
      icon: <Lightbulb className="w-5 h-5" />,
      position: "left",
      highlight: "task-section"
    },
    {
      title: "Step 3: Get Enhanced Results",
      content: "Watch as we optimize your prompt for better AI responses",
      icon: <CheckCircle className="w-5 h-5" />,
      position: "right",
      highlight: "preview-section"
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setHasCompletedOnboarding(true)
    onComplete?.()
  }

  const handleSkip = () => {
    completeOnboarding()
  }

  if (!isVisible || hasCompletedOnboarding) return null

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <Lightbulb className="w-4 h-4" />
          <span className="text-sm font-medium">Need help?</span>
        </button>
      </div>
    )
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                {currentStepData.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentStepData.title}
              </h3>
            </div>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">{currentStepData.content}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="btn btn-primary btn-sm flex items-center"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingGuide 