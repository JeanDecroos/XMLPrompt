import React, { useState, useEffect } from 'react'
import { X, Shield, Eye, EyeOff, Download, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import UserSettingsService from '../../services/userSettingsService'
import DataRetentionService from '../../services/dataRetentionService'

const PrivacyModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [settings, setSettings] = useState({
    // Data retention policy
    dataRetentionPolicy: 'standard',
    
    // Privacy controls
    dataAnalyticsOptOut: false,
    marketingOptOut: false,
    dataExportConsent: false,
    dataProcessingConsent: false,
    
    // GDPR controls
    gdprConsentGiven: false,
    rightToBeForgottenRequested: false,
    dataPortabilityRequested: false
  })

  useEffect(() => {
    if (isOpen) {
      loadPrivacySettings()
    }
  }, [isOpen])

  const loadPrivacySettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const userSettings = await UserSettingsService.getUserSettings()
      
      setSettings({
        dataRetentionPolicy: userSettings.data_retention_policy || 'standard',
        dataAnalyticsOptOut: userSettings.data_analytics_opt_out || false,
        marketingOptOut: userSettings.marketing_opt_out || false,
        dataExportConsent: userSettings.data_export_consent || false,
        dataProcessingConsent: userSettings.data_processing_consent || false,
        gdprConsentGiven: !!userSettings.gdpr_consent_given_at,
        rightToBeForgottenRequested: userSettings.right_to_be_forgotten_requested || false,
        dataPortabilityRequested: userSettings.data_portability_requested || false
      })
      setHasChanges(false)
    } catch (error) {
      console.error('Error loading privacy settings:', error)
      setError('Failed to load privacy settings. Using defaults.')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
    setHasChanges(true)
    setError(null)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      await UserSettingsService.updatePreferences({
        dataRetentionPolicy: settings.dataRetentionPolicy,
        dataAnalyticsOptOut: settings.dataAnalyticsOptOut,
        marketingOptOut: settings.marketingOptOut,
        dataExportConsent: settings.dataExportConsent,
        dataProcessingConsent: settings.dataProcessingConsent,
        gdprConsentGiven: settings.gdprConsentGiven ? new Date().toISOString() : null,
        rightToBeForgottenRequested: settings.rightToBeForgottenRequested,
        dataPortabilityRequested: settings.dataPortabilityRequested
      })

      setSuccess(true)
      setHasChanges(false)
      
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (error) {
      console.error('Error saving privacy settings:', error)
      setError('Failed to save privacy settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDataDeletion = async () => {
    if (!window.confirm('Are you sure you want to delete all your data? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const { data: { user } } = await import('../../lib/supabase').then(m => m.supabase.auth.getUser())
      if (!user) {
        throw new Error('User not authenticated')
      }

      const results = await DataRetentionService.deleteUserData(user.id)
      console.log('Data deletion results:', results)
      
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error) {
      console.error('Error deleting user data:', error)
      setError('Failed to delete user data. Please contact support.')
    } finally {
      setLoading(false)
    }
  }

  const handleDataExport = () => {
    // This would trigger the export modal
    onClose()
    // You could emit an event or use a callback to open the export modal
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Privacy & Data Settings</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Control your data privacy and retention</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 dark:text-gray-300" />
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && (
            <div className="space-y-6">
              {/* Data Retention Policy */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Retention Policy</h3>
                <div className="space-y-3">
                  {[
                    { value: 'minimal', label: 'Minimal', desc: 'Keep only essential data for account management' },
                    { value: 'standard', label: 'Standard', desc: 'Keep data for 12 months, then anonymize' },
                    { value: 'extended', label: 'Extended', desc: 'Keep data for 24 months before cleanup' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="retentionPolicy"
                        value={option.value}
                        checked={settings.dataRetentionPolicy === option.value}
                        onChange={(e) => handleSettingChange('dataRetentionPolicy', e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Privacy Controls */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Privacy Controls</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Data Analytics</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Allow us to analyze usage patterns to improve the service</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('dataAnalyticsOptOut', !settings.dataAnalyticsOptOut)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        !settings.dataAnalyticsOptOut ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          !settings.dataAnalyticsOptOut ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <EyeOff className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Marketing Communications</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive promotional emails and updates</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSettingChange('marketingOptOut', !settings.marketingOptOut)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        !settings.marketingOptOut ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          !settings.marketingOptOut ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* GDPR Rights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Your Rights</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">GDPR Compliance</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          You have the right to access, rectify, and delete your personal data. You can also request data portability and object to data processing.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleDataExport}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export My Data</span>
                    </button>
                    <button
                      onClick={handleDataDeletion}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{loading ? 'Deleting...' : 'Delete All Data'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Consent Management */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Consent Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Data Processing Consent</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">I consent to the processing of my personal data</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('dataProcessingConsent', !settings.dataProcessingConsent)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.dataProcessingConsent ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.dataProcessingConsent ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Data Export Consent</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">I consent to data export functionality</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('dataExportConsent', !settings.dataExportConsent)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.dataExportConsent ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.dataExportConsent ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-red-700 dark:text-red-300 font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                      {settings.rightToBeForgottenRequested ? 'Data deletion completed successfully!' : 'Privacy settings saved successfully!'}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PrivacyModal 