import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUnlockedAchievements, getXP, getLevel, getXPProgress, ACHIEVEMENTS } from '../data/achievements'
import { 
  User, Flame, Award, ChevronRight, Crown, Settings, CreditCard, 
  BarChart3, Shield, Download, Calendar, Zap, Edit3, Camera,
  CheckCircle, AlertCircle, RefreshCw, LogOut, Bell, Globe
} from 'lucide-react'

const ROLE_ICONS = {
  developer: '💻',
  storyteller: '📖',
  researcher: '🔬',
  marketer: '📈',
  designer: '🎨',
}

export default function UserProfile({ stats }) {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user?.email?.split('@')[0] || '')
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)

  if (!user) return null

  // Fallback stats for demo/testing
  const demoStats = {
    promptsCreated: 12,
    rolesExplored: ['developer', 'storyteller', 'researcher'],
    streak: 4,
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

  const xp = getXP(s)
  const level = getLevel(xp)
  const xpProgress = getXPProgress(xp)
  const unlocked = getUnlockedAchievements(s)

  const handleSaveProfile = () => {
    // TODO: Save profile changes to database
    setIsEditing(false)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

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

      {/* Level & Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">Level {level}</span>
          </div>
          <span className="text-sm text-gray-600">{xp} XP</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {100 - Math.floor(xpProgress * 100)} XP to next level
        </div>
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
          <div className="text-2xl font-bold text-gray-900">{s.streak}</div>
          <div className="text-xs text-gray-600">Day Streak</div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Recent Achievements</h3>
          <button className="text-sm text-blue-600 hover:underline">View All</button>
        </div>
        <div className="space-y-2">
          {unlocked.slice(0, 3).map(achievement => (
            <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
              <span className="text-lg">{achievement.icon}</span>
              <div>
                <div className="font-medium text-gray-900">{achievement.name}</div>
                <div className="text-xs text-gray-600">{achievement.description}</div>
              </div>
            </div>
          ))}
          {unlocked.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <Award className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <div className="text-sm">No achievements yet</div>
              <div className="text-xs">Start creating prompts to earn achievements!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderUsage = () => (
    <div className="space-y-6">
      {/* Monthly Usage Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">This Month</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{s.monthlyUsage.prompts}</div>
            <div className="text-xs text-gray-600">Prompts Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{s.monthlyUsage.tokens.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Tokens Used</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{s.monthlyUsage.enrichments}</div>
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
        </div>
      </div>
    </div>
  )

  const renderAchievements = () => (
    <div className="space-y-6">
      {/* Achievement Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Achievement Progress</h3>
        <div className="space-y-3">
          {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = achievement.check(s)
            return (
              <div key={achievement.id} className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isUnlocked ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <span className="text-sm">{achievement.icon}</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{achievement.name}</div>
                  <div className="text-xs text-gray-600">{achievement.description}</div>
                </div>
                {isUnlocked ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Role Exploration */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Role Exploration</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROLE_ICONS).map(([role, icon]) => (
            <div
              key={role}
              className={`p-2 rounded-lg border ${
                s.rolesExplored.includes(role)
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="text-lg">{icon}</div>
              <div className="text-xs text-gray-600 mt-1 capitalize">{role}</div>
            </div>
          ))}
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
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Notifications</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Privacy Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
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
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Two-Factor Authentication</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-red-600">Not enabled</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
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
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">Payment Methods</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
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
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
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
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  )
} 