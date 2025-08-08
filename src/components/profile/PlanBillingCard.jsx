import React from 'react'

const Progress = ({ used, limit, label }) => {
  const pct = Math.min(100, Math.round((used / Math.max(limit || 1, 1)) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>
          {used} / {limit}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function PlanBillingCard({ plan, quota }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Plan & Billing</h3>
          <p className="text-sm text-gray-600">{plan?.name || '—'} · {plan?.billingCycle || '—'}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Next renewal</div>
          <div className="text-sm font-medium text-gray-900">
            {plan?.nextRenewal ? new Date(plan.nextRenewal).toLocaleDateString() : '—'}
          </div>
        </div>
      </div>

      {Array.isArray(plan?.features) && plan.features.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Included features</h4>
          <ul className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {quota?.enabled && (
        <div className="mt-6 space-y-4">
          {quota.prompts && (
            <Progress used={quota.prompts.used} limit={quota.prompts.limit} label="Prompts this month" />
          )}
          {quota.enrichments && (
            <Progress used={quota.enrichments.used} limit={quota.enrichments.limit} label="Enhancements" />
          )}
          {quota.storage && (
            <Progress used={quota.storage.used} limit={quota.storage.limit} label="Storage" />
          )}
          {Array.isArray(quota.modelsAvailable) && (
            <div className="text-xs text-gray-600">
              Models available: {quota.modelsAvailable.join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


