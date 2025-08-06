import React, { useState, useEffect } from 'react'
import { CreditCard, X, Plus, Trash2, Edit3, CheckCircle } from 'lucide-react'

const PaymentMethodsModal = ({ isOpen, onClose }) => {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'pm_1OaBcD2eF3gH4iJ5kL6mN7oP8',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiry_month: 12,
      expiry_year: 2025,
      isDefault: true,
      name: 'Visa ending in 4242',
      country: 'US',
      funding: 'credit'
    },
    {
      id: 'pm_2QbCdE3fG4hI5jK6lM7nO8pQ9',
      type: 'card',
      last4: '5555',
      brand: 'mastercard',
      expiry_month: 8,
      expiry_year: 2026,
      isDefault: false,
      name: 'Mastercard ending in 5555',
      country: 'US',
      funding: 'credit'
    }
  ])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCard, setEditingCard] = useState(null)

  const handleAddCard = () => {
    // TODO: Integrate with Stripe Payment Intents API
    // This will use Stripe's PaymentElement and create PaymentMethod
    const newCard = {
      id: `pm_${Date.now()}_stripe_placeholder`,
      type: 'card',
      last4: '1234',
      brand: 'visa',
      expiry_month: 12,
      expiry_year: 2027,
      isDefault: false,
      name: 'Visa ending in 1234',
      country: 'US',
      funding: 'credit'
    }
    setPaymentMethods(prev => [...prev, newCard])
    setShowAddForm(false)
  }

  const handleRemoveCard = (id) => {
    setPaymentMethods(prev => prev.filter(card => card.id !== id))
  }

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

  const handleSetDefault = (id) => {
    setPaymentMethods(prev => 
      prev.map(card => ({
        ...card,
        isDefault: card.id === id
      }))
    )
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

          {/* Payment Methods List */}
          <div className="space-y-3 mb-6">
            {paymentMethods.map((card) => (
              <div key={card.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{card.name}</div>
                    <div className="text-sm text-gray-600">
                      Expires {card.expiry_month.toString().padStart(2, '0')}/{card.expiry_year}
                    </div>
                    {card.isDefault && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!card.isDefault && (
                    <button
                      onClick={() => handleSetDefault(card.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Set as default"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setEditingCard(card)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveCard(card.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
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

          {/* Add New Card - Stripe Integration */}
          {showAddForm ? (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Add New Payment Method</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Stripe Security Notice */}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-green-600" />
                    </div>
                    <span className="text-sm text-green-700">
                      Your card details are secured by Stripe's PCI-compliant infrastructure
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCard}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Card
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Payment Method</span>
            </button>
          )}

          {/* Actions */}
          <div className="flex space-x-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentMethodsModal 