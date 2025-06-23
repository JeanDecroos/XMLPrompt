import React, { useState } from 'react'
import { Copy, Check, Eye, Code, AlertCircle } from 'lucide-react'

const PromptPreview = ({ prompt, isValid, errors }) => {
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState('formatted') // 'formatted' or 'raw'

  const handleCopy = async () => {
    if (!prompt) return
    
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatPromptForDisplay = (prompt) => {
    if (!prompt) return ''
    
    // Add syntax highlighting classes for XML
    return prompt
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(&lt;\/?)(\w+)(&gt;)/g, '<span class="text-blue-600">$1$2$3</span>')
      .replace(/\n/g, '<br/>')
      .replace(/  /g, '&nbsp;&nbsp;')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Eye className="w-5 h-5 mr-2" />
          Generated Prompt
        </h3>
        
        {isValid && (
          <div className="flex items-center space-x-2">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setViewMode('formatted')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'formatted'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Eye className="w-4 h-4 mr-1 inline" />
                Preview
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="w-4 h-4 mr-1 inline" />
                Raw XML
              </button>
            </div>
            
            <button
              onClick={handleCopy}
              className="btn-primary flex items-center text-sm"
              disabled={!prompt}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="min-h-[400px]">
        {!isValid ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              Complete the form to generate a prompt
            </h4>
            <p className="text-gray-500 max-w-md">
              Fill in the required fields (Role and Task Description) to see your generated XML prompt here.
            </p>
            {errors.length > 0 && (
              <div className="mt-4 text-sm text-red-600">
                Missing: {errors.join(', ')}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border">
              {viewMode === 'formatted' ? (
                <div className="font-mono text-sm leading-relaxed">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: formatPromptForDisplay(prompt) 
                    }} 
                  />
                </div>
              ) : (
                <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                  {prompt}
                </pre>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {prompt.split('\n').length} lines • {prompt.length} characters
              </span>
              <span className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Ready to use with Claude Sonnet
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptPreview 