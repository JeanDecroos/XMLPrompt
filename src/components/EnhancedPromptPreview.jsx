import React, { useState } from 'react'
import { Copy, Check, Eye, Code, AlertCircle, ArrowRight, Sparkles, FileText } from 'lucide-react'

const EnhancedPromptPreview = ({ 
  rawPrompt, 
  enrichedPrompt, 
  isValid, 
  errors, 
  isEnriching, 
  hasEnrichment 
}) => {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState('comparison') // 'comparison', 'enriched', 'raw'
  const [activeTab, setActiveTab] = useState('enriched')

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

  const renderPromptContent = (prompt, title, showCopy = true) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 flex items-center">
          {title === 'Enriched Prompt' ? (
            <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
          ) : (
            <FileText className="w-4 h-4 mr-2 text-gray-600" />
          )}
          {title}
        </h4>
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
        <div className="text-xs text-gray-500">
          {prompt.split('\n').length} lines • {prompt.length} characters
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Generated Prompts
        </h3>
        
        {isValid && (hasEnrichment || enrichedPrompt) && (
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'comparison'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowRight className="w-4 h-4 mr-1 inline" />
              Compare
            </button>
            <button
              onClick={() => setViewMode('enriched')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'enriched'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4 mr-1 inline" />
              Enriched
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'raw'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Code className="w-4 h-4 mr-1 inline" />
              Original
            </button>
          </div>
        )}
      </div>

      <div className="min-h-[400px]">
        {!isValid ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              Complete the form to generate prompts
            </h4>
            <p className="text-gray-500 max-w-md">
              Fill in the required fields (Role and Task Description) to see your generated prompts here.
            </p>
            {errors.length > 0 && (
              <div className="mt-4 text-sm text-red-600">
                Missing: {errors.join(', ')}
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
              <div>
                {renderPromptContent(enrichedPrompt, 'Enriched Prompt')}
                
                {enrichedPrompt && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      AI-Enhanced & Ready for Claude Sonnet
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