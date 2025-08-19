import React, { useEffect, useRef } from 'react'
import Meta from '../seo/Meta'
import SimplifiedPromptGenerator from '../components/SimplifiedPromptGenerator'

const Builder = () => {
  const headingRef = useRef(null)

  useEffect(() => {
    if (headingRef.current) headingRef.current.focus()
  }, [])

  return (
    <div className="min-h-screen">
      <Meta title="Promptr — Prompt Builder" description="Build and enhance prompts with model‑aware formatting." />
      {/* Invisible heading for focus management */}
      <h1 ref={headingRef} tabIndex="-1" className="sr-only">Prompt Builder</h1>
      <SimplifiedPromptGenerator showHero={false} />
    </div>
  )
}

export default Builder


