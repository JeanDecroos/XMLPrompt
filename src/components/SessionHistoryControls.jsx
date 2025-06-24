import React from 'react'
import { Undo2, Redo2, RotateCcw, Clock } from 'lucide-react'

const SessionHistoryControls = ({ 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo, 
  onClear,
  historyStats,
  className = '' 
}) => {
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const cmdKey = isMac ? '⌘' : 'Ctrl'

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Undo Button */}
      <button
        onClick={onUndo}
        onKeyDown={(e) => handleKeyDown(e, onUndo)}
        disabled={!canUndo}
        className={`
          inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${canUndo 
            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
        title={canUndo ? `Undo (${cmdKey}+Z) - Step ${historyStats.current - 1}/${historyStats.total}` : 'No changes to undo'}
        aria-label={canUndo ? `Undo last change. Currently at step ${historyStats.current} of ${historyStats.total}. Use ${cmdKey}+Z` : 'No changes to undo'}
      >
        <Undo2 className="w-4 h-4 mr-1.5" />
        Undo
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        onKeyDown={(e) => handleKeyDown(e, onRedo)}
        disabled={!canRedo}
        className={`
          inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${canRedo 
            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' 
            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          }
        `}
        title={canRedo ? `Redo (${cmdKey}+Y) - Step ${historyStats.current + 1}/${historyStats.total}` : 'No changes to redo'}
        aria-label={canRedo ? `Redo next change. Currently at step ${historyStats.current} of ${historyStats.total}. Use ${cmdKey}+Y` : 'No changes to redo'}
      >
        <Redo2 className="w-4 h-4 mr-1.5" />
        Redo
      </button>

      {/* History Status Indicator */}
      {historyStats.total > 1 && (
        <div className="flex items-center px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
          <Clock className="w-3 h-3 mr-1" />
          <span>{historyStats.current}/{historyStats.total}</span>
        </div>
      )}

      {/* Clear History Button (only show if there's history) */}
      {historyStats.total > 1 && (
        <button
          onClick={onClear}
          onKeyDown={(e) => handleKeyDown(e, onClear)}
          className="inline-flex items-center px-2 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          title="Clear session history"
          aria-label="Clear all session history"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default SessionHistoryControls 