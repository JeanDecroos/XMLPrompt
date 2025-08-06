import React from 'react'
import { Wand2, Github, Twitter, Mail, Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="glass-effect border-t border-white/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Simplified Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-promptr-900 rounded-xl">
                <img src="/logos/PromptrLogo.png" alt="Promptr Logo" className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gradient">Promptr</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Professional AI prompt engineering made simple and accessible.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#docs" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#support" className="text-gray-600 hover:text-purple-600 transition-colors text-sm">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Connect</h4>
            <div className="flex items-center space-x-3">
              <a 
                href="https://github.com" 
                className="p-2 bg-white/60 rounded-lg border border-gray-200/60 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                className="p-2 bg-white/60 rounded-lg border border-gray-200/60 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="mailto:hello@promptr.com" 
                className="p-2 bg-white/60 rounded-lg border border-gray-200/60 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>© 2024 Promptr</span>
              <a href="#privacy" className="hover:text-gray-700 transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-gray-700 transition-colors">Terms</a>
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