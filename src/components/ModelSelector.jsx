import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Info, Zap, Brain, Eye, DollarSign, Clock, Sparkles, Cpu } from 'lucide-react'
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
      'Anthropic': 'bg-purple-100 text-purple-700 border-purple-200',
      'OpenAI': 'bg-green-100 text-green-700 border-green-200',
      'Google': 'bg-blue-100 text-blue-700 border-blue-200',
      'Mistral AI': 'bg-orange-100 text-orange-700 border-orange-200',
      'Meta': 'bg-indigo-100 text-indigo-700 border-indigo-200'
    }
    return colors[provider] || 'bg-gray-100 text-gray-700 border-gray-200'
  }

  const formatPrice = (price) => {
    return price < 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(0)}`
  }

  return (
    <div className="card p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-primary-600" />
            AI Model
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose the optimal model for your task
          </p>
        </div>
        {estimatedTokens && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              ~{estimatedTokens.toLocaleString()} tokens
            </p>
            <p className="text-xs text-gray-500">estimated</p>
          </div>
        )}
      </div>
      
      {/* Current Selection Display */}
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-4 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all duration-200 hover-lift"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1.5 text-sm rounded-lg font-semibold border ${getProviderColor(currentModel?.provider)}`}>
                {currentModel?.provider}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{currentModel?.name}</div>
                <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    {currentModel?.preferredFormat?.toUpperCase()}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {currentModel?.contextWindow?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatPrice(currentModel?.pricing?.input || 0)}/1M
                </div>
                <div className="text-xs text-gray-500">input tokens</div>
              </div>
              {isOpen ? 
                <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                <ChevronDown className="w-5 h-5 text-gray-400" />
              }
            </div>
          </div>
        </div>

        {/* Enhanced Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-hidden">
            {/* Provider Filter */}
            <div className="p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedProvider('all')}
                  className={`px-3 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${
                    selectedProvider === 'all' 
                      ? 'bg-primary-600 text-white shadow-md' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover-lift'
                  }`}
                >
                  All Models ({Object.values(AI_MODELS).length})
                </button>
                {providers.map(provider => {
                  const modelCount = getModelsByProvider(provider).length
                  return (
                    <button
                      key={provider}
                      onClick={() => setSelectedProvider(provider)}
                      className={`px-3 py-2 text-sm rounded-lg font-semibold transition-all duration-200 ${
                        selectedProvider === provider 
                          ? 'bg-primary-600 text-white shadow-md' 
                          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover-lift'
                      }`}
                    >
                      {provider} ({modelCount})
                    </button>
                  )
                })}
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
                    className={`p-4 hover:bg-blue-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 hover-lift ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`px-2 py-1 text-xs rounded-md font-semibold border ${getProviderColor(model.provider)}`}>
                            {model.provider}
                          </div>
                          <span className="font-semibold text-gray-900">{model.name}</span>
                          {model.features?.multimodal && (
                            <div className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md border border-blue-200">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Multimodal
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{model.description}</p>
                        
                        {/* Enhanced Key Features */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center text-gray-600">
                            <Eye className="w-3 h-3 mr-1.5 text-primary-600" />
                            <span className="font-medium">{model.contextWindow?.toLocaleString()}</span>
                            <span className="ml-1 text-gray-500">tokens</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Zap className="w-3 h-3 mr-1.5 text-primary-600" />
                            <span className="font-medium">{model.preferredFormat?.toUpperCase()}</span>
                            <span className="ml-1 text-gray-500">format</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-sm font-semibold text-gray-900 mb-1">
                          {formatPrice(model.pricing.input)}/1M
                        </div>
                        {cost && (
                          <div className="text-xs text-green-600 font-medium">
                            ~${cost.totalCost.toFixed(4)} est.
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {model.speed || 'Standard'} speed
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Info Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-center text-xs text-gray-500">
                <Info className="w-3 h-3 mr-1" />
                <span>Pricing shown is for input tokens. Output pricing may vary.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Model Capabilities Summary */}
      {currentModel && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Context Window:</span>
              <span className="font-semibold text-gray-900">
                {currentModel.contextWindow?.toLocaleString()} tokens
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Optimal Format:</span>
              <span className="font-semibold text-gray-900">
                {currentModel.preferredFormat?.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Input Pricing:</span>
              <span className="font-semibold text-gray-900">
                {formatPrice(currentModel.pricing.input)}/1M
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Capabilities:</span>
              <div className="flex items-center space-x-1">
                {currentModel.features?.multimodal && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Multimodal"></div>
                )}
                {currentModel.features?.functionCalling && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Function Calling"></div>
                )}
                {currentModel.features?.codeGeneration && (
                  <div className="w-2 h-2 bg-purple-500 rounded-full" title="Code Generation"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector 