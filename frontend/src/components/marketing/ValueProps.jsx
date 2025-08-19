import React from 'react'

const Item = ({ title, children }) => (
  <div className="card rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm">
    <div className="card-body p-6 md:p-8">
      <h4 className="text-slate-800 font-semibold mb-1">{title}</h4>
      <p className="text-slate-600 text-sm leading-relaxed">{children}</p>
    </div>
  </div>
)

const ValueProps = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Item title="Clear Structure">Organized prompts that AI models understand better for accurate responses.</Item>
        <Item title="Context Aware">Includes relevant details, constraints, and specifications for targeted results.</Item>
        <Item title="Optimized Results">Professional‑quality output that saves time and delivers better outcomes.</Item>
      </div>
    </div>
  )
}

export default ValueProps


