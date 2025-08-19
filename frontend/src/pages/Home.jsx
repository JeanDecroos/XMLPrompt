import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Meta from '../seo/Meta'
import { trackEvent } from '../lib/analytics'

const Home = () => {
  const headingRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Move focus to the main heading on navigation
    if (headingRef.current) headingRef.current.focus()
  }, [])

  const handleStartBuilding = (e) => {
    trackEvent('start_building_click', { source: 'home_hero' })
  }

  return (
    <div>
      <Meta 
        title="Promptr — AI Prompt Builder" 
        description="Transform simple ideas into structured, optimized prompts for any AI model."
      />

      {/* Hero */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1
            ref={headingRef}
            tabIndex="-1"
            className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight"
          >
            Build Better AI Prompts
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-8">
            Transform your ideas into structured prompts that deliver exceptional results from any AI model.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/builder" onClick={handleStartBuilding} className="btn btn-primary">
              Start Building
            </Link>
            <a href="#why" className="btn btn-secondary">See why</a>
          </div>
        </div>
      </section>

      {/* Transformation Demo */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-purple-50 text-purple-700 border border-purple-100">
              See the Transformation
            </span>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">From Simple Ideas to Professional Prompts</h2>
            <p className="mt-2 text-gray-600">Watch how a basic request becomes a detailed, effective prompt.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">1. Basic Input</h3>
              <p className="text-gray-600 text-sm">"Describe this product"</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">2. Structured Prompt</h3>
              <p className="text-gray-600 text-sm">"Write a product description for our project management software that highlights key features, benefits, and target audience pain points"</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">3. AI‑Enhanced Result</h3>
              <p className="text-gray-600 text-sm">"Write a conversion‑optimized product description ... includes social proof, SEO keywords, and risk‑free trial offers with urgency elements"</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section id="why" className="py-12 sm:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-1">Clear Structure</h4>
              <p className="text-gray-600 text-sm">Organized prompts that AI models understand better for accurate responses.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-1">Context Aware</h4>
              <p className="text-gray-600 text-sm">Includes relevant details, constraints, and specifications for targeted results.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-1">Optimized Results</h4>
              <p className="text-gray-600 text-sm">Professional‑quality output that saves time and delivers better outcomes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mid‑page CTA */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">Ready to transform your prompts?</h3>
          <Link to="/builder" onClick={() => trackEvent('start_building_click', { source: 'home_mid' })} className="btn btn-primary">
            Start Building
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home


