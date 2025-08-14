import React, { useEffect, useState } from 'react'
import { CreditCard, X } from 'lucide-react'

const PaymentMethodsModal = ({ isOpen, onClose }) => {

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

  // Stripe will be the only payment method (cards processed via Stripe)
  const [setupIntent, setSetupIntent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const requestSetupIntent = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/v1/stripe/setup-intent', { method: 'POST' })
      const json = await res.json()
      if (!json?.success) throw new Error(json?.error || 'Failed to create setup intent')
      setSetupIntent(json.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
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
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment Methods</h2>
                <p className="text-sm text-gray-600">Manage your payment options</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stripe as sole payment provider */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Stripe</div>
                  <div className="text-sm text-gray-600">We accept debit/credit cards via Stripe only.</div>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">Secure</span>
            </div>
          </div>

          {/* Stripe Integration Notice */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CreditCard className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-blue-900">Stripe Payment Processing</div>
                <div className="text-sm text-blue-700 mt-1">
                  Payment methods are processed securely through Stripe. All card information is encrypted and never stored on our servers.
                </div>
              </div>
            </div>
          </div>

          {/* Add Card via Stripe (placeholder until integration) */}
          <button
            onClick={requestSetupIntent}
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            title="Generate Stripe setup intent"
          >
            <CreditCard className="w-4 h-4" />
            <span>{loading ? 'Preparing…' : (setupIntent ? 'Setup Intent Ready' : 'Add card via Stripe')}</span>
          </button>

          {setupIntent && (
            <div className="mt-3 text-xs text-gray-500 break-all">
              Client secret (placeholder): {setupIntent.clientSecret}
            </div>
          )}

          {error && (
            <div className="mt-3 text-sm text-red-600">{error}</div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/v1/stripe/checkout-session', { method: 'POST' })
                  const json = await res.json()
                  if (json?.data?.url) window.location.href = json.data.url
                } catch {}
              }}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Checkout (Stripe)
            </button>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/v1/stripe/billing-portal', { method: 'POST' })
                  const json = await res.json()
                  if (json?.data?.url) window.location.href = json.data.url
                } catch {}
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Manage Billing (Stripe)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodsModal 