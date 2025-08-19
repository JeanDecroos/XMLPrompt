import React from 'react'
import { Link } from 'react-router-dom'
import { trackEvent } from '../../lib/analytics'

const Hero = React.forwardRef((props, ref) => {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 text-center text-slate-900">
      <h1
        ref={ref}
        tabIndex="-1"
        className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6 drop-shadow-sm focus:outline-none focus-visible:outline-none focus:ring-0"
      >
        Build Better AI Prompts
      </h1>
      <p className="text-lg md:text-xl text-slate-700 max-w-2xl mx-auto leading-relaxed mb-8">
        Transform your ideas into structured prompts that deliver exceptional results from any AI model.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/builder" onClick={() => trackEvent('start_building_click', { source: 'home_hero' })} className="btn btn-cta">Start Building</Link>
        <Link to="/pricing" className="btn btn-secondary">View Pricing</Link>
      </div>
    </div>
  )
})

export default Hero


