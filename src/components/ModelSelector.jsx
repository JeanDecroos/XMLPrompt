import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronUp, Cpu, Zap, Eye } from 'lucide-react'
import { 
  AI_MODELS, 
  getAllProviders, 
  getModelsByProvider
} from '../data/aiModels'

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef(null)

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

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8, // 8px gap
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target)) {
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

  const DropdownContent = () => (
    <div 
      className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-2xl max-h-80 overflow-visible"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width
      }}
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
          
          return (
            <div 
              key={model.id} 
              onClick={() => {
                onModelChange(model.id)
                setIsOpen(false)
              }}
              className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                isSelected ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`px-2 py-0.5 text-xs rounded font-medium ${getProviderColor(model.provider)}`}>
                      {model.provider}
                    </div>
                    <span className="font-medium text-gray-900">{model.name}</span>
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
  )

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
      </div>
      
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
                <div className="font-medium text-gray-900">{currentModel?.name}</div>
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

        {/* Portal-rendered Dropdown */}
        {isOpen && typeof document !== 'undefined' && createPortal(
          <DropdownContent />,
          document.body
        )}
      </div>

      {/* Simple Summary */}
      {currentModel && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <strong className="text-gray-900">{currentModel.name}</strong> supports up to{' '}
            <strong className="text-gray-900">{currentModel.contextWindow?.toLocaleString()}</strong> tokens
            {currentModel.features?.multimodal && (
              <span className="text-blue-600"> • Supports images and text</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector 