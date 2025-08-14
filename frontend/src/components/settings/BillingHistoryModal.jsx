import React, { useEffect } from 'react'
import { Download, X, FileText, Calendar, DollarSign, CheckCircle } from 'lucide-react'

const BillingHistoryModal = ({ isOpen, onClose }) => {
  // Mock Stripe billing history data
  const billingHistory = [
    {
      id: 'in_1OaBcD2eF3gH4iJ5kL6mN7oP8',
      date: '2024-01-15',
      amount: 300, // Stripe amounts are in cents
      currency: 'eur',
      status: 'paid',
      description: 'Premium Plan - January 2024',
      invoiceNumber: 'INV-2024-001',
      stripeInvoiceId: 'in_1OaBcD2eF3gH4iJ5kL6mN7oP8',
      subscriptionId: 'sub_1OaBcD2eF3gH4iJ5kL6mN7oP8',
      paymentMethod: 'pm_1OaBcD2eF3gH4iJ5kL6mN7oP8'
    },
    {
      id: 'in_2QbCdE3fG4hI5jK6lM7nO8pQ9',
      date: '2023-12-15',
      amount: 300,
      currency: 'eur',
      status: 'paid',
      description: 'Premium Plan - December 2023',
      invoiceNumber: 'INV-2023-012',
      stripeInvoiceId: 'in_2QbCdE3fG4hI5jK6lM7nO8pQ9',
      subscriptionId: 'sub_2QbCdE3fG4hI5jK6lM7nO8pQ9',
      paymentMethod: 'pm_2QbCdE3fG4hI5jK6lM7nO8pQ9'
    },
    {
      id: 'in_3RcDeF4gH5iJ6kL7mN8oP9qR0',
      date: '2023-11-15',
      amount: 300,
      currency: 'eur',
      status: 'paid',
      description: 'Premium Plan - November 2023',
      invoiceNumber: 'INV-2023-011',
      stripeInvoiceId: 'in_3RcDeF4gH5iJ6kL7mN8oP9qR0',
      subscriptionId: 'sub_3RcDeF4gH5iJ6kL7mN8oP9qR0',
      paymentMethod: 'pm_3RcDeF4gH5iJ6kL7mN8oP9qR0'
    },
    {
      id: 'in_4SdEfG5hI6jK7lM8nO9pQ0rS1',
      date: '2023-10-15',
      amount: 300,
      currency: 'eur',
      status: 'paid',
      description: 'Premium Plan - October 2023',
      invoiceNumber: 'INV-2023-010',
      stripeInvoiceId: 'in_4SdEfG5hI6jK7lM8nO9pQ0rS1',
      subscriptionId: 'sub_4SdEfG5hI6jK7lM8nO9pQ0rS1',
      paymentMethod: 'pm_4SdEfG5hI6jK7lM8nO9pQ0rS1'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const handleDownloadInvoice = (invoice) => {
    // TODO: Implement actual invoice download
    console.log('Downloading invoice:', invoice.invoiceNumber)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Billing History</h2>
                <p className="text-sm text-gray-600">View and download invoices</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">€12.00</div>
              <div className="text-sm text-blue-700">Total Paid</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-green-700">Invoices</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">€3.00</div>
              <div className="text-sm text-purple-700">Monthly</div>
            </div>
          </div>

          {/* Stripe Integration Notice */}
          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Download className="w-3 h-3 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-blue-900">Stripe Billing</div>
                <div className="text-sm text-blue-700 mt-1">
                  All billing is processed securely through Stripe. Invoices are generated automatically and can be downloaded as PDF.
                </div>
              </div>
            </div>
          </div>

          {/* Billing History List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
            
            {billingHistory.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900">{invoice.description}</div>
                    <div className="text-sm text-gray-600">
                      {invoice.invoiceNumber} • {formatDate(invoice.date)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {(invoice.amount / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusText(invoice.status)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleDownloadInvoice(invoice)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download Invoice"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-900">Billing Information</div>
                <div className="text-sm text-blue-700 mt-1">
                  Invoices are generated monthly on the 15th. You can download PDF copies of all invoices.
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Download All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingHistoryModal 