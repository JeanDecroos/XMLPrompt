import React from 'react'
import Header from './components/Header'
import PromptGenerator from './components/PromptGenerator'
import PricingSection from './components/PricingSection'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen flex flex-col circuit-pattern">
      <Header />
      <main className="flex-1">
        <PromptGenerator />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}

export default App 