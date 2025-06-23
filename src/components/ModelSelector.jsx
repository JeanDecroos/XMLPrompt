import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Info, Zap, Brain, Eye, DollarSign, Clock, Sparkles } from 'lucide-react'
import { 
  AI_MODELS, 
  getAllProviders, 
  getModelsByProvider, 
  getOptimalFormat,
  estimateTokenCost,
  PROMPT_FORMATS 
} from '../data/aiModels'

const ModelSelector = ({ selectedModel, onModelChange, estimatedTokens = 1000 }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('all')

  const providers = getAllProviders()
  const currentModel = AI_MODELS[selectedModel]

  const filteredModels = selectedProvider === 'all' 
    ? Object.values(AI_MODELS)
    : getModelsByProvider(selectedProvider)

  const getProviderColor = (provider) => {
    const colors = {
      'Anthropic': 'bg-purple-100 text-purple-700',
      'OpenAI': 'bg-green-100 text-green-700',
      'Google': 'bg-blue-100 text-blue-700',
      'Mistral AI': 'bg-orange-100 text-orange-700',
      'Meta': 'bg-indigo-100 text-indigo-700'
    }
    return colors[provider] || 'bg-gray-100 text-gray-700'
  }

  const formatPrice = (price) => {
    return price < 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(0)}`
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        AI Model
      </label>
      
      {/* Current Selection Display */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-400 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getProviderColor(currentModel?.provider)}`}>
              {currentModel?.provider}
            </span>
            <div>
              <span className="font-medium text-gray-900">{currentModel?.name}</span>
              <p className="text-sm text-gray-500">{currentModel?.preferredFormat?.toUpperCase()} format</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {formatPrice(currentModel?.pricing?.input || 0)}/1M
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Provider Filter */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedProvider('all')}
                className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                  selectedProvider === 'all' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                All Models
              </button>
              {providers.map(provider => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
                    selectedProvider === provider 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          {/* Model List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredModels.map(model => {
              const cost = estimateTokenCost(model.id, estimatedTokens, estimatedTokens * 0.3)
              const isSelected = model.id === selectedModel
              
              return (
                <div 
                  key={model.id} 
                  onClick={() => {
                    onModelChange(model.id)
                    setIsOpen(false)
                  }}
                  className={`p-4 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getProviderColor(model.provider)}`}>
                          {model.provider}
                        </span>
                        <span className="font-medium text-gray-900">{model.name}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                      
                      {/* Key Features */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {model.contextWindow?.toLocaleString()} tokens
                        </span>
                        <span className="flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {model.preferredFormat?.toUpperCase()}
                        </span>
                        {model.features?.multimodal && (
                          <span className="flex items-center text-blue-600">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Multimodal
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(model.pricing.input)}/1M
                      </div>
                      {cost && (
                        <div className="text-xs text-green-600">
                          ~${cost.totalCost.toFixed(4)} est.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector 