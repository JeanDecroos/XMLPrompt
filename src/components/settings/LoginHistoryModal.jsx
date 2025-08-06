import React from 'react'
import { Calendar, X, Monitor, Smartphone, Globe, AlertTriangle } from 'lucide-react'

const LoginHistoryModal = ({ isOpen, onClose }) => {
  // Mock login history data
  const loginHistory = [
    {
      id: 1,
      date: '2024-01-15T10:30:00Z',
      device: 'Chrome on MacBook Pro',
      location: 'Amsterdam, Netherlands',
      ip: '192.168.1.100',
      status: 'success',
      icon: Monitor
    },
    {
      id: 2,
      date: '2024-01-14T15:45:00Z',
      device: 'Safari on iPhone',
      location: 'Amsterdam, Netherlands',
      ip: '192.168.1.101',
      status: 'success',
      icon: Smartphone
    },
    {
      id: 3,
      date: '2024-01-13T09:20:00Z',
      device: 'Firefox on Windows',
      location: 'Unknown',
      ip: '203.0.113.1',
      status: 'suspicious',
      icon: Globe
    },
    {
      id: 4,
      date: '2024-01-12T14:15:00Z',
      device: 'Chrome on MacBook Pro',
      location: 'Amsterdam, Netherlands',
      ip: '192.168.1.100',
      status: 'success',
      icon: Monitor
    },
    {
      id: 5,
      date: '2024-01-11T11:30:00Z',
      device: 'Chrome on MacBook Pro',
      location: 'Amsterdam, Netherlands',
      ip: '192.168.1.100',
      status: 'success',
      icon: Monitor
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50'
      case 'suspicious':
        return 'text-yellow-600 bg-yellow-50'
      case 'failed':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Successful'
      case 'suspicious':
        return 'Suspicious'
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Login History</h2>
                <p className="text-sm text-gray-600">Recent account activity</p>
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
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">4</div>
              <div className="text-sm text-green-700">Successful</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">1</div>
              <div className="text-sm text-yellow-700">Suspicious</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">5</div>
              <div className="text-sm text-gray-700">Total</div>
            </div>
          </div>

          {/* Login History List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Recent Logins</h3>
            
            {loginHistory.map((login) => {
              const Icon = login.icon
              return (
                <div key={login.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{login.device}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(login.status)}`}>
                        {getStatusText(login.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {login.location} • {login.ip}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(login.date)}
                    </div>
                  </div>
                  
                  {login.status === 'suspicious' && (
                    <button className="flex-shrink-0 p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })}
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
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginHistoryModal 