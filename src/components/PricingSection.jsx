import React from 'react'
import { Check, Crown, Zap, ArrowRight, Sparkles } from 'lucide-react'

const PricingSection = () => {
  const features = {
    free: [
      'Universal prompt generation',
      'Multi-model format support',
      'Basic templates and examples',
      'Copy & export functionality'
    ],
    premium: [
      'AI-powered prompt enhancement',
      'Deeper AI enhancement options',
      'Priority model recommendations',
      'Prompt history & saving',
      'Enhanced usage limits',
      'Access to more model options (availability may vary)'
    ]
  }

  return (
    <section id="pricing" className="py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your AI Advantage
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals getting better results with AI
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-12" style={{overflow: 'visible'}}>
          {/* Free Plan */}
          <div className="card-secondary p-8 relative h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Free Plan</h3>
                <p className="text-gray-600 mt-1">Perfect for getting started</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">€0</div>
                <div className="text-sm text-gray-500">forever</div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {features.free.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Spacer to match Premium Plan height */}
            <div className="flex-grow"></div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Current Plan Active</span>
              </div>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="card-premium p-8 pt-12 relative h-full flex flex-col overflow-visible" style={{contain: 'none'}}>
            {/* Popular Badge - floating on top of card */}
            <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1 shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span>Premium plan — coming soon</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-2xl font-bold text-gray-900">Premium Plan</h3>
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-600 mt-1">Professional AI optimization</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline space-x-2">
                  <span className="text-lg text-gray-500 line-through">€10</span>
                  <div className="text-3xl font-bold text-gray-900">€3</div>
                </div>
                <div className="text-sm text-gray-500">/ month (coming soon)</div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {features.premium.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Value Highlight */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800">Instant Value</span>
              </div>
              <p className="text-sm text-purple-700">
                Save 2+ hours per week on prompt creation.<br />
                Most users see ROI within the first week.
              </p>
            </div>

            <button className="btn btn-premium btn-lg w-full group mb-4" onClick={() => window.location.href = '/pricing'}>
              <Crown className="w-5 h-5 mr-2" />
              <span>Join Waitlist</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600">We’ll notify you when Premium is available.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection 