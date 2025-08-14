import React, { useState, useEffect } from 'react'
import { Globe, X, Shield, Eye, EyeOff } from 'lucide-react'

const PrivacyModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    promptSharing: 'friends',
    dataAnalytics: true,
    thirdPartySharing: false,
    searchVisibility: true
  })

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = () => {
    // TODO: Save privacy settings to backend
    console.log('Saving privacy settings:', settings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
                <p className="text-sm text-gray-600">Control your data and visibility</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Settings */}
          <div className="space-y-6">
            {/* Profile Visibility */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Profile Visibility</h3>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', desc: 'Anyone can see your profile' },
                  { value: 'friends', label: 'Friends Only', desc: 'Only your connections can see' },
                  { value: 'private', label: 'Private', desc: 'Only you can see your profile' }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value={option.value}
                      checked={settings.profileVisibility === option.value}
                      onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Prompt Sharing */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Prompt Sharing</h3>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', desc: 'Anyone can see your prompts' },
                  { value: 'friends', label: 'Friends Only', desc: 'Only your connections can see' },
                  { value: 'private', label: 'Private', desc: 'Only you can see your prompts' }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="promptSharing"
                      value={option.value}
                      checked={settings.promptSharing === option.value}
                      onChange={(e) => setSettings(prev => ({ ...prev, promptSharing: e.target.value }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Data Settings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Data & Analytics</h3>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Data Analytics</div>
                  <div className="text-sm text-gray-600">Help improve our service with usage data</div>
                </div>
                <button
                  onClick={() => handleToggle('dataAnalytics')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.dataAnalytics ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.dataAnalytics ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Third-party Sharing</div>
                  <div className="text-sm text-gray-600">Share data with trusted partners</div>
                </div>
                <button
                  onClick={() => handleToggle('thirdPartySharing')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.thirdPartySharing ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.thirdPartySharing ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">Search Visibility</div>
                  <div className="text-sm text-gray-600">Allow others to find your profile</div>
                </div>
                <button
                  onClick={() => handleToggle('searchVisibility')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.searchVisibility ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.searchVisibility ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyModal 