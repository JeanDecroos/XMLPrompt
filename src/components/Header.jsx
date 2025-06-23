import React from 'react'
import { FileText, Sparkles } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">XML Prompter</h1>
              <p className="text-sm text-gray-500">AI-Enhanced Claude Sonnet Prompt Generator</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-purple-600">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">AI-Enhanced</span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 