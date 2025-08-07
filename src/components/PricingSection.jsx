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
      'Advanced optimization suggestions',
      'Priority model recommendations',
      'Prompt history & saving',
      'Enhanced usage limits',
      'Premium AI models'
    ]
  }

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Choose Your AI Advantage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of professionals getting better results with AI
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto pt-8" style={{overflow: 'visible'}}>
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative h-full flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
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

            <div className="space-y-4 mb-8">
              {features.free.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">{feature}</span>
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
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 pt-12 relative h-full flex flex-col overflow-visible hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" style={{contain: 'none'}}>
            {/* Premium accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-2xl"></div>
            {/* Popular Badge - floating on top of card */}
            <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1 shadow-lg">
                <Sparkles className="w-4 h-4" />
                <span>Save 70% – Limited-time launch pricing</span>
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
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg text-gray-500 line-through">10 EUR</span>
                  <div className="text-3xl font-bold text-gray-900">3 EUR</div>
                </div>
                <div className="text-sm text-gray-500">/ month</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {features.premium.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center group-hover:from-purple-700 group-hover:to-blue-700 transition-all duration-200">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">{feature}</span>
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

            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl group mb-4">
              <div className="flex items-center justify-center">
                <Crown className="w-5 h-5 mr-2" />
                <span>Start 7-Day Free Trial</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600">
                ✓ No credit card required • ✓ Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection 