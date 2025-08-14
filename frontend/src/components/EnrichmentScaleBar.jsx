import React, { useState, useCallback } from 'react'
import { Sparkles, Brain, Pen, Lightbulb, Info } from 'lucide-react'

const EnrichmentScaleBar = ({ 
  value = 50, 
  onChange, 
  disabled = false,
  className = '' 
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [tooltip, setTooltip] = useState(null)

  const handleChange = useCallback((e) => {
    const newValue = parseInt(e.target.value)
    onChange(newValue)
  }, [onChange])

  const handleMouseEnter = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const tooltipValue = Math.round(x)
    setTooltip(tooltipValue)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTooltip(null)
  }, [])

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const getScaleDescription = (value) => {
    if (value <= 15) return {
      label: "Minimal Enhancement",
      description: "Grammar and clarity fixes only - No new concepts",
      icon: <Pen className="w-4 h-4" />,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
    if (value <= 30) return {
      label: "Light Enhancement", 
      description: "Minor improvements and structure - Original meaning preserved",
      icon: <Pen className="w-4 h-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
    if (value <= 50) return {
      label: "Moderate Enhancement",
      description: "Balanced improvements with slight creativity - Close to original intent",
      icon: <Brain className="w-4 h-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
    if (value <= 70) return {
      label: "Creative Enhancement",
      description: "Significant creative improvements - Expanded concepts while maintaining core intent",
      icon: <Lightbulb className="w-4 h-4" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
    if (value <= 85) return {
      label: "High Enhancement",
      description: "Substantial creative additions - Some liberties may be taken",
      icon: <Sparkles className="w-4 h-4" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    }
    return {
      label: "Maximum Enhancement",
      description: "Full creative freedom - May introduce inaccuracies or assumptions",
      icon: <Sparkles className="w-4 h-4" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      warning: true
    }
  }

  const currentScale = getScaleDescription(value)

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How Enrichment Works</p>
            <p>This scale controls how much the AI can modify and expand your original prompt. Lower values preserve your exact meaning, while higher values allow more creative freedom but may introduce inaccuracies.</p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Enrichment Level</h4>
            <p className="text-sm text-gray-600">Control how much the AI can change and expand your prompt</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${currentScale.color}`}>
            {value}%
            {currentScale.warning && <span className="ml-1 text-red-500">⚠️</span>}
          </div>
          <div className={`text-xs ${currentScale.color.replace('600', '500')}`}>
            {currentScale.label}
          </div>
        </div>
      </div>

      {/* Scale Bar */}
      <div className="relative">
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {/* Background track */}
          <div className="w-full h-2 bg-gray-200 rounded-lg relative overflow-hidden">
            <div 
              className="h-full rounded-lg"
              style={{
                width: `${value}%`,
                background: `linear-gradient(to right, 
                  #10b981 0%, 
                  #3b82f6 20%, 
                  #8b5cf6 40%, 
                  #f59e0b 60%, 
                  #eab308 80%, 
                  #ef4444 100%
                )`
              }}
            />
          </div>
          
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={`
              absolute top-0 w-full h-2 bg-transparent appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isDragging ? 'scale-105' : ''}
              transition-transform duration-150
            `}
            aria-label="Enrichment Level"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={value}
            aria-valuetext={`${value}% - ${currentScale.label}`}
          />
          
          {/* Tooltip */}
          {tooltip !== null && (
            <div 
              className="absolute -top-10 px-2 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none transform -translate-x-1/2 whitespace-nowrap"
              style={{ left: `${tooltip}%` }}
            >
              {tooltip}%
            </div>
          )}
        </div>

        {/* Scale markers */}
        <div className="flex justify-between text-xs mt-2">
          <span className="text-green-600 font-medium">0%</span>
          <span className="text-blue-600">25%</span>
          <span className="text-purple-600">50%</span>
          <span className="text-orange-600">75%</span>
          <span className="text-red-600 font-medium">100%</span>
        </div>
      </div>

      {/* Current Level Description */}
      <div className={`${currentScale.bgColor} rounded-lg p-4 border ${currentScale.warning ? 'border-red-200' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2 mb-2">
          <span className={currentScale.color}>{currentScale.icon}</span>
          <span className={`font-medium ${currentScale.color}`}>{currentScale.label}</span>
          {currentScale.warning && (
            <span className="text-red-500 text-sm">⚠️ High Risk</span>
          )}
        </div>
        <p className={`text-sm ${currentScale.color.replace('600', '700')}`}>
          {currentScale.description}
        </p>
        {currentScale.warning && (
          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
            <strong>Warning:</strong> At this level, the AI may add information that wasn't in your original request or make assumptions that could be inaccurate.
          </div>
        )}
      </div>

      {/* Risk Level Guide */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs">
        <div className="font-medium text-gray-700 mb-2">Risk Level Guide:</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">0-15%: Safe - Only grammar and clarity fixes</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600">16-50%: Low Risk - Minor improvements, original meaning preserved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-600">51-85%: Medium Risk - Creative additions, some liberties taken</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">86-100%: High Risk - May add inaccurate information</span>
          </div>
        </div>
      </div>

      {/* Keyboard Instructions */}
      <div className="text-xs text-gray-500 text-center">
        Use arrow keys or click and drag to adjust the enrichment level
      </div>
    </div>
  )
}

export default EnrichmentScaleBar 