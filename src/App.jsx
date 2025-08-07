import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { BackgroundProvider, useBackground } from './contexts/BackgroundContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import SimplifiedPromptGenerator from './components/SimplifiedPromptGenerator'
import Header from './components/Header'
import PricingSection from './components/PricingSection'
import Footer from './components/Footer'
import HelpPage from './components/HelpPage'
import DocsPage from './components/DocsPage'
import UserProfile from './components/UserProfile'
import './index.css'

function UserProfileWrapper() {
  const [searchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'overview'
  return <UserProfile initialTab={initialTab} />
}

function AppContent() {
  const [isScrolling, setIsScrolling] = useState(false)
  const { backgroundAnimation } = useBackground()
  const { theme } = useTheme()

  // Handle scroll-triggered animation acceleration
  useEffect(() => {
    if (!backgroundAnimation) return // Don't add scroll listener if animation is disabled

    let scrollTimeout

    const handleScroll = () => {
      setIsScrolling(true)
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      
      // Set timeout to stop acceleration after scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150) // 150ms delay after scrolling stops
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
    }
  }, [backgroundAnimation])

  // Determine background classes based on user preference
  const getBackgroundClasses = () => {
    if (backgroundAnimation) {
      return `bg-gradient-to-br from-yellow-100 via-orange-100 via-pink-100 via-purple-100 via-blue-100 to-cyan-100 ${isScrolling ? 'animate-gradient-fast' : 'animate-gradient'}`
    } else {
      return 'bg-gray-50' // Static, bland background
    }
  }

  return (
    <div className={`min-h-screen ${getBackgroundClasses()} ${theme}`}>
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<SimplifiedPromptGenerator />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/pricing" element={<PricingSection />} />
          <Route path="/profile" element={<UserProfileWrapper />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BackgroundProvider>
          <Router>
            <AppContent />
          </Router>
        </BackgroundProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App 