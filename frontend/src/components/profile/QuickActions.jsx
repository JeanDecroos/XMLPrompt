import React, { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/api/client'
import { usePlan } from '../../features/profile/api'

export default function QuickActions({ isTopTier = true }) {
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { data: plan } = usePlan()
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/prompts/new" className="btn btn-primary btn-md text-center">Create Prompt</Link>
        <>
          <button className="btn btn-secondary btn-md" onClick={() => inputRef.current?.click()}>Import Prompt</button>
          <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const form = new FormData()
            form.append('file', file)
            const res = await api.post('/api/prompts/import', form)
            const id = res?.data?.id
            if (id) navigate(`/prompts/${id}`)
          }} />
        </>
        {plan && !plan.isTopTier && (
          <Link to="/billing/upgrade" className="btn btn-premium btn-md text-center">Upgrade Plan</Link>
        )}
      </div>
    </div>
  )
}


