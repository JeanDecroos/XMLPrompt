import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { SubscriptionService, SUBSCRIPTION_TIERS } from '../services/subscriptionService'
import PlanBillingCard from './profile/PlanBillingCard'
import SecurityCard from './profile/SecurityCard'
import RecentActivityCard from './profile/RecentActivityCard'
import QuickActions from './profile/QuickActions'
import { 
  User, Settings, CreditCard, 
  BarChart3, Shield, Download, Calendar, Zap, Edit3, Camera,
  CheckCircle, AlertCircle, RefreshCw, LogOut, Bell, Globe, ChevronRight, Crown, Sparkles
} from 'lucide-react'

// Import settings modals
import NotificationsModal from './settings/NotificationsModal'
import PrivacyModal from './settings/PrivacyModal'
import ExportDataModal from './settings/ExportDataModal'
import TwoFactorModal from './settings/TwoFactorModal'
import LoginHistoryModal from './settings/LoginHistoryModal'
import PaymentMethodsModal from './settings/PaymentMethodsModal'
import BillingHistoryModal from './settings/BillingHistoryModal'

export default function UserProfile({ stats }) {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.email?.split('@')[0] || '')
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState(SUBSCRIPTION_TIERS.FREE)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Modal states
  const [notificationsModal, setNotificationsModal] = useState(false)
  const [privacyModal, setPrivacyModal] = useState(false)
  const [exportDataModal, setExportDataModal] = useState(false)
  const [twoFactorModal, setTwoFactorModal] = useState(false)
  const [loginHistoryModal, setLoginHistoryModal] = useState(false)
  const [paymentMethodsModal, setPaymentMethodsModal] = useState(false)
  const [billingHistoryModal, setBillingHistoryModal] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      if (user) {
        try {
          const tier = await SubscriptionService.getSubscriptionTier(user)
          const proStatus = await SubscriptionService.isProUser(user)
          setSubscriptionTier(tier)
          setIsPro(proStatus)
        } catch (error) {
          console.error('Error checking subscription:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    checkSubscription()
  }, [user])

  if (!user) return null

  // Fallback stats for demo/testing
  const demoStats = {
    promptsCreated: 12,
    promptsShared: 2,
    tokensUsed: 15420,
    modelsUsed: ['claude-3-5-sonnet', 'gpt-4o', 'gemini-2.5-pro'],
    monthlyUsage: {
      prompts: 12,
      tokens: 15420,
      enrichments: 8
    }
  }
  const s = stats || demoStats

  const handleSaveProfile = () => {
    // TODO: Save profile changes to database
    setIsEditing(false)
  }

  const getPlanDisplayName = (tier) => {
    switch (tier) {
      case SUBSCRIPTION_TIERS.PRO:
        return 'Premium'
      case SUBSCRIPTION_TIERS.ENTERPRISE:
        return 'Enterprise'
      default:
        return 'Free'
    }
  }

  const getPlanColor = (tier) => {
    switch (tier) {
      case SUBSCRIPTION_TIERS.PRO:
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case SUBSCRIPTION_TIERS.ENTERPRISE:
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  // Data now wired via hooks inside child components

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl text-white font-bold">
            {user.email?.charAt(0).toUpperCase() || <User />}
          </div>
          <button 
            onClick={() => setShowAvatarUpload(true)}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50"
          >
            <Camera className="w-3 h-3 text-gray-600" />
          </button>
        </div>
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-lg font-semibold bg-gray-50 border border-gray-200 rounded px-2 py-1 w-full"
              />
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-semibold text-gray-900">{displayName}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          )}
        </div>
        <button
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEditing ? <CheckCircle className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          <span>{isEditing ? 'Save' : 'Edit'}</span>
        </button>
      </div>

      {/* Account Status */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Account Status</h3>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-800">Active</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getPlanColor(subscriptionTier)}`}>
            {loading ? 'Loading...' : getPlanDisplayName(subscriptionTier)} Plan
          </div>
        </div>
        
        {/* Call to Action for Free Users */}
        {!loading && !isPro && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="w-5 h-5" />
                  <h4 className="font-semibold">Upgrade to Premium</h4>
                </div>
                <p className="text-sm text-purple-100 mb-3">
                  Get unlimited prompts, advanced AI enhancements, and priority support
                </p>
                <div className="flex items-center space-x-2 text-xs text-purple-200">
                  <Sparkles className="w-3 h-3" />
                  <span>Premium — coming soon</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">Pricing TBA</div>
                <div className="text-xs text-purple-200">in development</div>
                <button className="mt-2 px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors">
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{s.promptsCreated}</div>
          <div className="text-xs text-gray-600">Prompts</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{s.promptsShared}</div>
          <div className="text-xs text-gray-600">Shared</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{s.modelsUsed.length}</div>
          <div className="text-xs text-gray-600">Models Used</div>
        </div>
      </div>

      {/* Plan & Billing + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlanBillingCard />
        <SecurityCard />
      </div>

      {/* Recent Activity */}
      <RecentActivityCard />

      {/* Quick Actions */}
      <QuickActions isTopTier={isPro} />
    </div>
  )

  const renderUsage = () => (
    <div className="space-y-6">
      {/* Monthly Usage Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">This Month</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{s.monthlyUsage.prompts}</div>
            <div className="text-xs text-gray-600">Prompts Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{s.monthlyUsage.tokens.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Tokens Used</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">{s.monthlyUsage.enrichments}</div>
            <div className="text-xs text-gray-600">Enrichments</div>
          </div>
        </div>
      </div>

      {/* Models Used */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">AI Models Used</h3>
        <div className="space-y-2">
          {s.modelsUsed.map(model => (
            <div key={model} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">{model}</span>
              <Zap className="w-4 h-4 text-yellow-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Usage Limits */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Usage Limits</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Token Usage</span>
            <span className="text-sm font-medium">{s.tokensUsed.toLocaleString()} / 4,000</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${Math.min((s.tokensUsed / 4000) * 100, 100)}%` }}
            />
          </div>
          {!isPro && (
            <div className="text-xs text-gray-500 text-center">
              Upgrade to Premium for unlimited tokens
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Account Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Account Settings</h3>
        <div className="space-y-3">
          <button 
            onClick={() => setNotificationsModal(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={() => setPrivacyModal(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Privacy Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={() => setExportDataModal(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Export Data</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Security</h3>
        <div className="space-y-3">
          <button 
            onClick={() => setTwoFactorModal(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Two-Factor Authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-red-600">Not enabled</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
          <button 
            onClick={() => setLoginHistoryModal(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Login History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Billing */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Billing & Subscription</h3>
        <div className="space-y-3">
          <button 
            onClick={() => setPaymentMethodsModal(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Payment Methods</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button 
            onClick={() => setBillingHistoryModal(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Billing History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={signOut}
        className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
      >
        <LogOut className="w-5 h-5" />
        <span className="text-sm font-medium">Sign Out</span>
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-gray-100 rounded-lg p-2 mb-8">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-3 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'usage' && renderUsage()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Settings Modals */}
      <NotificationsModal 
        isOpen={notificationsModal} 
        onClose={() => setNotificationsModal(false)} 
      />
      <PrivacyModal 
        isOpen={privacyModal} 
        onClose={() => setPrivacyModal(false)} 
      />
      <ExportDataModal 
        isOpen={exportDataModal} 
        onClose={() => setExportDataModal(false)} 
      />
      <TwoFactorModal 
        isOpen={twoFactorModal} 
        onClose={() => setTwoFactorModal(false)} 
      />
      <LoginHistoryModal 
        isOpen={loginHistoryModal} 
        onClose={() => setLoginHistoryModal(false)} 
      />
      <PaymentMethodsModal 
        isOpen={paymentMethodsModal} 
        onClose={() => setPaymentMethodsModal(false)} 
      />
      <BillingHistoryModal 
        isOpen={billingHistoryModal} 
        onClose={() => setBillingHistoryModal(false)} 
      />
    </div>
  )
} 