import React from 'react'
import { Link } from 'react-router-dom'

export default function QuickActions({ isTopTier = true }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/" className="btn btn-primary btn-md text-center">Create Prompt</Link>
        <button className="btn btn-secondary btn-md">Import Prompt</button>
        {!isTopTier && (
          <Link to="/pricing" className="btn btn-premium btn-md text-center">Upgrade Plan</Link>
        )}
      </div>
    </div>
  )
}


