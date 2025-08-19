import React from 'react'

const Card = ({ title, children }) => (
  <div className="card rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm">
    <div className="card-body p-6 md:p-8">
      <h3 className="text-slate-800 font-semibold mb-2">{title}</h3>
      <div className="text-slate-600 text-sm leading-relaxed">{children}</div>
    </div>
  </div>
)

const TransformationDeck = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        <Card title="Basic Input">
          "Describe this product"
        </Card>
        <Card title="Structured Prompt">
          "Write a product description for our project management software that highlights key features, benefits, and target audience pain points"
        </Card>
        <Card title="AI‑Enhanced Result">
          "Write a conversion‑optimized product description for our project management software that addresses busy team leads' pain points, highlights unique collaborative features with time‑saving metrics, includes social proof, integrates SEO keywords, and features a risk‑free trial offer."
        </Card>
      </div>
    </div>
  )
}

export default TransformationDeck


