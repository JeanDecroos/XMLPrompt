import React, { useState } from 'react'
import { Crown, RefreshCw, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SUBSCRIPTION_TIERS } from '../services/subscriptionService'

const SubscriptionStatus = ({ showDetails = false }) => {
  const { 
    user, 
    isPro, 
    subscriptionTier, 
    refreshSubscription, 
    getFeatureLimits 
  } = useAuth()
  
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshSubscription()
    } catch (error) {
      console.error('Failed to refresh subscription:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (!user) return null

  const featureLimits = getFeatureLimits()
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isPro ? (
            <Crown className="w-5 h-5 text-purple-600" />
          ) : (
            <Info className="w-5 h-5 text-gray-500" />
          )}
          <h3 className="font-semibold text-gray-900">
            Subscription Status
          </h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="space-y-3">
        {/* Current Status */}
        <div className="flex items-center space-x-2">
          {isPro ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
          <span className="text-sm">
            <span className="font-medium">Current Plan:</span>{' '}
            <span className={`${isPro ? 'text-purple-600' : 'text-gray-600'}`}>
              {subscriptionTier === SUBSCRIPTION_TIERS.PRO ? 'Pro' : 'Free'}
            </span>
          </span>
        </div>

        {/* User Email */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Account:</span> {user.email}
        </div>

        {showDetails && (
          <>
            {/* Feature Limits */}
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Feature Limits</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Max Tokens:</span>{' '}
                  {featureLimits.maxTokens === -1 ? 'Unlimited' : featureLimits.maxTokens.toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Max Prompts:</span>{' '}
                  {featureLimits.maxPrompts === -1 ? 'Unlimited' : featureLimits.maxPrompts}
                </div>
                <div>
                  <span className="font-medium">Advanced Features:</span>{' '}
                  {featureLimits.advancedFeatures ? 'Enabled' : 'Disabled'}
                </div>
                <div>
                  <span className="font-medium">Priority Support:</span>{' '}
                  {featureLimits.prioritySupport ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            {/* Debug Information */}
            <div className="border-t pt-3 mt-3">
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
              >
                <Info className="w-3 h-3" />
                <span>{showDebugInfo ? 'Hide' : 'Show'} Debug Info</span>
              </button>
              
              {showDebugInfo && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-600">
                  <div><strong>User ID:</strong> {user.id}</div>
                  <div><strong>Is Pro:</strong> {isPro.toString()}</div>
                  <div><strong>Subscription Tier:</strong> {subscriptionTier}</div>
                  <div><strong>User Metadata:</strong></div>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                  {user.app_metadata && Object.keys(user.app_metadata).length > 0 && (
                    <>
                      <div className="mt-2"><strong>App Metadata:</strong></div>
                      <pre className="mt-1 whitespace-pre-wrap">
                        {JSON.stringify(user.app_metadata, null, 2)}
                      </pre>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Pro Status Message */}
        {isPro ? (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Crown className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-purple-800 font-medium">
                Pro features are active
              </span>
            </div>
            <p className="text-xs text-purple-600 mt-1">
              You have access to all premium features including unlimited prompts, 
              advanced AI enhancements, and priority support.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 font-medium">
                Free plan active
              </span>
            </div>
            <p className="text-xs text-yellow-600 mt-1">
              Upgrade to Pro for unlimited prompts, advanced features, and priority support.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionStatus 