import React, { useState, useEffect } from 'react'
import { X, Palette, Monitor, Sun, Moon, Sparkles, Check, AlertCircle } from 'lucide-react'
import UserSettingsService from '../../services/userSettingsService'
import { useBackground } from '../../contexts/BackgroundContext'
import { useTheme } from '../../contexts/ThemeContext'

const AppearanceModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    theme: 'light',
    backgroundAnimation: true
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const { backgroundAnimation, updateBackgroundPreference } = useBackground()
  const { theme, updateTheme } = useTheme()

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const userSettings = await UserSettingsService.getUserSettings()
      setSettings({
        theme: theme, // Use context value
        backgroundAnimation: backgroundAnimation // Use context value
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      setError('Failed to load settings. Using defaults.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      // Update background animation preference
      await updateBackgroundPreference(settings.backgroundAnimation)
      
      // Update theme preference
      await updateTheme(settings.theme)
      
      setSuccess(true)
      setHasChanges(false)
      
      // Close modal after showing success message
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('Failed to save settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackgroundToggle = () => {
    setSettings(prev => ({
      ...prev,
      backgroundAnimation: !prev.backgroundAnimation
    }))
    setHasChanges(true)
    setError(null)
  }

  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }))
    setHasChanges(true)
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Palette className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Appearance Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Theme Selection */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Theme</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.theme === 'light'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Sun className="w-6 h-6 text-yellow-500" />
                  <span className="font-semibold text-gray-900">Light</span>
                </div>
              </button>
              <button
                onClick={() => handleThemeChange('dark')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Moon className="w-6 h-6 text-blue-500" />
                  <span className="font-semibold text-gray-900">Dark</span>
                </div>
              </button>
            </div>
          </div>

          {/* Background Animation */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Background</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">Dynamic Background</p>
                    <p className="text-base text-gray-700">Animated gradient with scroll acceleration</p>
                  </div>
                </div>
                <button
                  onClick={handleBackgroundToggle}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    settings.backgroundAnimation ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      settings.backgroundAnimation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {!settings.backgroundAnimation && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-base text-blue-800 font-medium">
                    <strong>Static background enabled:</strong> You'll see a clean, solid background without animations.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Preview</h3>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-base text-gray-700 mb-3 font-medium">Current setting:</div>
              <div className="flex items-center space-x-3">
                {settings.backgroundAnimation ? (
                  <>
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-gray-900 text-lg">Dynamic animated background</span>
                  </>
                ) : (
                  <>
                    <Monitor className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-900 text-lg">Static background</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="px-6 pb-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-base text-green-700 font-medium">Settings saved successfully!</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-6 pb-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-base text-red-700 font-medium">{error}</span>
              </div>
            </div>
          </div>
        )}

        {/* Changes Indicator */}
        {hasChanges && !loading && (
          <div className="px-6 pb-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="text-base text-blue-700 font-medium">You have unsaved changes</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-col space-y-3 p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 hover:text-gray-900 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          
          <button
            onClick={() => {
              setSettings({
                theme: 'light',
                backgroundAnimation: true
              })
              setHasChanges(true)
              setError(null)
            }}
            disabled={loading}
            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}

export default AppearanceModal 