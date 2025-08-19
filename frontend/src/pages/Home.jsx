import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Meta from '../seo/Meta'
import { trackEvent } from '../lib/analytics'
import Hero from '../components/marketing/Hero'
import RotatingPromptExamples from '../components/RotatingPromptExamples'

const Home = () => {
  const headingRef = useRef(null)
  const bottomCtaRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Move focus to the main heading on navigation
    if (headingRef.current) headingRef.current.focus()
  }, [])

  // Sticky CTA: show while user has NOT reached the inline CTA bar; hide once it's in view or passed
  useEffect(() => {
    const onScroll = () => {
      const el = document.querySelector('.sticky-cta-enter') as HTMLElement | null
      const anchor = bottomCtaRef.current
      if (!el || !anchor) return

      const ctaRect = anchor.getBoundingClientRect()
      const viewportBottom = window.innerHeight

      // If the inline CTA's top is below the viewport bottom, user hasn't reached it yet → show sticky
      const shouldShow = ctaRect.top > viewportBottom
      if (shouldShow) el.classList.add('visible')
      else el.classList.remove('visible')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
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
          <div ref={bottomCtaRef} className="cta-bar px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-gray-900 text-lg font-semibold text-center sm:text-left">Ready to transform your prompts?</p>
              <p className="cta-subtext text-center sm:text-left">No sign-up required on free tier</p>
            </div>
            <div className="flex items-center gap-3 cta-spotlight">
              <Link
                to="/builder"
                onClick={() => trackEvent('start_building_click', { source: 'home_bottom_bar' })}
                className="btn btn-cta btn-cta-xl btn-cta-attention"
              >
                Start Building
                <span className="cta-arrow ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA shown in last 20% of page */}
      <div className="sticky-cta-container">
        <div className="sticky-cta-inner max-w-6xl mx-auto px-4">
          <div className="sticky-cta-enter">
            <div className="cta-bar px-6 py-4 flex items-center justify-between gap-4">
              <p className="text-gray-900 font-semibold">Ready to transform your prompts?</p>
              <Link
                to="/builder"
                onClick={() => trackEvent('start_building_click', { source: 'home_sticky_bar' })}
                className="btn btn-cta btn-cta-xl btn-cta-attention"
              >
                Start Building
                <span className="cta-arrow ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home


