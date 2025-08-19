import React from 'react'
import { Check, Crown, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const PricingSection = () => {
  const features = {
    free: [
      'Universal prompt generation',
      'Multi-model format support',
      'Basic templates and examples',
      'Copy & export functionality',
      'Access to all models'
    ],
    premium: [
      'AI-powered prompt enhancement',
      'Deeper AI enhancement options',
      'Priority model recommendations',
      'Prompt history & saving',
      'Enhanced usage limits',
      'Priority support'
    ]
  }

  const { isPro } = useAuth()

  return (
    <section id="pricing" className="min-h-[calc(100vh-200px)] flex items-center py-16 bg-transparent">
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
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pt-4 md:pt-12" style={{overflow: 'visible'}}>
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

            {!isPro && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Current Plan Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Premium Plan */}
          <div className="relative group h-full rounded-2xl p-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-gradient-pan shadow-xl overflow-visible">
            {/* Soft animated glow halo behind the gradient frame */}
            <div aria-hidden className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-r from-purple-400/25 via-fuchsia-400/20 to-blue-400/25 blur-3xl opacity-70 group-hover:opacity-90 transition-opacity"></div>
            {/* Dynamic pixelated shadow under card (subtle and non-themed) */}
            <div
              aria-hidden
              className="absolute z-0 left-8 right-8 -bottom-8 h-10 rounded-2xl opacity-85 animate-float-slow pointer-events-none mix-blend-multiply"
              style={{
                imageRendering: 'pixelated',
                background:
                  'repeating-linear-gradient(0deg, rgba(17,24,39,0.22) 0 2px, transparent 2px 4px), repeating-linear-gradient(90deg, rgba(17,24,39,0.22) 0 2px, transparent 2px 4px), radial-gradient(60% 70% at 50% 40%, rgba(17,24,39,0.25), rgba(59,130,246,0.18) 55%, transparent 75%)',
                filter: 'blur(14px) saturate(115%)',
                backgroundSize: 'auto, auto, 100% 100%',
                boxShadow: '0 35px 60px rgba(17,24,39,0.18)'
              }}
            >
              <div className="w-full h-full rounded-2xl opacity-85 animate-pixel-shift" />
            </div>
            <div className="card-premium p-8 pt-12 relative z-10 h-full flex flex-col overflow-visible rounded-[0.95rem] transition-transform duration-300 ease-out group-hover:scale-[1.01]" style={{contain: 'none'}}>
              {/* Shimmer accent across the title area */}
              <div aria-hidden className="pointer-events-none absolute -top-4 left-8 right-8 h-8 rounded-xl bg-gradient-to-r from-white/20 via-white/40 to-white/20 blur-md opacity-40 group-hover:opacity-70"></div>

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
                <div className="text-sm text-gray-500">/ month</div>
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

            {/* Removed value highlight per request */}

            {isPro ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-center">
                <span className="text-sm font-semibold text-green-800">You're on Premium</span>
              </div>
            ) : (
              <button className="btn btn-premium btn-lg w-full group mb-4 animate-pulse-glow" onClick={() => window.location.href = '/billing/upgrade'}>
                <Crown className="w-5 h-5 mr-2" />
                <span>Upgrade to Premium</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            {/* Hover sheen */}
            <div aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 bg-white/30 blur-md opacity-0 skew-x-12 rounded-2xl group-hover:opacity-60 group-hover:animate-sheen" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection 