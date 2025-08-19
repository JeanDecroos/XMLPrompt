import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Meta from '../seo/Meta'
import { trackEvent } from '../lib/analytics'
import Hero from '../components/marketing/Hero'
import TransformationDeck from '../components/marketing/TransformationDeck'
import ValueProps from '../components/marketing/ValueProps'

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
    <main className="min-h-screen bg-gradient-to-b from-[#7A5AF8] via-[#8E8CF8] to-[#F5F7FB] text-slate-900">
      <Meta 
        title="Promptr — AI Prompt Builder" 
        description="Transform simple ideas into structured, optimized prompts for any AI model."
      />

      <section className="pt-16 md:pt-24">
        <Hero ref={headingRef} />
      </section>

      <section className="py-10 md:py-14">
        <TransformationDeck />
      </section>

      <section id="why" className="py-12 md:py-16">
        <ValueProps />
      </section>

      <section className="py-12 md:py-16 text-center">
        <Link to="/builder" onClick={() => trackEvent('start_building_click', { source: 'home_bottom' })} className="btn btn-primary">Start Building</Link>
      </section>
    </main>
  )
}

export default Home


