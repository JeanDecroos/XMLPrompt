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
  const [showDetails, setShowDetails] = useState({})

  const providers = getAllProviders()
  const currentModel = AI_MODELS[selectedModel]

  const filteredModels = selectedProvider === 'all' 
    ? Object.values(AI_MODELS)
    : getModelsByProvider(selectedProvider)

  const toggleDetails = (modelId) => {
    setShowDetails(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }))
  }

  const getCapabilityIcon = (capability, level) => {
    const icons = {
      reasoning: Brain,
      coding: Zap,
      analysis: Info,
      creative: Sparkles,
      multimodal: Eye
    }
    const Icon = icons[capability] || Info
    const colors = {
      excellent: 'text-green-600',
      good: 'text-blue-600',
      fair: 'text-yellow-600'
    }
    return <Icon className={`w-4 h-4 ${colors[level] || 'text-gray-400'}`} />
  }

  const formatPrice = (price) => {
    return price < 1 ? `$${price.toFixed(2)}` : `$${price.toFixed(0)}`
  }

  const getFormatBadgeColor = (format) => {
    const colors = {
      [PROMPT_FORMATS.XML]: 'bg-purple-100 text-purple-800',
      [PROMPT_FORMATS.JSON]: 'bg-blue-100 text-blue-800',
      [PROMPT_FORMATS.MARKDOWN]: 'bg-green-100 text-green-800',
      [PROMPT_FORMATS.STRUCTURED]: 'bg-orange-100 text-orange-800',
      [PROMPT_FORMATS.YAML]: 'bg-indigo-100 text-indigo-800',
      [PROMPT_FORMATS.PLAIN]: 'bg-gray-100 text-gray-800'
    }
    return colors[format] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        AI Model
      </label>
      
      {/* Current Selection Display */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-primary-500 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                currentModel?.provider === 'Anthropic' ? 'bg-purple-500' :
                currentModel?.provider === 'OpenAI' ? 'bg-green-500' :
                currentModel?.provider === 'Google' ? 'bg-blue-500' :
                currentModel?.provider === 'Mistral AI' ? 'bg-orange-500' :
                currentModel?.provider === 'Meta' ? 'bg-blue-600' :
                'bg-gray-500'
              }`} />
              <span className="font-medium text-gray-900">{currentModel?.name}</span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full ${getFormatBadgeColor(currentModel?.preferredFormat)}`}>
              {currentModel?.preferredFormat?.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {formatPrice(currentModel?.pricing?.input || 0)}/1M tokens
            </span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Provider Filter */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedProvider('all')}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  selectedProvider === 'all' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {providers.map(provider => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedProvider === provider 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              
              return (
                <div key={model.id} className="border-b border-gray-100 last:border-b-0">
                  <div 
                    onClick={() => {
                      onModelChange(model.id)
                      setIsOpen(false)
                    }}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${
                            model.provider === 'Anthropic' ? 'bg-purple-500' :
                            model.provider === 'OpenAI' ? 'bg-green-500' :
                            model.provider === 'Google' ? 'bg-blue-500' :
                            model.provider === 'Mistral AI' ? 'bg-orange-500' :
                            model.provider === 'Meta' ? 'bg-blue-600' :
                            'bg-gray-500'
                          }`} />
                          <span className="font-medium text-gray-900">{model.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getFormatBadgeColor(model.preferredFormat)}`}>
                            {model.preferredFormat.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                        
                        {/* Capabilities */}
                        <div className="flex items-center space-x-3 mb-2">
                          {Object.entries(model.capabilities).map(([capability, level]) => (
                            <div key={capability} className="flex items-center space-x-1">
                              {getCapabilityIcon(capability, level)}
                              <span className="text-xs text-gray-500 capitalize">{capability}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-3 h-3 text-gray-400" />
                          <span className="text-sm font-medium">{formatPrice(model.pricing.input)}</span>
                          <span className="text-xs text-gray-500">/1M</span>
                        </div>
                        {cost && (
                          <span className="text-xs text-green-600">
                            ~${cost.totalCost.toFixed(4)} est.
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleDetails(model.id)
                          }}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          {showDetails[model.id] ? 'Less' : 'Details'}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {showDetails[model.id] && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                        {/* Features */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Features</h5>
                          <div className="flex flex-wrap gap-1">
                            {model.features.map(feature => (
                              <span 
                                key={feature}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded"
                              >
                                {feature.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Context & Pricing */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-500">Context Window:</span>
                            <span className="ml-1 font-medium">{model.contextWindow.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Max Output:</span>
                            <span className="ml-1 font-medium">{model.maxTokens.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Input Price:</span>
                            <span className="ml-1 font-medium">{formatPrice(model.pricing.input)}/1M</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Output Price:</span>
                            <span className="ml-1 font-medium">{formatPrice(model.pricing.output)}/1M</span>
                          </div>
                        </div>

                        {/* Best Practices */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Optimization Tips</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {model.promptGuidelines.bestPractices.slice(0, 2).map((practice, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-primary-500 mr-1">•</span>
                                {practice}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Model Info Summary */}
      {currentModel && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              Optimized for {currentModel.name}
            </h4>
            <span className="text-xs text-gray-500">
              {currentModel.provider}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-1">
              <Info className="w-3 h-3 text-blue-500" />
              <span>Format: {currentModel.preferredFormat.toUpperCase()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-green-500" />
              <span>Context: {(currentModel.contextWindow / 1000).toFixed(0)}K tokens</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3 text-purple-500" />
              <span>From {formatPrice(currentModel.pricing.input)}/1M</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-orange-500" />
              <span>
                {Object.values(currentModel.capabilities).filter(c => c === 'excellent').length} excellent capabilities
              </span>
            </div>
          </div>

          {estimatedTokens > 0 && (
            <div className="mt-2 pt-2 border-t border-blue-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Estimated cost for this prompt:</span>
                <span className="font-medium text-green-600">
                  ${estimateTokenCost(currentModel.id, estimatedTokens, estimatedTokens * 0.3)?.totalCost.toFixed(4) || '0.0000'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ModelSelector 