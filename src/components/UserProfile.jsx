import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUnlockedAchievements, getXP, getLevel, getXPProgress, ACHIEVEMENTS } from '../data/achievements'
import { User, Flame, Award, ChevronRight } from 'lucide-react'

const ROLE_ICONS = {
  developer: '💻',
  storyteller: '📖',
  researcher: '🔬',
  marketer: '📈',
  designer: '🎨',
  // Add more as needed
}

export default function UserProfile({ stats }) {
  const { user } = useAuth()
  if (!user) return null

  // Fallback stats for demo/testing
  const demoStats = {
    promptsCreated: 12,
    rolesExplored: ['developer', 'storyteller', 'researcher'],
    streak: 4,
    promptsShared: 2,
  }
  const s = stats || demoStats

  const xp = getXP(s)
  const level = getLevel(xp)
  const xpProgress = getXPProgress(xp)
  const unlocked = getUnlockedAchievements(s)

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-lg mx-auto mt-8">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-2xl text-white font-bold">
          {user.email?.charAt(0).toUpperCase() || <User />}
        </div>
        <div>
          <div className="text-lg font-semibold text-gray-900">{user.email?.split('@')[0]}</div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Level {level}</span>
            <span className="text-xs text-gray-500">XP: {xp}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Level {level}</span>
          <span>Next: {100 - Math.floor(xpProgress * 100)} XP</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${xpProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Badges & Achievements */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <Award className="w-5 h-5 text-yellow-500 mr-2" />
          <span className="font-medium text-gray-800">Achievements</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {unlocked.length === 0 && <span className="text-xs text-gray-400">No achievements yet</span>}
          {unlocked.map(a => (
            <div key={a.id} className="flex items-center px-2 py-1 bg-gradient-to-r from-yellow-100 to-pink-100 rounded-full text-xs font-medium shadow-sm">
              <span className="mr-1">{a.icon}</span> {a.name}
            </div>
          ))}
        </div>
        <button className="mt-2 text-xs text-blue-600 hover:underline flex items-center">
          See all achievements <ChevronRight className="w-3 h-3 ml-1" />
        </button>
      </div>

      {/* Streak & Roles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Flame className={`w-5 h-5 ${s.streak >= 3 ? 'text-orange-500 animate-pulse' : 'text-gray-400'}`} />
          <span className="text-xs text-gray-700">Streak: {s.streak} days</span>
        </div>
        <div className="flex items-center space-x-1">
          {Object.keys(ROLE_ICONS).map(role => (
            <span
              key={role}
              className={`text-lg ${s.rolesExplored.includes(role) ? '' : 'opacity-30 grayscale'}`}
              title={role.charAt(0).toUpperCase() + role.slice(1)}
            >
              {ROLE_ICONS[role]}
            </span>
          ))}
          <span className="ml-2 text-xs text-gray-500">Roles</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
        <div>
          <div className="font-bold text-gray-900 text-base">{s.promptsCreated}</div>
          Prompts
        </div>
        <div>
          <div className="font-bold text-gray-900 text-base">{s.promptsShared}</div>
          Shared
        </div>
        <div>
          <div className="font-bold text-gray-900 text-base">{s.rolesExplored.length}</div>
          Roles
        </div>
      </div>
    </div>
  )
} 