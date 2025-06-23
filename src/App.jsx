import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import PromptGenerator from './components/PromptGenerator'
import PricingSection from './components/PricingSection'
import FutureRoadmap from './components/FutureRoadmap'
import Footer from './components/Footer'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col circuit-pattern">
        <Header />
        <main className="flex-1">
          <PromptGenerator />
          <PricingSection />
          <FutureRoadmap />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App 