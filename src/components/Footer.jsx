import React from 'react'
import { Wand2, Github, Twitter, Mail, Heart, Sparkles, Crown, ExternalLink, Zap } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="glass-effect border-t border-white/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Enhanced Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-4 mb-6 hover-lift">
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-purple-700 rounded-xl shadow-lg">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl opacity-30 blur-sm -z-10"></div>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-bold text-gradient">PromptCraft AI</h3>
                  <div className="badge badge-premium text-xs">Pro</div>
                </div>
                <p className="text-sm text-gray-600 font-medium">Universal AI Prompt Engineering Platform</p>
              </div>
            </div>
            <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
              Transform your ideas into powerful AI prompts with our intelligent enhancement engine. 
              Professional-grade prompt engineering made accessible to everyone.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-gray-200/60 hover-lift">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">AI-Powered</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-gray-200/60 hover-lift">
                <Crown className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Premium Quality</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-gray-200/60 hover-lift">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">7 AI Models</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl border border-gray-200/60 hover-lift">
                <Wand2 className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Smart Format</span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Product</h4>
            <ul className="space-y-4">
              <li>
                <a href="#features" className="text-gray-600 hover:text-purple-600 transition-all duration-200 text-sm font-medium hover-lift inline-block">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 hover:text-purple-600 transition-all duration-200 text-sm font-medium hover-lift inline-block">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#docs" className="text-gray-600 hover:text-purple-600 transition-all duration-200 text-sm font-medium hover-lift inline-flex items-center">
                  Documentation
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </li>
              <li>
                <a href="#api" className="text-gray-600 hover:text-purple-600 transition-all duration-200 text-sm font-medium hover-lift inline-block">
                  API Reference
                </a>
              </li>
            </ul>
          </div>

          {/* Enhanced Support & Social */}
          <div>
            <h4 className="font-bold text-gray-900 mb-6">Connect</h4>
            <ul className="space-y-4 mb-8">
              <li>
                <a href="#support" className="text-gray-600 hover:text-purple-600 transition-all duration-200 text-sm font-medium hover-lift inline-block">
                  Support Center
                </a>
              </li>
              <li>
                <a href="#community" className="text-gray-600 hover:text-purple-600 transition-all duration-200 text-sm font-medium hover-lift inline-block">
                  Community
                </a>
              </li>
              <li>
                <a href="#blog" className="text-gray-600 hover:text-purple-600 transition-all duration-200 text-sm font-medium hover-lift inline-block">
                  Blog
                </a>
              </li>
            </ul>
            
            <div className="flex items-center space-x-4">
              <a 
                href="https://github.com" 
                className="p-3 bg-white/60 rounded-xl border border-gray-200/60 text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200 hover-lift"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                className="p-3 bg-white/60 rounded-xl border border-gray-200/60 text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200 hover-lift"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="mailto:hello@promptcraft.ai" 
                className="p-3 bg-white/60 rounded-xl border border-gray-200/60 text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200 hover-lift"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Enhanced Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-6 sm:space-y-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 text-sm text-gray-500">
              <span className="font-medium">© 2024 PromptCraft AI</span>
              <a href="#privacy" className="hover:text-gray-700 transition-all duration-200 hover-lift">Privacy Policy</a>
              <a href="#terms" className="hover:text-gray-700 transition-all duration-200 hover-lift">Terms of Service</a>
              <a href="#security" className="hover:text-gray-700 transition-all duration-200 hover-lift">Security</a>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current animate-pulse" />
              <span>for the AI community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 