import React, { useState } from 'react'
import { FileText, Sparkles, Crown, Menu, X, Zap, Star } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
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
            {/* Free/Premium Status */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 font-medium">Free Plan</span>
            </div>

            {/* Upgrade CTA */}
            <button className="btn btn-premium btn-sm group relative overflow-hidden">
              <Crown className="w-4 h-4 mr-1.5" />
              <span>Upgrade</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700"></div>
            </button>

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

      {/* Premium Feature Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 text-center text-sm font-medium no-print">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="w-4 h-4" />
          <span>Try AI-Enhanced Prompts</span>
          <Star className="w-4 h-4 text-yellow-300" />
          <span className="hidden sm:inline">• 3x Better Results • Premium Features</span>
          <button className="ml-2 underline hover:no-underline font-semibold">
            Start Free Trial
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header 