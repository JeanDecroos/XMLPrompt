import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import SimplifiedPromptGenerator from './components/SimplifiedPromptGenerator'
import PricingSection from './components/PricingSection'
import Footer from './components/Footer'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <SimplifiedPromptGenerator />
          <PricingSection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App 