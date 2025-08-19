import React from 'react'
import { LayoutGrid, Brain, Zap } from 'lucide-react'

const Item = ({ icon: Icon, title, children, accent }) => (
  <div className="rounded-2xl border border-slate-200 shadow-sm bg-white">
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h4 className="text-slate-800 font-semibold">{title}</h4>
      </div>
      <p className="text-slate-600 text-sm leading-relaxed">{children}</p>
    </div>
  </div>
)

const ValueProps = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Item icon={LayoutGrid} accent="bg-indigo-500" title="Clear Structure">Organized format that AI models understand better, leading to more accurate responses.</Item>
        <Item icon={Brain} accent="bg-purple-600" title="Context Aware">Includes relevant details, constraints, and specifications for targeted results.</Item>
        <Item icon={Zap} accent="bg-slate-600" title="Optimized Results">Professional quality output that saves time and delivers better outcomes.</Item>
      </div>
    </div>
  )
}

export default ValueProps


