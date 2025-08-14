import React, { useEffect, useRef } from 'react'

const UpgradeModal = ({ isOpen, onClose, ctaLabel = 'Upgrade to Premium', benefits = [] }) => {
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose?.()
      }
      // Basic focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        const focusArray = Array.from(focusable)
        if (focusArray.length === 0) return
        const first = focusArray[0]
        const last = focusArray[focusArray.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          last.focus()
          e.preventDefault()
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus()
          e.preventDefault()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    // Focus close button initially
    setTimeout(() => closeButtonRef.current?.focus(), 0)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
      <div ref={dialogRef} className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Upgrade to Premium</h3>
          <button ref={closeButtonRef} onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none" aria-label="Close upgrade dialog">
            ✕
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-gray-700">Enrichment is a premium feature. Upgrade to unlock enhanced prompt optimization.</p>
          <p className="text-sm text-gray-900 font-medium">Only €3/month</p>
          {Array.isArray(benefits) && benefits.length > 0 && (
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <a href="/pricing" className="btn btn-primary text-sm px-4 py-2">{ctaLabel}</a>
          <button onClick={onClose} className="btn btn-secondary text-sm px-4 py-2">Close</button>
        </div>
      </div>
    </div>
  )
}

export default UpgradeModal


