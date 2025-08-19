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
  }, [location.pathname, isPro])

  return null
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <RouteEffects />
        <div className="min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/builder" element={<Builder />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/help/:slug" element={<HelpPage />} />
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