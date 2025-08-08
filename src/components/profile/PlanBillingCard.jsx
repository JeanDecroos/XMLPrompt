import React from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { usePlan, useUsage, useInvoices } from '../../features/profile/api'

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
  const planQ = usePlan()
  const usageQ = useUsage()
  const invoicesQ = useInvoices(5)

  const isLoading = planQ.isLoading || usageQ.isLoading
  const hasError = planQ.isError || usageQ.isError
  const nextRenewal = planQ.data?.nextRenewalAt ? new Date(planQ.data.nextRenewalAt) : null
  const usage = usageQ.data

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Plan & Billing</h3>
          {isLoading ? (
            <p className="text-sm text-gray-600 animate-pulse">Loading…</p>
          ) : hasError ? (
            <button className="text-sm text-red-600 underline" onClick={() => { planQ.refetch(); usageQ.refetch() }}>Try again</button>
          ) : (
            <p className="text-sm text-gray-600">{planQ.data?.name} · {planQ.data?.billingCycle}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Next renewal</div>
          <div className="text-sm font-medium text-gray-900">
            {nextRenewal ? `${format(nextRenewal, 'PP')} (${formatDistanceToNow(nextRenewal, { addSuffix: true })})` : '—'}
          </div>
        </div>
      </div>

      {Array.isArray(planQ.data?.features) && planQ.data.features.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Included features</h4>
          <ul className="text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {planQ.data.features.map((f, i) => (
              <li key={i} className="flex items-center">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                {f.label}: {String(f.value)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {usage && (
        <div className="mt-6 space-y-4">
          {typeof usage.promptsLimit === 'number' && (
            <Progress used={usage.promptsUsed} limit={usage.promptsLimit} label="Prompts this period" />
          )}
          {typeof usage.modelsLimit === 'number' && (
            <Progress used={usage.modelsUsed} limit={usage.modelsLimit} label="Models" />
          )}
        </div>
      )}

      {invoicesQ.isSuccess && invoicesQ.data.invoices.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Recent invoices</h4>
          <ul className="text-xs text-gray-700 space-y-1">
            {invoicesQ.data.invoices.map((inv) => (
              <li key={inv.id} className="flex justify-between">
                <span>{format(new Date(inv.createdAt), 'PP')}</span>
                <span className="text-gray-600">{inv.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


