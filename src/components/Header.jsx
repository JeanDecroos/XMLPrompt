import React, { useState } from 'react'
import { FileText, Sparkles, Crown, Menu, X, Zap, Star, User, LogIn, LogOut, ChevronDown } from 'lucide-react'
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
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 via-purple-600 to-primary-700 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900">XML Prompter</h1>
                <span className="badge badge-premium text-xs">Pro</span>
              </div>
              <p className="text-sm text-gray-500 hidden sm:block">AI-Enhanced Prompt Engineering</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Pricing
            </a>
            <a href="#docs" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Docs
            </a>
          </nav>

          {/* CTA & User Actions */}
          <div className="flex items-center space-x-3">
            {!isAuthEnabled ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Demo Mode
                </span>
              </div>
            ) : isAuthenticated ? (
              <>
                {/* Pro Status Badge */}
                {isPro && (
                  <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                    <Crown className="w-3 h-3 text-purple-600" />
                    <span className="text-sm text-purple-700 font-medium">Pro</span>
                  </div>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="btn btn-ghost btn-sm flex items-center space-x-2"
                  >
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {user?.user_metadata?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:inline text-sm">
                      {user?.user_metadata?.name || 'Account'}
                    </span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.user_metadata?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      {!isPro && (
                        <button className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center">
                          <Crown className="w-4 h-4 mr-2" />
                          Upgrade to Pro
                        </button>
                      )}
                      
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Account Settings
                      </button>
                      
                      <button 
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
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
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="btn-primary"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Upgrade CTA for non-pro users */}
            {isAuthEnabled && isAuthenticated && !isPro && (
              <button className="btn-secondary bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shimmer">
                Upgrade to Pro
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden btn btn-ghost btn-sm"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200/60 py-4 space-y-3 slide-up">
            <a href="#features" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Features
            </a>
            <a href="#pricing" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Pricing
            </a>
            <a href="#docs" className="block px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              Documentation
            </a>
            <div className="px-4 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Current Plan</span>
                <span className="badge badge-free">Free</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Feature Highlight */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 py-2 px-4 text-center text-sm no-print">
        <div className="flex items-center justify-center space-x-2 text-gray-700">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>Enhanced prompts available with Pro features</span>
          <button className="ml-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
            Learn more
          </button>
        </div>
      </div>
    </header>

    {/* Auth Modal */}
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      initialMode={authModalMode}
    />
    </>
  )
}

export default Header 