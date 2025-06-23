import React, { useState } from 'react'
import { Copy, Check, Eye, Code, AlertCircle, ArrowRight, Sparkles, FileText, Settings, Zap } from 'lucide-react'
import { getModelById, PROMPT_FORMATS } from '../data/aiModels'

const EnhancedPromptPreview = ({ 
  rawPrompt, 
  enrichedPrompt, 
  enrichmentResult,
  promptMetadata,
  selectedModel,
  validation, 
  isEnriching, 
  hasEnrichment,
  onEnrichNow,
  enrichmentError,
  isAuthenticated,
  isPro
}) => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(hasEnrichment ? 'enriched' : 'raw')
  
  const currentModel = getModelById(selectedModel)
  
  const handleCopy = async (prompt) => {
    if (!prompt) return
    
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const renderPromptContent = (prompt, isEnhanced = false) => {
    return (
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-4 border min-h-[200px]">
          {prompt ? (
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 overflow-x-auto">
              {prompt}
            </pre>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              {isEnriching ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm">Generating enhanced prompt...</span>
                </div>
              ) : (
                <span className="text-sm italic">No prompt generated yet</span>
              )}
            </div>
          )}
        </div>
        
        {prompt && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>{prompt.split('\n').length} lines</span>
              <span>{prompt.length} characters</span>
              {promptMetadata?.estimatedTokens && (
                <span className="flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  ~{promptMetadata.estimatedTokens} tokens
                </span>
              )}
            </div>
            <button
              onClick={() => handleCopy(prompt)}
              className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            Generated Prompts
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {currentModel && `Optimized for ${currentModel.name}`}
            {promptMetadata?.format && ` • ${promptMetadata.format.toUpperCase()} format`}
          </p>
        </div>
        
        {validation.isValid && !isEnriching && (
          <div className="flex items-center space-x-2">
            {hasEnrichment && (
              <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full border border-green-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Enhanced
              </span>
            )}
            {!hasEnrichment && onEnrichNow && (
              <button
                onClick={onEnrichNow}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
              >
                <Sparkles className="w-4 h-4 mr-1 inline" />
                Enhance Prompt
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {enrichmentError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-700">{enrichmentError}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      {rawPrompt && (
        <div className="flex space-x-1 mb-4 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'raw'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Code className="w-4 h-4 mr-1 inline" />
            Basic Prompt
          </button>
          {(enrichedPrompt || hasEnrichment) && (
            <button
              onClick={() => setActiveTab('enriched')}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'enriched'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4 mr-1 inline" />
              Enhanced Prompt
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {activeTab === 'raw' && renderPromptContent(rawPrompt)}
      {activeTab === 'enriched' && renderPromptContent(enrichedPrompt || rawPrompt, true)}

      {/* Enhancement Results */}
      {hasEnrichment && enrichmentResult && activeTab === 'enriched' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Enhancement Summary</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {enrichmentResult.qualityScore && (
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {enrichmentResult.qualityScore}/10
                </div>
                <div className="text-xs text-blue-700">Quality Score</div>
              </div>
            )}
            {enrichmentResult.improvements && (
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {enrichmentResult.improvements.length}
                </div>
                <div className="text-xs text-blue-700">Improvements</div>
              </div>
            )}
            {enrichmentResult.processingTime && (
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {enrichmentResult.processingTime}
                </div>
                <div className="text-xs text-blue-700">Processing Time</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {!validation.isValid && validation.errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {validation.errors.map((error, index) => (
              <li key={index} className="flex items-center">
                <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default EnhancedPromptPreview 