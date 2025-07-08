import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronUp, Cpu, Zap, Eye, Star } from 'lucide-react'
import { 
  AI_MODELS, 
  getAllProviders, 
  getModelsByProvider
} from '../data/aiModels'

const ModelSelector = ({ selectedModel, onModelChange, suggestedModelId, modelRecommendation, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('all')
  const triggerRef = useRef(null)
  const dropdownRef = useRef(null)

  const providers = getAllProviders()
  const currentModel = AI_MODELS[selectedModel]

  const filteredModels = useMemo(() => {
    let models = selectedProvider === 'all' 
      ? Object.values(AI_MODELS)
      : getModelsByProvider(selectedProvider);

    if (suggestedModelId && models.some(m => m.id === suggestedModelId)) {
      models = models.sort((a, b) => {
        if (a.id === suggestedModelId) return -1;
        if (b.id === suggestedModelId) return 1;
        return 0;
      });
    }
    return models;
  }, [selectedProvider, suggestedModelId]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className={compact ? "relative z-50 model-selector" : "card p-6 relative z-50 model-selector model-selector-container"}>
      {!compact && (
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
        </div>
      )}
      
      {compact && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center">
            <Cpu className="w-4 h-4 mr-2 text-primary-600" />
            AI Model Selection
          </h4>
        </div>
      )}
      
      {/* Semantic Routing Recommendation Display */}
      {modelRecommendation && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current mr-2" />
                <span className="text-sm font-medium text-blue-900">Smart Recommendation</span>
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  modelRecommendation.primary.confidence >= 0.8 
                    ? 'bg-green-100 text-green-700' 
                    : modelRecommendation.primary.confidence >= 0.6
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {(modelRecommendation.primary.confidence * 100).toFixed(0)}% confidence
                </span>
              </div>
              <p className="text-sm text-blue-800 mb-2">
                <strong>{modelRecommendation.primary.model.name}</strong> - {modelRecommendation.primary.reasoning}
              </p>
              {modelRecommendation.alternatives.length > 0 && (
                <details className="text-xs text-blue-700">
                  <summary className="cursor-pointer hover:text-blue-800">
                    View {modelRecommendation.alternatives.length} alternatives
                  </summary>
                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-blue-200">
                    {modelRecommendation.alternatives.slice(0, 2).map((alt, index) => (
                      <div key={index}>
                        <strong>{alt.model.name}</strong> ({(alt.score * 100).toFixed(0)}% match) - {alt.reasoning}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Current Selection Display */}
      <div className="relative">
        <div 
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-white border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-primary-300 hover:shadow-sm transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`px-2 py-1 text-xs rounded font-medium ${getProviderColor(currentModel?.provider)}`}>
                {currentModel?.provider}
              </div>
              <div>
                <div className="font-medium text-gray-900 flex items-center">
                  {currentModel?.name}
                  {currentModel?.id === suggestedModelId && !isOpen && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current ml-2" />
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {currentModel?.contextWindow?.toLocaleString()} tokens • {currentModel?.preferredFormat?.toUpperCase()} format
                </div>
              </div>
            </div>
            {isOpen ? 
              <ChevronUp className="w-5 h-5 text-gray-400" /> : 
              <ChevronDown className="w-5 h-5 text-gray-400" />
            }
          </div>
        </div>

        {/* Dropdown content, now absolute positioned within the relative container */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-80 overflow-hidden z-[9999] model-selector-dropdown"
            style={{ width: triggerRef.current?.offsetWidth || 'auto', zIndex: 9999 }}
          >
            {/* Simple Provider Filter */}
            <div className="p-3 bg-gray-50 border-b border-gray-100">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedProvider('all')}
                  className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                    selectedProvider === 'all' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All
                </button>
                {providers.map(provider => (
                  <button
                    key={provider}
                    onClick={() => setSelectedProvider(provider)}
                    className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                      selectedProvider === provider 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {provider}
                  </button>
                ))}
              </div>
            </div>

            {/* Simplified Model List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredModels.map(model => {
                const isSelected = model.id === selectedModel
                const isSuggested = model.id === suggestedModelId
                
                return (
                  <div 
                    key={model.id} 
                    onClick={() => {
                      onModelChange(model.id)
                      setIsOpen(false)
                    }}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                      isSelected ? 'bg-blue-50' : ''
                    } ${isSuggested ? 'bg-yellow-50/50 border-l-4 border-yellow-400' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`px-2 py-0.5 text-xs rounded font-medium ${getProviderColor(model.provider)}`}>
                            {model.provider}
                          </div>
                          <span className="font-medium text-gray-900">{model.name}</span>
                          {isSuggested && (
                            <div className="flex items-center text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                              <Star className="w-3 h-3 mr-1"/>
                              Recommended
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {model.contextWindow?.toLocaleString()} tokens
                          </span>
                          <span className="flex items-center">
                            <Zap className="w-3 h-3 mr-1" />
                            {model.preferredFormat?.toUpperCase()} format
                          </span>
                          {model.features?.multimodal && (
                            <span className="text-blue-600">• Multimodal</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Simple Summary */}
      {currentModel && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong className="text-gray-900">{currentModel.name}</strong> supports up to{' '}
            <strong className="text-gray-900">{currentModel.contextWindow?.toLocaleString()}</strong> tokens
            {currentModel.features?.multimodal && (
              <span className="text-blue-600">• Multimodal</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector 