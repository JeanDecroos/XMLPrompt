import React, { useState } from 'react'
import { use2FAStatus, useEnable2FA, useVerify2FA, useDisable2FA, useSessions, useRevokeSession } from '../../features/profile/api'

export default function SecurityCard() {
  const statusQ = use2FAStatus()
  const enable2FA = useEnable2FA()
  const verify2FA = useVerify2FA()
  const disable2FA = useDisable2FA()
  const sessionsQ = useSessions()
  const revoke = useRevokeSession()
  const [qrUrl, setQrUrl] = useState(null)
  const [code, setCode] = useState('')

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Security</h3>
        {statusQ.isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 w-20 bg-gray-200 rounded"></div>
          </div>
        ) : statusQ.data?.enabled ? (
          <button
            onClick={async () => { await disable2FA.mutateAsync(); await statusQ.refetch() }}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-900 text-white"
          >
            Disable 2FA
          </button>
        ) : (
          <button
            onClick={async () => { const res = await enable2FA.mutateAsync(); setQrUrl(res.otpauthUrl) }}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white"
          >
            Enable 2FA
          </button>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-600">2FA Status: <span className={`font-medium ${statusQ.data?.enabled ? 'text-green-700' : 'text-gray-800'}`}>{statusQ.data?.enabled ? 'Enabled' : 'Disabled'}</span></div>

      {sessionsQ.isLoading ? (
        <div className="mt-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : Array.isArray(sessionsQ.data?.sessions) && sessionsQ.data.sessions.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Active sessions</h4>
          <ul className="divide-y divide-gray-200">
            {sessionsQ.data.sessions.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-900">{s.device}{s.current ? ' (current)' : ''}</div>
                  <div className="text-xs text-gray-600">{s.location} • Last active {new Date(s.lastActive).toLocaleString()}</div>
                </div>
                {!s.current && (
                  <button
                    onClick={() => revoke.mutate(s.id)}
                    className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-md"
                  >
                    Log out
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 text-sm text-gray-600">No other active sessions.</div>
      )}

      {qrUrl && !statusQ.data?.enabled && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h4 id="twofa-title" className="text-lg font-semibold text-gray-900 mb-2">Enable Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600 mb-3">Scan this QR code with your authenticator app, then enter the 6-digit code.</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrUrl)}`} alt="2FA QR" className="mx-auto mb-3" />
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border rounded-md px-3 py-2 mb-3"
              placeholder="Enter 6-digit code"
              aria-label="2FA code"
            />
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-2 text-sm" onClick={() => setQrUrl(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={async () => { await verify2FA.mutateAsync(code); setQrUrl(null); await statusQ.refetch() }}>Verify</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


