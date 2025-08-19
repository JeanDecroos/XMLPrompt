import React from 'react'
import { FileText, Wand2, Sparkles } from 'lucide-react'

const StepCard = ({ icon: Icon, step, title, subtitle, children, accent }) => (
  <div className="card rounded-2xl border border-slate-200/70 bg-white shadow-sm">
    <div className="card-body">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-slate-800 font-semibold leading-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center">
          {step}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 min-h-[220px] flex items-center">
        <div className="text-slate-600 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  </div>
)

const TransformationDeck = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="card rounded-2xl bg-white/90 border border-slate-200/70 shadow-sm">
        <div className="card-body">
          <div className="text-center mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">See the Transformation</span>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-slate-900">From Simple Ideas to Professional Prompts</h2>
            <p className="mt-1 text-slate-600 text-sm">Watch how basic requests become detailed, effective prompts that get better results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <StepCard
              icon={FileText}
              step={1}
              title="Basic Input"
              subtitle="What you start with"
              accent="bg-slate-400"
            >
              “Describe this product”
            </StepCard>

            <StepCard
              icon={Wand2}
              step={2}
              title="Structured Prompt"
              subtitle="After initial processing"
              accent="bg-blue-500"
            >
              “Write a product description for our project management software that highlights key features, benefits, and target audience pain points”
            </StepCard>

            <StepCard
              icon={Sparkles}
              step={3}
              title="AI‑Enhanced Result"
              subtitle="Professional optimization"
              accent="bg-purple-600"
            >
              “Write a conversion‑optimized product description for our project management software that addresses busy team leads’ specific pain points (missed deadlines, poor communication), highlights unique collaborative features with specific time‑saving metrics, includes social proof from similar companies, incorporates SEO keywords naturally, and features risk‑free trial offers with compelling urgency elements”
            </StepCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransformationDeck


