import React, { useState, useEffect } from 'react'
import { Download, X, FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import ExportService from '../../services/exportService'

const ExportDataModal = ({ isOpen, onClose }) => {
  const [selectedData, setSelectedData] = useState({
    prompts: true,
    usage: true,
    profile: true,
    settings: false
  })
  const [format, setFormat] = useState('json')
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [error, setError] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Load export preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      loadExportPreferences()
    }
  }, [isOpen])

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

  const loadExportPreferences = async () => {
    try {
      const preferences = await ExportService.getExportPreferences()
      setSelectedData({
        prompts: preferences.include_prompts !== false,
        usage: preferences.include_usage !== false,
        profile: preferences.include_profile !== false,
        settings: preferences.include_settings === true
      })
      setFormat(preferences.format || 'json')
      setHasChanges(false)
      setError(null)
    } catch (error) {
      console.error('Error loading export preferences:', error)
      setError('Failed to load export preferences. Using defaults.')
    }
  }

  const handleToggle = (key) => {
    setSelectedData(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setHasChanges(true)
    setError(null)
  }

  const handleFormatChange = (newFormat) => {
    setFormat(newFormat)
    setHasChanges(true)
    setError(null)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setError(null)
      
      // Check if at least one data type is selected
      if (Object.values(selectedData).every(v => !v)) {
        throw new Error('Please select at least one data type to export.')
      }

      // Perform the actual export
      const exportResult = await ExportService.exportUserData(selectedData, format)
      
      // Download the file
      ExportService.downloadFile(
        exportResult.data,
        exportResult.filename,
        exportResult.mimeType
      )
      
      setIsExporting(false)
      setExportComplete(true)
      setHasChanges(false)
      
      // Reset after showing completion
      setTimeout(() => {
        setExportComplete(false)
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Export failed:', error)
      setError(error.message || 'Export failed. Please try again.')
      setIsExporting(false)
    }
  }

  if (!isOpen) return null

  if (exportComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Export Complete!</h2>
          <p className="text-gray-600 mb-4">Your data has been prepared for download.</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Export Data</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Download your data and settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 dark:text-gray-300" />
            </button>
          </div>

          {/* Data Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Select Data to Export</h3>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedData.prompts}
                  onChange={() => handleToggle('prompts')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Prompts & Templates</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">All your created and saved prompts</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedData.usage}
                  onChange={() => handleToggle('usage')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Usage History</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Your activity and usage statistics</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedData.profile}
                  onChange={() => handleToggle('profile')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Profile Data</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Account information and preferences</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedData.settings}
                  onChange={() => handleToggle('settings')}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">Settings</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Notification and privacy settings</div>
                </div>
              </label>
            </div>
          </div>

          {/* Format Selection */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Export Format</h3>
            <div className="space-y-2">
              {[
                { value: 'json', label: 'JSON', desc: 'Machine-readable format' },
                { value: 'csv', label: 'CSV', desc: 'Spreadsheet compatible' },
                { value: 'zip', label: 'ZIP Archive', desc: 'Compressed files' }
              ].map(option => (
                <label key={option.value} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={option.value}
                    checked={format === option.value}
                    onChange={() => handleFormatChange(option.value)}
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

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Export Information</div>
                <div className="text-sm text-blue-700 mt-1">
                  Your data will be prepared and available for download. Large exports may take a few minutes to process.
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3 mt-8">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isExporting}
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || Object.values(selectedData).every(v => !v)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Preparing...
                  </>
                ) : (
                  'Export Data'
                )}
              </button>
            </div>
            
            <button
              onClick={() => {
                setSelectedData({
                  prompts: true,
                  usage: true,
                  profile: true,
                  settings: false
                })
                setFormat('json')
                setHasChanges(true)
                setError(null)
              }}
              disabled={isExporting}
              className="w-full px-4 py-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExportDataModal 