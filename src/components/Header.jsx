import React, { useState, useEffect } from 'react'
import { Wand2, Menu, X, User, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'

const Header = () => {
  const { user, signOut, isAuthEnabled } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Roadmap', href: '#roadmap' },
  ]

  const NavLink = ({ href, children }) => (
    <a
      href={href}
      className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors duration-300 relative group"
      onClick={() => setIsMenuOpen(false)}
    >
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
    </a>
  )

  return (
    <>
      <header 
        className={`sticky top-0 z-[1000] w-full transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <a href="#" className="flex items-center space-x-2 shrink-0">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg shadow-lg">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 tracking-tight">
                PromptCraft AI
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink key={link.name} href={link.href}>
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthEnabled && user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{user.email?.split('@')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn btn-primary btn-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg pb-6">
            <nav className="flex flex-col items-center space-y-6 pt-4">
              {navLinks.map((link) => (
                <NavLink key={link.name} href={link.href}>
                  {link.name}
                </NavLink>
              ))}
            </nav>
            <div className="mt-6 border-t border-gray-200 pt-6 px-4">
              {isAuthEnabled && user ? (
                 <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{user.email?.split('@')[0]}</span>
                    </div>
                    <button
                      onClick={signOut}
                      className="w-full text-center py-2 text-sm text-red-600 bg-red-50 rounded-lg"
                    >
                      Sign Out
                    </button>
                 </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full flex items-center justify-center py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  )
}

export default Header 