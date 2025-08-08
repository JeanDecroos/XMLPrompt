import React from 'react'

export default function SecurityCard({ security, onToggle2FA, onRevokeSession }) {
  const handleToggle = () => onToggle2FA(!security?.twoFactorEnabled)

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        <button
          onClick={handleToggle}
          className={`px-3 py-1.5 rounded-md text-sm font-medium ${security?.twoFactorEnabled ? 'bg-green-600 text-white' : 'bg-gray-900 text-white'}`}
        >
          {security?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        <div>2FA Status: <span className={`font-medium ${security?.twoFactorEnabled ? 'text-green-700' : 'text-gray-800'}`}>{security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}</span></div>
        <div>Member since: {security?.memberSince ? new Date(security.memberSince).toLocaleDateString() : '—'}</div>
        <div>Last active: {security?.lastActive ? new Date(security.lastActive).toLocaleString() : '—'}</div>
      </div>

      {Array.isArray(security?.sessions) && security.sessions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Active sessions</h4>
          <ul className="divide-y divide-gray-200">
            {security.sessions.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900">{s.device}{s.current ? ' (current)' : ''}</div>
                  <div className="text-xs text-gray-600">{s.location} • Last active {new Date(s.lastActive).toLocaleString()}</div>
                </div>
                {!s.current && (
                  <button
                    onClick={() => onRevokeSession(s.id)}
                    className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-md"
                  >
                    Log out
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


