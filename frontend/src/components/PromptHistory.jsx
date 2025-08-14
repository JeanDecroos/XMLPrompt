import React, { useState, useEffect } from 'react'
import { X, Clock, Copy, Check, Trash2, Eye, Search, Filter, RefreshCw } from 'lucide-react'
import { PromptService } from '../services/promptService'
import { getModelById } from '../data/aiModels'
import { isAuthEnabled } from '../lib/supabase'

const PromptHistory = ({ isOpen, onClose, onLoadPrompt }) => {
  const [prompts, setPrompts] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadPrompts()
    }
  }, [isOpen])

  const loadPrompts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await PromptService.getUserPrompts()
      if (result.success) {
        setPrompts(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to load prompt history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (promptId) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      const result = await PromptService.deletePrompt(promptId)
      if (result.success) {
        setPrompts(prev => prev.filter(p => p.id !== promptId))
        if (selectedPrompt?.id === promptId) {
          setSelectedPrompt(null)
        }
      } else {
        setError(result.error)
      }
    }
  }

  const handleCopy = async (prompt) => {
    const textToCopy = prompt.enriched_prompt || prompt.raw_prompt || ''
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopiedId(prompt.id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleLoadPrompt = (prompt) => {
    if (onLoadPrompt) {
      const formData = {
        role: prompt.role || '',
        task: prompt.task || '',
        context: prompt.context || '',
        requirements: prompt.requirements || '',
        style: prompt.style || '',
        output: prompt.output || ''
      }
      
      onLoadPrompt({
        formData,
        selectedModel: prompt.selected_model,
        rawPrompt: prompt.raw_prompt,
        enrichedPrompt: prompt.enriched_prompt,
        promptMetadata: prompt.prompt_metadata,
        enrichmentResult: prompt.enrichment_result
      })
      onClose()
    }
  }

  const filteredPrompts = prompts.filter(prompt => 
    prompt.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.task?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] m-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-primary-600" />
                Prompt History
              </h2>
              <p className="text-gray-500 mt-1">
                {isAuthEnabled ? 'Your saved prompts' : 'Locally saved prompts (Demo Mode)'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadPrompts}
                className="btn btn-secondary btn-sm"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 pr-4"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex w-full pt-32">
          {/* Prompt List */}
          <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
            {error && (
              <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                <Clock className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {searchTerm ? 'No matching prompts found' : 'No saved prompts yet'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start creating and saving prompts to see them here'}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`card p-4 cursor-pointer transition-all hover:shadow-lg ${
                      selectedPrompt?.id === prompt.id ? 'ring-2 ring-primary-500 bg-primary-50' : ''
                    }`}
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {prompt.title || 'Untitled Prompt'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {prompt.task || 'No task description'}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500 space-x-3">
                          <span>{formatDate(prompt.created_at)}</span>
                          {prompt.selected_model && (
                            <span className="px-2 py-1 bg-gray-100 rounded">
                              {getModelById(prompt.selected_model)?.name || prompt.selected_model}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopy(prompt)
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy prompt"
                        >
                          {copiedId === prompt.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(prompt.id)
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete prompt"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prompt Detail */}
          <div className="w-1/2 overflow-y-auto">
            {selectedPrompt ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedPrompt.title || 'Untitled Prompt'}
                  </h3>
                  <button
                    onClick={() => handleLoadPrompt(selectedPrompt)}
                    className="btn btn-primary btn-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Load Prompt
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <p className="text-gray-600">{new Date(selectedPrompt.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Model:</span>
                      <p className="text-gray-600">
                        {selectedPrompt.selected_model ? 
                          getModelById(selectedPrompt.selected_model)?.name || selectedPrompt.selected_model :
                          'Not specified'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Form Data */}
                  {selectedPrompt.role && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Role</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPrompt.role}</p>
                    </div>
                  )}

                  {selectedPrompt.task && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Task</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPrompt.task}</p>
                    </div>
                  )}

                  {selectedPrompt.context && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Context</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedPrompt.context}</p>
                    </div>
                  )}

                  {/* Generated Prompt */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Generated Prompt</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 overflow-x-auto">
                        {selectedPrompt.enriched_prompt || selectedPrompt.raw_prompt || 'No prompt content'}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center p-8">
                <div>
                  <Eye className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Select a prompt to view details</h3>
                  <p className="text-gray-500">Click on any prompt from the list to see its full content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptHistory 