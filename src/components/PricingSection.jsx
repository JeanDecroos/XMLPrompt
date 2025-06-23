import React from 'react'
import { Check, Crown, Zap, Star, ArrowRight, Sparkles } from 'lucide-react'

const PricingSection = () => {
  const features = {
    free: [
      'Basic XML prompt generation',
      'Role-based templates',
      'Simple task descriptions',
      'Standard context input',
      'Copy to clipboard',
      'Basic export options'
    ],
    premium: [
      'AI-enhanced prompt optimization',
      'Advanced requirement analysis',
      'Smart style suggestions',
      'Custom output formatting',
      'Tone & voice optimization',
      'Multi-model compatibility',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
      'Custom integrations'
    ]
  }

  return (
    <section id="pricing" className="py-16 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto text-balance">
            Start free and upgrade when you need advanced AI-powered features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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

            <div className="space-y-4 mb-8">
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
                <span>Most Popular</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-gray-600 mt-1">AI-powered prompt engineering</p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline space-x-1">
                  <span className="text-lg text-gray-500 line-through">$29</span>
                  <div className="text-3xl font-bold text-gray-900">$19</div>
                </div>
                <div className="text-sm text-gray-500">per month</div>
                <div className="text-xs text-purple-600 font-medium">33% off launch price</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {features.premium.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button className="btn btn-premium btn-lg w-full group">
              <Crown className="w-5 h-5 mr-2" />
              <span>Start Free Trial</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-center text-sm text-gray-500 mt-3">
              7-day free trial • No credit card required
            </p>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Why Upgrade to Premium?
            </h3>
            <p className="text-gray-600">
              See the difference AI enhancement makes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Example */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <h4 className="font-semibold text-gray-900">Free Plan Output</h4>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
                <div className="text-gray-600 font-mono leading-relaxed">
                  &lt;prompt&gt;<br/>
                  &nbsp;&nbsp;&lt;role&gt;Developer&lt;/role&gt;<br/>
                  &nbsp;&nbsp;&lt;task&gt;Write a function&lt;/task&gt;<br/>
                  &lt;/prompt&gt;
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Basic XML structure with minimal optimization
              </p>
            </div>

            {/* Premium Example */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"></div>
                <h4 className="font-semibold text-gray-900 flex items-center">
                  Premium Plan Output
                  <Sparkles className="w-4 h-4 ml-1 text-purple-600" />
                </h4>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4 text-sm">
                <div className="text-gray-700 font-mono leading-relaxed">
                  &lt;prompt&gt;<br/>
                  &nbsp;&nbsp;&lt;role&gt;Senior Full-Stack Developer&lt;/role&gt;<br/>
                  &nbsp;&nbsp;&lt;task&gt;Create an optimized, well-documented function with error handling&lt;/task&gt;<br/>
                  &nbsp;&nbsp;&lt;context&gt;Modern JavaScript ES6+ environment&lt;/context&gt;<br/>
                  &nbsp;&nbsp;&lt;requirements&gt;Include TypeScript types, unit tests&lt;/requirements&gt;<br/>
                  &nbsp;&nbsp;&lt;style&gt;Clean, maintainable code with JSDoc&lt;/style&gt;<br/>
                  &lt;/prompt&gt;
                </div>
              </div>
              <p className="text-sm text-purple-700 font-medium">
                AI-enhanced with context, requirements, and optimization
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span className="text-sm">Instant Setup</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span className="text-sm">Cancel Anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span className="text-sm">Premium Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection 