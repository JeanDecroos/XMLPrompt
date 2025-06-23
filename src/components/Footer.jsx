import React from 'react'
import { FileText, Github, Twitter, Mail, Heart, Sparkles, Crown, ExternalLink } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/60 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-600 via-purple-600 to-primary-700 rounded-xl shadow-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-gray-900">XML Prompter</h3>
                  <span className="badge badge-premium text-xs">Pro</span>
                </div>
                <p className="text-sm text-gray-600">AI-Enhanced Prompt Engineering Platform</p>
              </div>
            </div>
            <p className="text-gray-600 max-w-md mb-6">
              Transform your ideas into powerful AI prompts with our intelligent enhancement engine. 
              Built for professionals who demand precision and results.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Crown className="w-4 h-4 text-purple-600" />
                <span>Premium Quality</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#docs" className="text-gray-600 hover:text-primary-600 transition-colors text-sm flex items-center">
                  Documentation
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#api" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  API Reference
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Social */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
            <ul className="space-y-3 mb-6">
              <li>
                <a href="#support" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Support Center
                </a>
              </li>
              <li>
                <a href="#community" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Community
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-600 hover:text-primary-600 transition-colors text-sm">
                  Blog
                </a>
              </li>
            </ul>
            
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="mailto:hello@xmlprompter.com" 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-200/60">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>© 2024 XML Prompter</span>
              <a href="#privacy" className="hover:text-gray-700 transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-gray-700 transition-colors">Terms</a>
              <a href="#security" className="hover:text-gray-700 transition-colors">Security</a>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for the AI community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 