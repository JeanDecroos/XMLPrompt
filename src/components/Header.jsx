import React, { useState, useEffect } from 'react'
import { Wand2, Menu, X, User, LogIn, UserPlus, Crown, ChevronDown, LogOut, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import { isAuthEnabled } from '../lib/supabase'

const Header = () => {
  const { user, isAuthenticated, isPro, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signin')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
  }

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode)
    setIsAuthModalOpen(true)
    setIsMenuOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 glass-effect border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Enhanced Logo & Brand */}
            <a href="#" className="flex items-center space-x-3 hover-lift py-3">
              <div className="relative">
                <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl opacity-30 blur-sm -z-10"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">PromptCraft AI</h1>
                <p className="text-xs text-gray-500 hidden sm:block font-medium">Universal AI Prompt Optimizer</p>
              </div>
            </a>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              <a href="#features" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-lg hover:bg-white/60 hover-lift">Features</a>
              <a href="#pricing" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-lg hover:bg-white/60 hover-lift">Pricing</a>
              <a href="#roadmap" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-lg hover:bg-white/60 hover-lift">Roadmap</a>
            </nav>

            {/* Enhanced User Actions */}
            <div className="flex items-center space-x-4">
              {isAuthEnabled && isAuthenticated ? (
                <>
                  {isPro && (
                    <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200/60 shadow-sm hover-lift">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-700 font-semibold">Pro</span>
                    </div>
                  )}
                  <div className="relative">
                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-white/60 transition-all duration-200 hover-lift">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-sm text-white font-semibold">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-30 blur-sm -z-10"></div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/60 py-2 z-50 scale-in">
                        <div className="px-4 py-3 border-b border-gray-100/60">
                          <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
                        </div>
                        <a href="#" className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 flex items-center transition-all duration-200 hover-lift">
                          <User className="w-4 h-4 mr-3" />Account Settings
                        </a>
                        <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 flex items-center transition-all duration-200 hover-lift">
                          <LogOut className="w-4 h-4 mr-3" />Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <button onClick={() => openAuthModal('signin')} className="px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-all duration-200 rounded-lg hover:bg-white/60 hover-lift">
                    Sign In
                  </button>
                  <button onClick={() => openAuthModal('signup')} className="btn btn-premium btn-md relative overflow-hidden">
                    <span className="relative z-10">Get Started</span>
                  </button>
                </div>
              )}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-white/60 transition-all duration-200 hover-lift" aria-label="Toggle menu">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden border-t border-white/20 py-4 space-y-2 slide-up">
              <a href="#features" className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-all duration-200 font-medium">Features</a>
              <a href="#pricing" className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-all duration-200 font-medium">Pricing</a>
              <a href="#roadmap" className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-all duration-200 font-medium">Roadmap</a>
              <div className="px-4 pt-3 border-t border-white/20">
                {isAuthenticated ? (
                  <div className="flex flex-col items-center space-y-3">
                     <p className="text-sm font-medium">{user.email}</p>
                     <button onClick={handleSignOut} className="w-full btn btn-secondary btn-sm">Sign Out</button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <button onClick={() => openAuthModal('signin')} className="btn btn-secondary btn-sm">Sign In</button>
                    <button onClick={() => openAuthModal('signup')} className="btn btn-premium btn-sm">Get Started</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      {isAuthEnabled && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authModalMode} />
      )}
    </>
  )
}

export default Header 