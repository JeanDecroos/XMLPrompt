import React, { useState, useEffect } from 'react'
import { Eye, Copy, Check, Download, Lock, Globe, User, Calendar, ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const SharedPromptViewer = ({ shareId, onBack }) => {
  const { user, isAuthenticated } = useAuth()
  const [promptData, setPromptData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requiresPassword, setRequiresPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showFullPrompt, setShowFullPrompt] = useState(false)

  useEffect(() => {
    if (shareId) {
      loadSharedPrompt()
    }
  }, [shareId])

  const loadSharedPrompt = async () => {
    setLoading(true)
    setError(null)
    setPasswordError('')
    
    try {
      const headers = {
        'Content-Type': 'application/json'
      }
      
      // Add password if provided
      if (password) {
        headers['X-Share-Password'] = password
      }
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/v1/sharing/${shareId}`, {
        method: 'GET',
        headers
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setPromptData(result.data)
        setRequiresPassword(false)
      } else if (response.status === 401 && result.error?.includes('password')) {
        setRequiresPassword(true)
        setPasswordError('Password required to access this shared prompt')
      } else if (response.status === 403 && result.error?.includes('password')) {
        setRequiresPassword(true)
        setPasswordError('Incorrect password')
      } else if (response.status === 404) {
        setError('Shared prompt not found or has expired')
      } else if (response.status === 410) {
        setError('This shared prompt has expired')
      } else {
        setError(result.error || 'Failed to load shared prompt')
      }
    } catch (err) {
      setError('Failed to load shared prompt')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (password.trim()) {
      loadSharedPrompt()
    }
  }

  const handleCopy = async () => {
    if (!promptData?.content) return
    
    try {
      await navigator.clipboard.writeText(promptData.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    if (!promptData?.content) return
    
    const blob = new Blob([promptData.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${promptData.title || 'shared-prompt'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncatePrompt = (content, maxLength = 300) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared prompt...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Prompt</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Required</h2>
              <p className="text-gray-600">This shared prompt is password protected</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
                {passwordError && (
                  <p className="text-red-600 text-sm mt-2">{passwordError}</p>
                )}
              </div>
              
              <div className="flex space-x-3">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!password.trim()}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Access Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (!promptData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{promptData.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {promptData.author}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(promptData.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {promptData.viewCount} views
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
              
              <button
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Description */}
          {promptData.description && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700">{promptData.description}</p>
            </div>
          )}
          
          {/* Prompt Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Prompt Content</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{promptData.content.split('\n').length} lines</span>
                <span>•</span>
                <span>{promptData.content.length} characters</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800 overflow-x-auto">
                {showFullPrompt ? promptData.content : truncatePrompt(promptData.content)}
              </pre>
              
              {promptData.content.length > 300 && (
                <button
                  onClick={() => setShowFullPrompt(!showFullPrompt)}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showFullPrompt ? 'Show Less' : 'Show Full Prompt'}
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  Shared via XMLPrompter
                </span>
              </div>
              
              <a
                href="/"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Create your own prompts
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center">
            <h3 className="text-xl font-bold mb-2">Want to create prompts like this?</h3>
            <p className="text-blue-100 mb-4">
              Join XMLPrompter to build, enhance, and share your own AI prompts
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              Get Started Free
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default SharedPromptViewer 