import React, { useState, useEffect } from 'react'
import { X, Share2, Copy, Check, Globe, Lock, Eye, Calendar, Link2, Settings, Users, Download, QrCode } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const SharePromptModal = ({ isOpen, onClose, prompt, onShare }) => {
  const { user, isPro } = useAuth()
  const [shareData, setShareData] = useState({
    title: '',
    description: '',
    isPublic: false,
    requirePassword: false,
    password: '',
    expiresIn: '',
    allowDownload: true,
    maxViews: null
  })
  const [shareResult, setShareResult] = useState(null)
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('settings')
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && prompt) {
      setShareData(prev => ({
        ...prev,
        title: prompt.title || 'Untitled Prompt',
        description: prompt.description || ''
      }))
      setShareResult(null)
      setError(null)
    }
  }, [isOpen, prompt])

  const handleShare = async () => {
    if (!prompt) return
    
    setIsSharing(true)
    setError(null)
    
    try {
      const result = await onShare({
        promptId: prompt.id,
        ...shareData
      })
      
      if (result.success) {
        setShareResult(result.data)
        setActiveTab('share')
      } else {
        setError(result.error || 'Failed to create share link')
      }
    } catch (err) {
      setError('Failed to create share link')
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareResult?.shareUrl) return
    
    try {
      await navigator.clipboard.writeText(shareResult.shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const expirationOptions = [
    { value: '', label: 'Never expires' },
    { value: '1h', label: '1 hour' },
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] m-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Share Prompt</h2>
                <p className="text-blue-100 text-sm">Make your prompt accessible to others</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4 mr-2 inline" />
                Settings
              </button>
              {shareResult && (
                <button
                  onClick={() => setActiveTab('share')}
                  className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'share'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Link2 className="w-4 h-4 mr-2 inline" />
                  Share Link
                </button>
              )}
            </div>
          </div>

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share Title
                  </label>
                  <input
                    type="text"
                    value={shareData.title}
                    onChange={(e) => setShareData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Give your shared prompt a title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={shareData.description}
                    onChange={(e) => setShareData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Describe what this prompt does"
                  />
                </div>
              </div>

              {/* Privacy Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Privacy & Access
                </h3>
                
                <div className="space-y-4">
                  {/* Public/Private Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        shareData.isPublic ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {shareData.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {shareData.isPublic ? 'Public' : 'Private'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {shareData.isPublic 
                            ? 'Anyone with the link can access' 
                            : 'Only people with the link can access'
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShareData(prev => ({ ...prev, isPublic: !prev.isPublic }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        shareData.isPublic ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        shareData.isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Password Protection */}
                  {isPro && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Lock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Password Protection</span>
                          <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            Pro
                          </span>
                        </div>
                        <button
                          onClick={() => setShareData(prev => ({ ...prev, requirePassword: !prev.requirePassword }))}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            shareData.requirePassword ? 'bg-purple-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            shareData.requirePassword ? 'translate-x-5' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      {shareData.requirePassword && (
                        <input
                          type="password"
                          value={shareData.password}
                          onChange={(e) => setShareData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Enter password"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Options
                </h3>
                
                <div className="space-y-4">
                  {/* Expiration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 mr-1 inline" />
                      Expiration
                    </label>
                    <select
                      value={shareData.expiresIn}
                      onChange={(e) => setShareData(prev => ({ ...prev, expiresIn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    >
                      {expirationOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Max Views */}
                  {isPro && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Eye className="w-4 h-4 mr-1 inline" />
                        View Limit
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full ml-2">
                          Pro
                        </span>
                      </label>
                      <input
                        type="number"
                        value={shareData.maxViews || ''}
                        onChange={(e) => setShareData(prev => ({ 
                          ...prev, 
                          maxViews: e.target.value ? parseInt(e.target.value) : null 
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        placeholder="Unlimited"
                        min="1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty for unlimited views
                      </p>
                    </div>
                  )}

                  {/* Allow Download */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Allow Download</span>
                    </div>
                    <button
                      onClick={() => setShareData(prev => ({ ...prev, allowDownload: !prev.allowDownload }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        shareData.allowDownload ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        shareData.allowDownload ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShare}
                  disabled={isSharing || !shareData.title.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                >
                  {isSharing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Link...
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Create Share Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Share Link Tab */}
          {activeTab === 'share' && shareResult && (
            <div className="p-6 space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="text-green-800 font-medium">Share link created successfully!</p>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Your prompt is now accessible via the link below.
                </p>
              </div>

              {/* Share URL */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Share URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareResult.shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
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
                </div>
              </div>

              {/* Share Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Share Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibility:</span>
                    <span className="font-medium">
                      {shareData.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  {shareData.requirePassword && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Password Protected:</span>
                      <span className="font-medium text-purple-600">Yes</span>
                    </div>
                  )}
                  {shareResult.expiresAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expires:</span>
                      <span className="font-medium">
                        {new Date(shareResult.expiresAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {shareData.maxViews && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">View Limit:</span>
                      <span className="font-medium">{shareData.maxViews} views</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Sharing Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Quick Share</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const text = `Check out this AI prompt: ${shareData.title}`
                      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareResult.shareUrl)}`
                      window.open(url, '_blank')
                    }}
                    className="flex items-center justify-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Twitter
                  </button>
                  <button
                    onClick={() => {
                      const text = `Check out this AI prompt: ${shareData.title} ${shareResult.shareUrl}`
                      const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareResult.shareUrl)}`
                      window.open(url, '_blank')
                    }}
                    className="flex items-center justify-center px-4 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    LinkedIn
                  </button>
                </div>
              </div>

              {/* Done Button */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SharePromptModal 