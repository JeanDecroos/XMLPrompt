import React, { useState, useEffect } from 'react'
import { Shield, X, Smartphone, Key, CheckCircle, AlertCircle, Download, RefreshCw, Eye, EyeOff } from 'lucide-react'
import MFAService from '../../services/mfaService'
import { useAuth } from '../../contexts/AuthContext'

const TwoFactorModal = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [step, setStep] = useState('overview') // overview, setup, verify, complete, manage
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [backupCodes, setBackupCodes] = useState([])
  const [verificationCode, setVerificationCode] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showSecret, setShowSecret] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  // Load 2FA status on mount
  useEffect(() => {
    if (isOpen && user) {
      load2FAStatus()
    }
  }, [isOpen, user])

  const load2FAStatus = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const status = await MFAService.get2FAStatus(user.id)
      setIsEnabled(status.enabled)
      setBackupCodes(status.backupCodes)
    } catch (err) {
      console.error('Failed to load 2FA status:', err)
      setError('Failed to load 2FA status')
    } finally {
      setLoading(false)
    }
  }

  const handleSetup = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { secret: newSecret, qrCodeUrl, backupCodes: newBackupCodes } = await MFAService.generateTOTPSecret(user.id, user.email)
      setSecret(newSecret)
      setQrCode(qrCodeUrl)
      setBackupCodes(newBackupCodes)
      setStep('setup')
    } catch (err) {
      console.error('Failed to generate TOTP secret:', err)
      setError('Failed to generate setup codes')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!MFAService.validateTOTPCode(verificationCode)) {
      setError('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      await MFAService.verifyTOTPCode(verificationCode, secret)
      await MFAService.enable2FA(user.id, secret, backupCodes)
      setIsEnabled(true)
      setStep('complete')
    } catch (err) {
      console.error('Failed to verify code:', err)
      setError('Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await MFAService.disable2FA(user.id)
      setIsEnabled(false)
      setStep('overview')
    } catch (err) {
      console.error('Failed to disable 2FA:', err)
      setError('Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateNewBackupCodes = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { backupCodes: newBackupCodes } = await MFAService.generateNewBackupCodes(user.id)
      setBackupCodes(newBackupCodes)
      setShowBackupCodes(true)
    } catch (err) {
      console.error('Failed to generate new backup codes:', err)
      setError('Failed to generate new backup codes')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadBackupCodes = () => {
    MFAService.downloadBackupCodes(backupCodes, user.email)
  }

  if (!isOpen) return null

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
        <p className="text-gray-600">
          {isEnabled 
            ? '2FA is currently enabled for your account.' 
            : 'Add an extra layer of security to your account.'
          }
        </p>
      </div>

              {isEnabled ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">2FA is Active</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your account is protected with two-factor authentication.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setStep('manage')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage 2FA Settings
              </button>
              
              <button
                onClick={handleDisable}
                className="w-full px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Disable 2FA
              </button>
            </div>
          </div>
        ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Security Recommendation</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              Enable 2FA to protect your account from unauthorized access.
            </p>
          </div>
          
          <button
            onClick={handleSetup}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable 2FA
          </button>
        </div>
      )}
    </div>
  )

  const renderSetup = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Up 2FA</h3>
        <p className="text-gray-600">Scan the QR code with your authenticator app.</p>
      </div>

      <div className="text-center">
        <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
          <img src={qrCode} alt="QR Code" className="w-48 h-48" />
        </div>
        
        {/* Secret Key */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-sm font-medium text-gray-700">Secret Key</div>
              <div className="text-xs text-gray-500">Enter this manually if QR code doesn't work</div>
            </div>
            <button
              onClick={() => setShowSecret(!showSecret)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {showSecret && (
            <div className="mt-2 flex items-center space-x-2">
              <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                {secret}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(secret)}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Step 1: Install an Authenticator App</h4>
        <div className="space-y-2">
          {MFAService.getAuthenticatorApps().map((app, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">{app.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{app.name}</div>
                <div className="text-sm text-gray-600">{app.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {app.platforms.join(', ')}
                </div>
              </div>
              <a
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Step 2: Scan QR Code</h4>
        <p className="text-sm text-gray-600">
          Open your authenticator app and scan the QR code above, or manually enter the secret key.
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('overview')}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep('verify')}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )

  const renderVerify = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Setup</h3>
        <p className="text-gray-600">Enter the 6-digit code from your authenticator app.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={6}
          />
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-900">Important</div>
              <div className="text-sm text-yellow-700 mt-1">
                Make sure to save your backup codes. You'll need them if you lose access to your authenticator app.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('setup')}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleVerify}
          disabled={verificationCode.length !== 6}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Verify
        </button>
      </div>
    </div>
  )

  const renderManage = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">2FA Management</h3>
        <p className="text-sm text-blue-700">
          Manage your two-factor authentication settings and backup codes.
        </p>
      </div>
      
      {/* Backup Codes Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Backup Codes</h4>
            <p className="text-sm text-gray-600">
              {backupCodes.length} codes remaining
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBackupCodes(!showBackupCodes)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              {showBackupCodes ? 'Hide' : 'Show'} Codes
            </button>
            <button
              onClick={handleDownloadBackupCodes}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>Download</span>
            </button>
          </div>
        </div>
        
        {showBackupCodes && (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-white border rounded text-center font-mono text-sm">
                  {code}
                </div>
              ))}
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              Each code can only be used once. Generate new codes if you run out.
            </p>
          </div>
        )}
        
        <button
          onClick={handleGenerateNewBackupCodes}
          disabled={loading}
          className="w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Generate New Backup Codes</span>
            </>
          )}
        </button>
      </div>
      
      {/* Security Info */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Security Information</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 2FA is enabled for your account</li>
          <li>• Backup codes provide emergency access</li>
          <li>• Each backup code can only be used once</li>
          <li>• Keep backup codes in a secure location</li>
        </ul>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setStep('overview')}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  )

  const renderComplete = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">2FA Setup Complete!</h3>
        <p className="text-gray-600">
          Your account is now protected with two-factor authentication.
        </p>
      </div>
      
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2">Backup Codes</h4>
        <p className="text-sm text-yellow-700 mb-3">
          Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <div key={index} className="p-2 bg-white border rounded text-center font-mono text-sm">
              {code}
            </div>
          ))}
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleDownloadBackupCodes}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Codes</span>
          </button>
          <button
            onClick={() => setStep('manage')}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Manage 2FA
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-600">Secure your account</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-blue-600">Loading...</span>
              </div>
            </div>
          )}

          {/* Content */}
          {step === 'overview' && renderOverview()}
          {step === 'setup' && renderSetup()}
          {step === 'verify' && renderVerify()}
          {step === 'complete' && renderComplete()}
          {step === 'manage' && renderManage()}
        </div>
      </div>
    </div>
  )
}

export default TwoFactorModal 