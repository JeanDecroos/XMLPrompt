import React, { useState, useEffect } from 'react'
import { Bell, X, Check, AlertCircle } from 'lucide-react'
import UserSettingsService from '../../services/userSettingsService'

const NotificationsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    email: true,
    promptReminders: true,
    usageAlerts: false,
    securityAlerts: true,
    marketingEmails: false,
    weeklyDigest: true
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Load settings from database on mount
  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const userSettings = await UserSettingsService.getUserSettings()
      if (userSettings.notifications) {
        setSettings(userSettings.notifications)
      }
    } catch (err) {
      console.error('Failed to load notification settings:', err)
      setError('Failed to load settings. Using defaults.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    
    try {
      await UserSettingsService.updateNotificationSettings(settings)
      console.log('Notification settings saved successfully')
      onClose()
    } catch (err) {
      console.error('Failed to save notification settings:', err)
      setError('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">Manage your notification preferences</p>
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
          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Email Notifications</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Email Notifications</div>
                    <div className="text-sm text-gray-600">Receive notifications via email</div>
                  </div>
                  <button
                    onClick={() => handleToggle('email')}
                    disabled={loading}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.email ? 'bg-blue-600' : 'bg-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.email ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Prompt Reminders</div>
                    <div className="text-sm text-gray-600">Reminders about saved prompts</div>
                  </div>
                  <button
                    onClick={() => handleToggle('promptReminders')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.promptReminders ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.promptReminders ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Usage Alerts</div>
                    <div className="text-sm text-gray-600">When approaching usage limits</div>
                  </div>
                  <button
                    onClick={() => handleToggle('usageAlerts')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.usageAlerts ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.usageAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Security Alerts</div>
                    <div className="text-sm text-gray-600">Important security notifications</div>
                  </div>
                  <button
                    onClick={() => handleToggle('securityAlerts')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.securityAlerts ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Marketing Emails</div>
                    <div className="text-sm text-gray-600">Product updates and promotions</div>
                  </div>
                  <button
                    onClick={() => handleToggle('marketingEmails')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.marketingEmails ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Weekly Digest</div>
                    <div className="text-sm text-gray-600">Summary of your activity</div>
                  </div>
                  <button
                    onClick={() => handleToggle('weeklyDigest')}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.weeklyDigest ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.weeklyDigest ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 mt-8">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationsModal 