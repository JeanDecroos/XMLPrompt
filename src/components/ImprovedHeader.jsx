import React, { useState, useEffect } from 'react'
import { Wand2, Menu, X, User, LogIn, UserPlus, Crown, ChevronDown, LogOut, Sparkles, Settings, HelpCircle, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import SubscriptionStatus from './SubscriptionStatus'
import { isAuthEnabled } from '../lib/supabase'

const ImprovedHeader = () => {
  const { user, isAuthenticated, isPro, signOut } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signin')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [showSubscriptionStatus, setShowSubscriptionStatus] = useState(false)
  const [showQuickHelp, setShowQuickHelp] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
  }

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode)
    setIsAuthModalOpen(true)
    setIsMenuOpen(false)
  }

  const quickHelpItems = [
    { title: 'Getting Started', description: 'Learn the basics of prompt creation', icon: '🚀' },
    { title: 'Best Practices', description: 'Tips for writing effective prompts', icon: '💡' },
    { title: 'Model Guide', description: 'Choosing the right AI model', icon: '🤖' },
    { title: 'Examples', description: 'Inspiration from successful prompts', icon: '📚' }
  ]

  return (
    <>
      <header className="sticky top-0 z-50 glass-effect border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Enhanced Logo & Brand */}
            <div className="flex items-center">
              <a href="#" className="flex items-center space-x-3 hover-lift py-3">
                <div className="relative">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 rounded-xl shadow-lg hover:shadow-glow transition-all duration-300">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gradient">PromptCraft AI</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">Professional AI Prompts</p>
                </div>
              </a>
            </div>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <div className="flex items-center space-x-4">
                {/* Quick Help */}
                <div className="relative">
                  <button
                    onClick={() => setShowQuickHelp(!showQuickHelp)}
                    className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-lg hover:bg-white/60"
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Help
                  </button>
                  
                  {showQuickHelp && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/60 py-2 z-50">
                      <div className="px-3 py-2 border-b border-gray-100/60">
                        <p className="text-sm font-semibold text-gray-900">Quick Help</p>
                      </div>
                      {quickHelpItems.map((item, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-gray-50/80 flex items-center border-b border-gray-50 last:border-b-0"
                        >
                          <span className="mr-3 text-lg">{item.icon}</span>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Documentation */}
                <a href="#docs" className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-lg hover:bg-white/60">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Docs
                </a>

                {/* Pricing */}
                <a href="#pricing" className="px-3 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-lg hover:bg-white/60">
                  Pricing
                </a>
              </div>
            </nav>

            {/* Enhanced User Actions */}
            <div className="flex items-center space-x-3">
              {/* Progress Indicator for Authenticated Users */}
              {isAuthEnabled && isAuthenticated && (
                <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full border border-blue-200/60">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-700 font-medium">Active Session</span>
                </div>
              )}

              {isAuthEnabled && isAuthenticated ? (
                <>
                  {/* Pro Badge */}
                  {isPro && (
                    <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full border border-purple-200/60">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-700 font-semibold">Pro</span>
                    </div>
                  )}

                  {/* User Menu */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                      className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-white/60 transition-all duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm text-white font-semibold">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="hidden sm:block text-left">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                          {user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isPro ? 'Pro Member' : 'Free User'}
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/60 py-1 z-50">
                        <div className="px-3 py-2 border-b border-gray-100/60">
                          <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
                          <p className="text-xs text-gray-500">
                            {isPro ? 'Pro Member' : 'Free Plan'}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => setShowSubscriptionStatus(!showSubscriptionStatus)} 
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50/80 flex items-center"
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Account Settings
                        </button>

                        {!isPro && (
                          <button 
                            onClick={() => openAuthModal('upgrade')}
                            className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-50/80 flex items-center"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Upgrade to Pro
                          </button>
                        )}

                        <button 
                          onClick={handleSignOut} 
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50/80 flex items-center border-t border-gray-100/60"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <button 
                    onClick={() => openAuthModal('signin')} 
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 rounded-lg hover:bg-white/60"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => openAuthModal('signup')} 
                    className="btn btn-premium btn-md flex items-center"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Get Started Free
                  </button>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="md:hidden p-2 rounded-xl hover:bg-white/60 transition-all duration-200" 
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/20 py-4 space-y-3">
              <div className="space-y-2">
                <a href="#docs" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200 font-medium">
                  📖 Documentation
                </a>
                <a href="#pricing" className="block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200 font-medium">
                  💰 Pricing
                </a>
                <button 
                  onClick={() => setShowQuickHelp(!showQuickHelp)}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/60 rounded-lg transition-all duration-200 font-medium"
                >
                  ❓ Help & Support
                </button>
              </div>

              <div className="px-3 pt-2 border-t border-white/20">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3 p-2 bg-white/60 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-sm text-white font-semibold">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                        <p className="text-xs text-gray-500">{isPro ? 'Pro Member' : 'Free User'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowSubscriptionStatus(!showSubscriptionStatus)}
                      className="btn btn-secondary btn-sm"
                    >
                      Account Settings
                    </button>
                    <button 
                      onClick={handleSignOut} 
                      className="btn btn-ghost btn-sm text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => openAuthModal('signin')} 
                      className="btn btn-secondary btn-sm"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => openAuthModal('signup')} 
                      className="btn btn-premium btn-sm flex items-center justify-center"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      Get Started Free
                    </button>
                  </div>
                )}
              </div>
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
      
      {/* Subscription Status Modal */}
      {showSubscriptionStatus && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
                <button
                  onClick={() => setShowSubscriptionStatus(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SubscriptionStatus showDetails={true} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ImprovedHeader 