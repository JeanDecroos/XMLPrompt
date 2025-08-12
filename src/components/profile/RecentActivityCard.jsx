import React from 'react'
import { Link } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'
import { useProfile, useSharedPrompts } from '../../features/profile/api'

export default function RecentActivityCard() {
  const profileQ = useProfile()
  const sharedQ = useSharedPrompts(3)
  const memberSince = profileQ.data?.memberSince
  const lastActive = profileQ.data?.lastActiveAt
  const sharedPrompts = sharedQ.data?.items || []
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>

      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-gray-600">Member since</div>
          <div className="text-gray-900 font-medium">{memberSince ? format(new Date(memberSince), 'PP') : '—'}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div className="text-gray-600">Last active</div>
          <div className="text-gray-900 font-medium">{lastActive ? `${format(new Date(lastActive), 'PPpp')} (${formatDistanceToNow(new Date(lastActive), { addSuffix: true })})` : '—'}</div>
        </div>
      </div>

      {sharedQ.isLoading ? (
        <div className="mt-4 text-sm text-gray-600">Loading shared prompts…</div>
      ) : Array.isArray(sharedPrompts) && sharedPrompts.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent shared prompts</h4>
          <ul className="space-y-2">
            {sharedPrompts.slice(0, 3).map((p) => (
              <li key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div>
                  <div className="text-sm text-gray-900 font-medium line-clamp-1">{p.title}</div>
                  <div className="text-xs text-gray-600">Updated {format(new Date(p.updatedAt), 'PPpp')}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={p.url} className="text-sm text-blue-600 hover:underline">View</a>
                  <Link to={`/prompts/${p.id}/edit`} className="text-sm text-gray-700 hover:underline">Edit</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 text-sm text-gray-600">No shared prompts yet — Create Prompt to get started.</div>
      )}
    </div>
  )
}


