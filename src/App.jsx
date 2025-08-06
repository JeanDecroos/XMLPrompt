import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import SimplifiedPromptGenerator from './components/SimplifiedPromptGenerator'
import Header from './components/Header'
import PricingSection from './components/PricingSection'
import Footer from './components/Footer'
import HelpPage from './components/HelpPage'
import DocsPage from './components/DocsPage'
import TemplateLibrary from './components/TemplateLibrary'
import UserProfile from './components/UserProfile'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<SimplifiedPromptGenerator />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/pricing" element={<PricingSection />} />
              <Route path="/templates" element={<TemplateLibrary />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 