import React, { useState } from 'react'
import { FileText, Sparkles, Crown, Menu, X, Zap, Star, User, LogIn, LogOut, ChevronDown, Wand2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isAuthEnabled } from '../lib/supabase'
import AuthModal from './AuthModal'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signin')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  
  const { user, isAuthenticated, isPro, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
  }

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode)
    setIsAuthModalOpen(true)
  }

  return (
    <>
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-sm">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PromptCraft AI</h1>
              <p className="text-sm text-gray-600 hidden sm:block">Universal AI Prompt Optimizer</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Pricing
            </a>
            <a href="#roadmap" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Roadmap
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {!isAuthEnabled ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Demo Mode
                </span>
              </div>
            ) : isAuthenticated ? (
              <>
                {/* Pro Badge */}
                {isPro && (
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-full border border-purple-200">
                    <Crown className="w-3 h-3 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">Pro</span>
                  </div>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-sm text-white font-medium">
                        {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                      {user?.user_metadata?.name || 'Account'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.user_metadata?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      {!isPro && (
                        <button className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center transition-colors">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                        </button>
                      )}
                      
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                        <User className="w-4 h-4 mr-2" />
                        Account Settings
                      </button>
                      
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            <a href="#features" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Features
            </a>
            <a href="#pricing" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Pricing
            </a>
            <a href="#roadmap" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Roadmap
            </a>
            {!isAuthEnabled && (
              <div className="px-4 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-center">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Demo Mode Active
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>

    {/* Auth Modal */}
    {isAuthEnabled && (
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    )}
    </>
  )
}

export default Header 