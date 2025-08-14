import React, { useState, useEffect } from 'react'
import { AlertCircle, TrendingUp, Zap, Clock, Shield, Crown, ArrowUpCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const QuotaDisplay = ({ className = '', showUpgradePrompt = true }) => {
  const { user, isPro } = useAuth()
  const [quotaInfo, setQuotaInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchQuotaInfo()
    }
  }, [user])

  const fetchQuotaInfo = async () => {
    try {
      setLoading(true)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/v1/quota`, {
        headers: {
          'Authorization': `Bearer ${user.accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch quota information')
      }

      const data = await response.json()
      setQuotaInfo(data.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null
  if (loading) return <QuotaSkeleton />
  if (error) return <QuotaError error={error} onRetry={fetchQuotaInfo} />

  const { tier, limits, usage, remaining, resetDates, features } = quotaInfo

  // Calculate usage percentages
  const getUsagePercentage = (used, limit) => {
    if (!limit) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const promptsPercentage = getUsagePercentage(usage.monthly.prompts, limits.monthlyPrompts)
  const enrichmentsPercentage = getUsagePercentage(usage.monthly.enrichments, limits.monthlyEnrichments)
  const apiCallsPercentage = getUsagePercentage(usage.dailyApi, limits.dailyApiCalls)

  // Determine status colors
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-50 border-red-200'
    if (percentage >= 75) return 'text-orange-600 bg-orange-50 border-orange-200'
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-orange-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tier Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {tier === 'pro' || tier === 'enterprise' ? (
            <Crown className="w-5 h-5 text-yellow-500" />
          ) : (
            <Shield className="w-5 h-5 text-gray-500" />
          )}
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            tier === 'pro' || tier === 'enterprise'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
          </span>
        </div>
        
        {showUpgradePrompt && tier === 'free' && (
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="flex items-center space-x-1 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Upgrade</span>
          </button>
        )}
      </div>

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly Prompts */}
        <div className={`p-4 rounded-lg border ${getStatusColor(promptsPercentage)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Monthly Prompts</span>
            </div>
            <span className="text-xs">
              {usage.monthly.prompts} / {limits.monthlyPrompts}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(promptsPercentage)}`}
              style={{ width: `${promptsPercentage}%` }}
            />
          </div>
          <p className="text-xs mt-1">
            {remaining.monthlyPrompts} remaining
          </p>
        </div>

        {/* Monthly Enhancements */}
        <div className={`p-4 rounded-lg border ${getStatusColor(enrichmentsPercentage)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">AI Enhancements</span>
            </div>
            <span className="text-xs">
              {usage.monthly.enrichments} / {limits.monthlyEnrichments}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(enrichmentsPercentage)}`}
              style={{ width: `${enrichmentsPercentage}%` }}
            />
          </div>
          <p className="text-xs mt-1">
            {remaining.monthlyEnrichments} remaining
          </p>
        </div>

        {/* Daily API Calls */}
        <div className={`p-4 rounded-lg border ${getStatusColor(apiCallsPercentage)}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Daily API</span>
            </div>
            <span className="text-xs">
              {usage.dailyApi} / {limits.dailyApiCalls}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(apiCallsPercentage)}`}
              style={{ width: `${apiCallsPercentage}%` }}
            />
          </div>
          <p className="text-xs mt-1">
            {remaining.dailyApiCalls} remaining today
          </p>
        </div>
      </div>

      {/* Reset Information */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-4">
          <span>Monthly reset: {new Date(resetDates.monthly).toLocaleDateString()}</span>
          <span>•</span>
          <span>Daily reset: {new Date(resetDates.daily).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Feature Access */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Feature Access</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`flex items-center space-x-2 ${features.promptSharing ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${features.promptSharing ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Prompt Sharing</span>
          </div>
          <div className={`flex items-center space-x-2 ${features.apiAccess ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${features.apiAccess ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>API Access</span>
          </div>
          <div className={`flex items-center space-x-2 ${features.advancedAnalytics ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${features.advancedAnalytics ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Advanced Analytics</span>
          </div>
          <div className={`flex items-center space-x-2 ${features.prioritySupport ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-2 h-2 rounded-full ${features.prioritySupport ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span>Priority Support</span>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt for Free Users */}
      {tier === 'free' && showUpgradePrompt && (promptsPercentage > 75 || enrichmentsPercentage > 75) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Running low on quota
              </h4>
              <p className="text-sm text-blue-800 mb-3">
                You're approaching your monthly limits. Upgrade to Pro for 10x more prompts and unlimited AI enhancements.
              </p>
              <button 
                onClick={() => window.location.href = '/pricing'}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Crown className="w-4 h-4" />
                <span>Upgrade to Pro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Loading skeleton component
const QuotaSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-6 bg-gray-200 rounded w-24"></div>
      <div className="h-6 bg-gray-200 rounded w-20"></div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 border rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-2 bg-gray-200 rounded w-full mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  </div>
)

// Error component
const QuotaError = ({ error, onRetry }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center space-x-2 text-red-600">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm font-medium">Failed to load quota information</span>
    </div>
    <p className="text-sm text-red-600 mt-1">{error}</p>
    <button 
      onClick={onRetry}
      className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
    >
      Try again
    </button>
  </div>
)

export default QuotaDisplay 