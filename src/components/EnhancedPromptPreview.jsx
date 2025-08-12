import React, { useState } from 'react'
import { Copy, Check, Eye, Code, AlertCircle, ArrowRight, Sparkles, FileText, Settings, Zap, Save, Clock, Share2 } from 'lucide-react'
import { getModelById, PROMPT_FORMATS } from '../data/aiModels'
import { downloadString } from '../utils/download'
import { PromptService } from '../services/promptService'
import SharePromptModal from './SharePromptModal'
import SharingService from '../services/sharingService'

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
  onOpenHistory,
  savedPrompt,
  hasEnhancedCurrentInputs
}) => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState(hasEnrichment ? 'enriched' : 'raw')
  
  // Auto-switch to enhanced tab when enrichment completes
  React.useEffect(() => {
    if (hasEnrichment && enrichedPrompt) {
      console.log('🔄 Auto-switching to enriched tab', { hasEnrichment, enrichedPrompt: !!enrichedPrompt })
      setActiveTab('enriched')
    }
  }, [hasEnrichment, enrichedPrompt])
  
  // Initialize tab to enhanced when component receives enhanced prompt
  React.useEffect(() => {
    if (enrichedPrompt && !rawPrompt) {
      setActiveTab('enriched')
    } else if (enrichedPrompt && rawPrompt) {
      setActiveTab('enriched') // Default to enhanced when both exist
    }
  }, [enrichedPrompt, rawPrompt])
  

  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  
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

  const handleShare = async (shareData) => {
    if (!savedPrompt?.id) {
      setSaveError('Please save the prompt first before sharing')
      setTimeout(() => setSaveError(null), 5000)
      return { success: false, error: 'Please save the prompt first' }
    }

    setShareLoading(true)
    
    try {
      const result = await SharingService.createShare({
        promptId: savedPrompt.id,
        title: shareData.title,
        description: shareData.description,
        isPublic: shareData.isPublic,
        requirePassword: shareData.requirePassword,
        password: shareData.password,
        expiresIn: shareData.expiresIn,
        maxViews: shareData.maxViews,
        allowDownload: shareData.allowDownload
      })
      
      return result
    } catch (error) {
      return { success: false, error: 'Failed to create share' }
    } finally {
      setShareLoading(false)
    }
  }

  const renderPromptContent = (prompt, isEnhanced = false) => {
    const [exportFormat, setExportFormat] = useState('txt')

    const resolveExportPayload = (format) => {
      // Prefer enriched prompt when present
      const preferred = (enrichedPrompt || rawPrompt || '')

      // Some generators may return objects; current code passes strings.
      // If we ever receive an object, preserve it for JSON; otherwise wrap.
      if (format === 'json') {
        if (typeof preferred === 'string') {
          return JSON.stringify({ prompt: preferred }, null, 2)
        }
        try {
          return JSON.stringify(preferred, null, 2)
        } catch {
          return JSON.stringify({ prompt: String(preferred) }, null, 2)
        }
      }
      // Non-JSON: export the visible text content
      return typeof preferred === 'string' ? preferred : String(preferred)
    }

    const handleExport = () => {
      const map = {
        txt: { ext: 'txt', mime: 'text/plain;charset=utf-8' },
        json: { ext: 'json', mime: 'application/json;charset=utf-8' },
        xml: { ext: 'xml', mime: 'application/xml;charset=utf-8' },
        yaml: { ext: 'yaml', mime: 'text/yaml;charset=utf-8' },
        md: { ext: 'md', mime: 'text/markdown;charset=utf-8' },
      }
      const metaTitle = (typeof promptMetadata?.title === 'string' && promptMetadata.title.trim()) ? promptMetadata.title.trim() : 'prompt'
      const { ext, mime } = map[exportFormat] || map.txt
      const payload = resolveExportPayload(exportFormat)
      downloadString(payload, `${metaTitle}.${ext}`, mime)
    }

    return (
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 min-h-[320px]">
          {prompt ? (
            <div className="relative">
              {isEnhanced && (
                <div className="absolute top-2 right-2 z-10">
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Enhanced
                  </span>
                </div>
              )}
              <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 overflow-x-auto">
                <code className="language-xml">{prompt}</code>
              </pre>
            </div>
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
              
              {/* Export controls */}
              <label htmlFor="export-format" className="sr-only">Choose export format</label>
              <select
                id="export-format"
                aria-label="Export format"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="border border-gray-300 rounded-md text-sm px-2 py-1 bg-white"
              >
                <option value="txt">.txt</option>
                <option value="json">.json</option>
                <option value="xml">.xml</option>
                <option value="yaml">.yaml</option>
                <option value="md">.md</option>
              </select>
              <button
                onClick={handleExport}
                aria-label="Export prompt"
                className="btn btn-secondary btn-sm"
                title="Download the current prompt"
              >
                <Save className="w-4 h-4 mr-1" />
                Export
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

              {isAuthenticated && savedPrompt?.id && (
                <button
                  onClick={() => setShowShareModal(true)}
                  disabled={shareLoading}
                  className="btn btn-secondary btn-sm"
                  title="Share this prompt"
                >
                  {shareLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-1"></div>
                      Sharing...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </>
                  )}
                </button>
              )}
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-600" />
            Generated Prompts
            {enrichedPrompt && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                ✨ Enhanced
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-700 mt-1">
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
              {!hasEnrichment && (
                <button
                  onClick={onEnrichNow}
                  disabled={!onEnrichNow || hasEnhancedCurrentInputs}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
                  title={hasEnhancedCurrentInputs ? 'Already enhanced - edit inputs to enhance again' : 'Enhance this prompt'}
                >
                  {hasEnhancedCurrentInputs ? (
                    <>
                      <Check className="w-4 h-4 mr-1 inline" />
                      Enhanced
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1 inline" />
                      Enhance Prompt
                    </>
                  )}
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

      {/* Tab Navigation - Only show when we have both raw and enhanced prompts */}
      {rawPrompt && enrichedPrompt && hasEnrichment && (
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
        </div>
      )}

      {/* Content */}
      {enrichedPrompt ? (
        // ALWAYS show enhanced prompt when available
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Enhanced XML Prompt from OpenAI
            </span>
            <span className="text-xs text-gray-500">
              {enrichedPrompt.length} characters
            </span>
          </div>
          {renderPromptContent(enrichedPrompt, true)}
        </div>
      ) : rawPrompt ? (
        // Show raw prompt when no enhancement is available
        <div>
          <div className="mb-3">
            <span className="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full flex items-center">
              <FileText className="w-3 h-3 mr-1" />
              Basic Prompt
            </span>
          </div>
          {renderPromptContent(rawPrompt)}
        </div>
      ) : (
        // Empty state when no prompt is generated
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-700 mb-2">
            Complete the form to generate a prompt
          </h4>
          <p className="text-gray-500 max-w-md">
            Fill in the required fields (Role and Task Description) to see your generated prompt here.
          </p>
          {validation.errors && validation.errors.length > 0 && (
            <div className="mt-4 text-sm text-red-600">
              Missing: {validation.errors.join(', ')}
            </div>
          )}
        </div>
      )}



      {/* Enhancement Results */}
      {hasEnrichment && enrichmentResult && (enrichedPrompt || activeTab === 'enriched') && (
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



      {/* Share Modal */}
      <SharePromptModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        prompt={savedPrompt}
        onShare={handleShare}
      />
    </div>
  )
}

export default EnhancedPromptPreview 