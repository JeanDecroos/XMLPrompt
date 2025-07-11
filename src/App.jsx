import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import SimplifiedPromptGenerator from './components/SimplifiedPromptGenerator'
import PricingSection from './components/PricingSection'
import Footer from './components/Footer'
import HelpPage from './components/HelpPage'
import DocsPage from './components/DocsPage'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={
                <>
                  <SimplifiedPromptGenerator />
                  <PricingSection />
                </>
              } />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/pricing" element={<PricingSection />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 