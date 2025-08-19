import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Meta from '../seo/Meta'
import { trackEvent } from '../lib/analytics'
import Hero from '../components/marketing/Hero'
import RotatingPromptExamples from '../components/RotatingPromptExamples'

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
    <main className="min-h-screen text-slate-900">
      <Meta 
        title="Promptr — AI Prompt Builder" 
        description="Transform simple ideas into structured, optimized prompts for any AI model."
      />

      <section className="pt-16 md:pt-24">
        <Hero ref={headingRef} />
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <RotatingPromptExamples />
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-md px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-900 text-lg font-semibold text-center sm:text-left">Ready to transform your prompts?</p>
            <div className="flex items-center justify-center">
              <Link
                to="/builder"
                onClick={() => trackEvent('start_building_click', { source: 'home_bottom_bar' })}
                className="btn btn-cta"
              >
                Start Building
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home


