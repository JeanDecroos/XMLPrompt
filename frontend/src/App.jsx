import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import PricingSection from './components/PricingSection'
import Footer from './components/Footer'
import HelpPage from './components/HelpPage'
import DocsPage from './components/DocsPage'
import UserProfile from './components/UserProfile'
import Home from './pages/Home'
import Builder from './pages/Builder'
import DataPreloader from './components/DataPreloader'
import { trackPageView } from './lib/analytics'
import './index.css'

// Internal component to handle global effects like analytics and legacy redirects
const RouteEffects = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isPro } = useAuth()

  // Legacy deep links handling: ?builder=true or #builder → /builder (preserve query)
  useEffect(() => {
    if (location.pathname === '/') {
      const searchParams = new URLSearchParams(location.search)
      const hasBuilderQuery = searchParams.get('builder') === 'true' || searchParams.get('builder') === '1'
      const hasBuilderHash = (location.hash || '').toLowerCase().includes('builder')
      if (hasBuilderQuery || hasBuilderHash) {
        navigate({ pathname: '/builder', search: location.search }, { replace: true })
      }
    }
  }, [location.pathname, location.search, location.hash, navigate])

  // Analytics: fire page_view on route change
  useEffect(() => {
    const tier = isPro ? 'pro' : 'free'
    trackPageView({ path: location.pathname, user_tier: tier })
    // Scroll to top on route change (preserve position for hash-only changes)
    window.scrollTo(0, 0)
  }, [location.pathname, isPro])

  // Dynamic background color based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100

      // Calculate smooth color transitions based on scroll percentage
      const clampedPercentage = Math.max(0, Math.min(100, scrollPercentage))
      
      // Interpolate between color stops for smooth transitions
      let r, g, b
      
      if (clampedPercentage <= 25) {
        // 0% to 25%: white to light blue
        const t = clampedPercentage / 25
        r = Math.round(255 * (1 - t) + 240 * t)
        g = Math.round(255 * (1 - t) + 249 * t)
        b = Math.round(255 * (1 - t) + 255 * t)
      } else if (clampedPercentage <= 50) {
        // 25% to 50%: light blue to medium blue
        const t = (clampedPercentage - 25) / 25
        r = Math.round(240 * (1 - t) + 219 * t)
        g = Math.round(249 * (1 - t) + 234 * t)
        b = Math.round(255 * (1 - t) + 254 * t)
      } else if (clampedPercentage <= 75) {
        // 50% to 75%: medium blue to deep blue
        const t = (clampedPercentage - 50) / 25
        r = Math.round(219 * (1 - t) + 191 * t)
        g = Math.round(234 * (1 - t) + 219 * t)
        b = Math.round(254 * (1 - t) + 253 * t)
      } else {
        // 75% to 100%: deep blue to purple-blue
        const t = (clampedPercentage - 75) / 25
        r = Math.round(191 * (1 - t) + 196 * t)
        g = Math.round(219 * (1 - t) + 181 * t)
        b = Math.round(253 * (1 - t) + 254 * t)
      }
      
      // Apply the smooth color transition
      document.body.style.setProperty('--dynamic-bg-color', `rgb(${r}, ${g}, ${b})`)
      
      // Debug logging (remove in production)
      console.log(`Scroll: ${clampedPercentage.toFixed(1)}%, Color: rgb(${r}, ${g}, ${b})`)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Call once to set initial state
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return null
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteEffects />
        <DataPreloader />
        <div className="min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/builder" element={<Builder />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/pricing" element={<PricingSection />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App 