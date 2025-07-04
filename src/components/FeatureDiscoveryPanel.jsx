import React, { useState } from 'react'
import { Clock, Save, Cpu, Sparkles, ChevronRight, X, HelpCircle, Zap } from 'lucide-react'

const FeatureDiscoveryPanel = ({ onFeatureSelect, isVisible = true }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)

  const features = [
    {
      id: 'smart-model',
      title: 'Smart Model Selection',
      description: 'AI automatically recommends the best model for your task',
      icon: <Cpu className="w-5 h-5" />,
      color: 'blue',
      demo: 'Based on your prompt, we suggest GPT-4 for complex reasoning tasks',
      isNew: true
    },
    {
      id: 'session-history',
      title: 'Session History',
      description: 'Undo/redo changes and track your prompt evolution',
      icon: <Clock className="w-5 h-5" />,
      color: 'green',
      demo: 'Use Ctrl+Z to undo or see your complete editing history',
      isNew: false
    },
    {
      id: 'prompt-enhancement',
      title: 'AI Enhancement',
      description: 'Transform basic prompts into professional instructions',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'purple',
      demo: 'Turn "write an email" into detailed, context-aware instructions',
      isPro: true
    },
    {
      id: 'quick-save',
      title: 'Save & Library',
      description: 'Save successful prompts to your personal library',
      icon: <Save className="w-5 h-5" />,
      color: 'orange',
      demo: 'Build your collection of proven prompts for future use',
      isNew: false
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700'
    }
    return colors[color] || colors.blue
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
        >
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Discover Features</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      ) : (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Zap className="w-5 h-5 text-blue-600 mr-2" />
              Features
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedFeature === feature.id ? 'ring-2 ring-blue-500' : ''
                } ${getColorClasses(feature.color)}`}
                onClick={() => {
                  setSelectedFeature(feature.id)
                  onFeatureSelect?.(feature.id)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-1">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        {feature.isNew && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            New
                          </span>
                        )}
                        {feature.isPro && (
                          <span className="px-2 py-0.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs rounded-full">
                            Pro
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-90 mb-2">{feature.description}</p>
                      <p className="text-xs italic opacity-75">{feature.demo}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Click any feature to learn more or get started
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeatureDiscoveryPanel 