import React, { useState } from 'react'
import { Shield, X, Smartphone, Key, CheckCircle, AlertCircle } from 'lucide-react'

const TwoFactorModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('overview') // overview, setup, verify, complete
  const [qrCode, setQrCode] = useState('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
  const [backupCodes] = useState(['12345678', '87654321', '11111111', '22222222', '33333333', '44444444', '55555555', '66666666'])
  const [verificationCode, setVerificationCode] = useState('')
  const [isEnabled, setIsEnabled] = useState(false)

  const handleSetup = () => {
    setStep('setup')
    // TODO: Generate actual QR code and secret
  }

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      setStep('complete')
      setIsEnabled(true)
    }
  }

  const handleDisable = () => {
    setIsEnabled(false)
    setStep('overview')
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
          
          <button
            onClick={handleDisable}
            className="w-full px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Disable 2FA
          </button>
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
        <p className="text-sm text-gray-500 mt-2">Secret: JBSWY3DPEHPK3PXP</p>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Step 1: Install an Authenticator App</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Smartphone className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">Google Authenticator</div>
              <div className="text-sm text-gray-600">Available on iOS and Android</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Smartphone className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-medium text-gray-900">Authy</div>
              <div className="text-sm text-gray-600">Cross-platform with backup</div>
            </div>
          </div>
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

  const renderComplete = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">2FA Enabled Successfully!</h3>
        <p className="text-gray-600">Your account is now protected with two-factor authentication.</p>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Backup Codes</h4>
        <p className="text-sm text-gray-600">
          Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((code, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg text-center font-mono text-sm">
              {code}
            </div>
          ))}
        </div>
        
        <button className="w-full px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          Download Backup Codes
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Done
      </button>
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

          {/* Content */}
          {step === 'overview' && renderOverview()}
          {step === 'setup' && renderSetup()}
          {step === 'verify' && renderVerify()}
          {step === 'complete' && renderComplete()}
        </div>
      </div>
    </div>
  )
}

export default TwoFactorModal 