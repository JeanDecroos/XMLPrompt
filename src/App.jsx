import React from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import FinalPromptGenerator from './components/FinalPromptGenerator'
import PricingSection from './components/PricingSection'
import Footer from './components/Footer'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/30">
        <Header />
        <main>
          <FinalPromptGenerator />
          <PricingSection />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App 