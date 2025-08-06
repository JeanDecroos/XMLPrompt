import React from 'react'
import { Download, X, FileText, Calendar, DollarSign, CheckCircle } from 'lucide-react'

const BillingHistoryModal = ({ isOpen, onClose }) => {
  // Mock billing history data
  const billingHistory = [
    {
      id: 1,
      date: '2024-01-15',
      amount: 3.00,
      currency: 'EUR',
      status: 'paid',
      description: 'Premium Plan - January 2024',
      invoiceNumber: 'INV-2024-001'
    },
    {
      id: 2,
      date: '2023-12-15',
      amount: 3.00,
      currency: 'EUR',
      status: 'paid',
      description: 'Premium Plan - December 2023',
      invoiceNumber: 'INV-2023-012'
    },
    {
      id: 3,
      date: '2023-11-15',
      amount: 3.00,
      currency: 'EUR',
      status: 'paid',
      description: 'Premium Plan - November 2023',
      invoiceNumber: 'INV-2023-011'
    },
    {
      id: 4,
      date: '2023-10-15',
      amount: 3.00,
      currency: 'EUR',
      status: 'paid',
      description: 'Premium Plan - October 2023',
      invoiceNumber: 'INV-2023-010'
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
                      {invoice.currency} {invoice.amount.toFixed(2)}
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