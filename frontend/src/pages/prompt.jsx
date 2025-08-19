import React from 'react'
import SimplifiedPromptGenerator from '../components/SimplifiedPromptGenerator'

export default function PromptPage() {
  return (
    <main className="min-h-screen">
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-16 pb-24">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold tracking-tight">AI Prompt Generator</h1>
          <p className="mt-3 text-sm opacity-80">Create powerful, optimized prompts for any AI model.</p>
        </header>

        <SimplifiedPromptGenerator layout="two-card" />
      </section>
    </main>
  )
}


