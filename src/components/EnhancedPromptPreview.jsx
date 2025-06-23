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
  const [viewMode, setViewMode] = useState('comparison') // 'comparison', 'enriched', 'raw'
  const [activeTab, setActiveTab] = useState('enriched')
  
  const currentModel = getModelById(selectedModel)
  
  const getFormatIcon = (format) => {
    const icons = {
      [PROMPT_FORMATS.XML]: Code,
      [PROMPT_FORMATS.JSON]: FileText,
      [PROMPT_FORMATS.MARKDOWN]: FileText,
      [PROMPT_FORMATS.STRUCTURED]: Settings,
      [PROMPT_FORMATS.YAML]: Code,
      [PROMPT_FORMATS.PLAIN]: FileText
    }
    return icons[format] || FileText
  }

  const getFormatColor = (format) => {
    const colors = {
      [PROMPT_FORMATS.XML]: 'text-purple-600',
      [PROMPT_FORMATS.JSON]: 'text-blue-600',
      [PROMPT_FORMATS.MARKDOWN]: 'text-green-600',
      [PROMPT_FORMATS.STRUCTURED]: 'text-orange-600',
      [PROMPT_FORMATS.YAML]: 'text-indigo-600',
      [PROMPT_FORMATS.PLAIN]: 'text-gray-600'
    }
    return colors[format] || 'text-gray-600'
  }

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

  const formatPromptForDisplay = (prompt) => {
    if (!prompt) return ''
    
    return prompt
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;\/?)(\w+)(&gt;)/g, '<span class="text-blue-600">$1$2$3</span>')
      .replace(/\n/g, '<br/>')
      .replace(/  /g, '&nbsp;&nbsp;')
  }

  const renderPromptContent = (prompt, title, showCopy = true, isEnhanced = false) => {
    const formatIcon = getFormatIcon(promptMetadata?.format || currentModel?.preferredFormat)
    const formatColor = getFormatColor(promptMetadata?.format || currentModel?.preferredFormat)
    const FormatIcon = formatIcon
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="font-medium text-gray-900 flex items-center">
              {isEnhanced ? (
                <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
              ) : (
                <FormatIcon className={`w-4 h-4 mr-2 ${formatColor}`} />
              )}
              {title}
            </h4>
            {promptMetadata?.format && (
              <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 ${formatColor}`}>
                {promptMetadata.format.toUpperCase()}
              </span>
            )}
            {currentModel && (
              <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                {currentModel.name}
              </span>
            )}
          </div>
          {showCopy && prompt && (
            <button
              onClick={() => handleCopy(prompt)}
              className="btn-primary flex items-center text-xs px-3 py-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 border">
          {prompt ? (
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
              {prompt}
            </pre>
          ) : (
            <div className="text-gray-500 text-sm italic">
              {isEnriching ? 'Generating...' : 'No prompt generated yet'}
            </div>
          )}
        </div>
        
        {prompt && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {prompt.split('\n').length} lines • {prompt.length} characters
            </span>
            {promptMetadata?.estimatedTokens && (
              <span className="flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                ~{promptMetadata.estimatedTokens} tokens
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="card p-6 scale-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-primary-600" />
            Generated Prompts
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {hasEnrichment ? 'AI-enhanced results ready' : 'Basic prompt generated'}
            {currentModel && (
              <span className="ml-2">• Optimized for {currentModel.name}</span>
            )}
          </p>
        </div>
        
        {validation.isValid && (hasEnrichment || enrichedPrompt) && (
          <div className="flex items-center space-x-3">
            {/* Quality Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                {hasEnrichment ? 'Enhanced' : 'Basic'}
              </span>
            </div>
            
            {/* View Mode Selector */}
            <div className="flex rounded-lg bg-gray-100 p-1 shadow-sm">
              <button
                onClick={() => setViewMode('comparison')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                  viewMode === 'comparison'
                    ? 'bg-white text-gray-900 shadow-sm transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ArrowRight className="w-4 h-4 mr-1 inline" />
                Compare
              </button>
              <button
                onClick={() => setViewMode('enriched')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                  viewMode === 'enriched'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-4 h-4 mr-1 inline" />
                Enhanced
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                  viewMode === 'raw'
                    ? 'bg-white text-gray-900 shadow-sm transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Code className="w-4 h-4 mr-1 inline" />
                Original
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="min-h-[400px]">
        {!validation.isValid ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              Complete the form to generate prompts
            </h4>
            <p className="text-gray-500 max-w-md">
              Fill in the required fields (Role and Task Description) to see your generated prompts here.
            </p>
            {validation.errors.length > 0 && (
              <div className="mt-4 text-sm text-red-600">
                Missing: {validation.errors.join(', ')}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Comparison View */}
            {viewMode === 'comparison' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                    <h4 className="font-medium text-gray-700">Original Input</h4>
                  </div>
                  {renderPromptContent(rawPrompt, '', false)}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <h4 className="font-medium text-gray-700">AI-Enhanced</h4>
                    {isEnriching && (
                      <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b border-purple-600"></div>
                    )}
                  </div>
                  {renderPromptContent(enrichedPrompt, '', true)}
                </div>
              </div>
            )}

            {/* Enriched Only View */}
            {viewMode === 'enriched' && (
              <div className="space-y-6">
                {renderPromptContent(enrichedPrompt, 'Enriched Prompt', true, true)}
                
                {/* Enrichment Improvements */}
                {enrichmentResult?.improvements && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                    <h5 className="font-medium text-green-800 mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Enhancements Applied
                    </h5>
                    <ul className="space-y-2">
                      {enrichmentResult.improvements.map((improvement, index) => (
                        <li key={index} className="text-sm text-green-700 flex items-start">
                          <Check className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Enhancement Error */}
                {enrichmentError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm text-red-700">Enhancement failed: {enrichmentError}</span>
                    </div>
                    <button 
                      onClick={onEnrichNow}
                      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Upgrade Prompt for Non-authenticated Users */}
                {!isAuthenticated && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-purple-800">Unlock GPT-Powered Enhancement</h5>
                        <p className="text-sm text-purple-600 mt-1">
                          Get AI-enhanced prompts with quality scoring and detailed improvements
                        </p>
                      </div>
                      <button className="btn btn-primary btn-sm">
                        Sign Up Free
                      </button>
                    </div>
                  </div>
                )}
                
                {enrichedPrompt && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      AI-Enhanced & Ready for {currentModel?.name || 'Selected Model'}
                    </span>
                    {hasEnrichment && (
                      <span className="text-purple-600 flex items-center">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Enhanced with AI optimization
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Raw Only View */}
            {viewMode === 'raw' && (
              <div>
                {renderPromptContent(rawPrompt, 'Original Prompt')}
                
                {rawPrompt && (
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      Basic prompt from form input
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Enhancement Benefits */}
            {hasEnrichment && enrichedPrompt && rawPrompt && viewMode !== 'raw' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-medium text-purple-900 mb-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhancement Benefits
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    <span className="text-purple-700">Improved clarity</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    <span className="text-purple-700">Enhanced specificity</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                    <span className="text-purple-700">Better structure</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedPromptPreview 