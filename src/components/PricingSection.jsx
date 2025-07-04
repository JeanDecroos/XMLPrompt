import React from 'react'
import { Check, Crown, Zap, Star, ArrowRight, Sparkles } from 'lucide-react'

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
      'Prompt history & library',
      'Performance analytics',
      'Priority support'
    ]
  }

  return (
    <section id="pricing" className="py-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Social Proof */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-full text-sm font-medium text-green-800 mb-4">
            <Star className="w-4 h-4 mr-2" />
            4.9/5 from 500+ users
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your AI Advantage
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of professionals getting better AI results
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="card p-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
                <p className="text-gray-600 mt-1">Perfect for getting started</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">$0</div>
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

            <button className="btn btn-secondary btn-lg w-full">
              <span>Current Plan</span>
            </button>
          </div>

          {/* Premium Plan */}
          <div className="card-premium p-8 relative transform scale-105">
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>Save 34% - Limited Time</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-600 mt-1">Professional AI optimization</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg text-gray-500 line-through">$29</span>
                  <div className="text-3xl font-bold text-gray-900">$19</div>
                </div>
                <div className="text-sm text-gray-500">per month</div>
                <div className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full mt-1">
                  Launch pricing ends soon
                </div>
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
                Save 2+ hours per week on prompt creation. ROI typically achieved in first week.
              </p>
            </div>

            <button className="btn btn-premium btn-lg w-full group mb-4">
              <Crown className="w-5 h-5 mr-2" />
              <span>Start 7-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-center space-y-1">
              <p className="text-sm text-gray-600">
                ✓ No credit card required • ✓ Cancel anytime
              </p>
              <p className="text-xs text-gray-500">
                Join 1,000+ professionals already using Premium
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection 