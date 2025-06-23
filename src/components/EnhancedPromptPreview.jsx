import React, { useState } from 'react'
import { Copy, Check, Eye, Code, AlertCircle, ArrowRight, Sparkles, FileText, Settings, Zap, Save, Clock } from 'lucide-react'
import { getModelById, PROMPT_FORMATS } from '../data/aiModels'
import { PromptService } from '../services/promptService'

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
  isPro,
  formData,
  onOpenHistory
}) => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(hasEnrichment ? 'enriched' : 'raw')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [saveError, setSaveError] = useState(null)
  
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

  const handleSave = async () => {
    if (!validation.isValid) {
      setSaveError('Please complete the required fields before saving')
      setTimeout(() => setSaveError(null), 3000)
      return
    }

    setSaving(true)
    setSaveError(null)
    setSaveMessage(null)

    try {
      const promptData = PromptService.formatPromptForSaving(
        formData,
        rawPrompt,
        enrichedPrompt,
        selectedModel,
        promptMetadata,
        enrichmentResult
      )

      const result = await PromptService.savePrompt(promptData)
      
      if (result.success) {
        setSaveMessage(result.message)
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveError(result.message || 'Failed to save prompt')
        setTimeout(() => setSaveError(null), 3000)
      }
    } catch (error) {
      setSaveError('An unexpected error occurred while saving')
      setTimeout(() => setSaveError(null), 3000)
    } finally {
      setSaving(false)
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopy(prompt)}
                className="btn btn-secondary btn-sm"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving || !validation.isValid}
                className="btn btn-primary btn-sm"
                title={!validation.isValid ? 'Complete required fields to save' : 'Save this prompt'}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </>
                )}
              </button>
            </div>
            
            <div className="text-sm text-gray-500">
              {prompt.split('\n').length} lines • {prompt.length} characters
            </div>
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
        
        <div className="flex items-center space-x-2">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="btn btn-secondary btn-sm"
            >
              <Clock className="w-4 h-4 mr-1" />
              History
            </button>
          )}
          
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
      </div>

      {/* Save/Error Messages */}
      {saveMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Check className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-sm text-green-700">{saveMessage}</span>
          </div>
        </div>
      )}

      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-700">{saveError}</span>
          </div>
        </div>
      )}

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
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-1" />
            Enhancement Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {enrichmentResult.qualityScore && (
              <div>
                <span className="text-blue-700 font-medium">Quality Score:</span>
                <p className="text-blue-800">{enrichmentResult.qualityScore}/10</p>
              </div>
            )}
            {enrichmentResult.improvements && (
              <div>
                <span className="text-blue-700 font-medium">Improvements:</span>
                <p className="text-blue-800">{enrichmentResult.improvements.length} applied</p>
              </div>
            )}
            {enrichmentResult.estimatedTokens && (
              <div>
                <span className="text-blue-700 font-medium">Est. Tokens:</span>
                <p className="text-blue-800">{enrichmentResult.estimatedTokens}</p>
              </div>
            )}
          </div>
          {enrichmentResult.improvements && enrichmentResult.improvements.length > 0 && (
            <div className="mt-3">
              <span className="text-blue-700 font-medium text-sm">Applied Improvements:</span>
              <ul className="mt-1 text-sm text-blue-800 space-y-1">
                {enrichmentResult.improvements.slice(0, 3).map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    {improvement}
                  </li>
                ))}
                {enrichmentResult.improvements.length > 3 && (
                  <li className="text-blue-600 text-xs">
                    +{enrichmentResult.improvements.length - 3} more improvements
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!validation.isValid && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            Complete the form to generate a prompt
          </h4>
          <p className="text-gray-500 max-w-md">
            Fill in the required fields (Role and Task Description) to see your generated prompt here.
          </p>
          {validation.errors.length > 0 && (
            <div className="mt-4 text-sm text-red-600">
              Missing: {validation.errors.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default EnhancedPromptPreview 