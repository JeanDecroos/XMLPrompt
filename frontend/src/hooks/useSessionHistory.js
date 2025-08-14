import { useState, useCallback, useRef } from 'react'

const MAX_HISTORY_SIZE = 50 // Prevent memory issues

export const useSessionHistory = (initialState) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [history, setHistory] = useState([initialState])
  const isNavigating = useRef(false)

  // Add a new state to history
  const pushState = useCallback((newState) => {
    if (isNavigating.current) {
      // Don't add to history when navigating through it
      return
    }

    setHistory(prev => {
      // Remove any future history when adding a new state
      const newHistory = prev.slice(0, currentIndex + 1)
      newHistory.push(newState)
      
      // Limit history size to prevent memory issues
      if (newHistory.length > MAX_HISTORY_SIZE) {
        return newHistory.slice(-MAX_HISTORY_SIZE)
      }
      
      return newHistory
    })
    
    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, MAX_HISTORY_SIZE - 1)
      return newIndex
    })
  }, [currentIndex])

  // Navigate to previous state (undo)
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isNavigating.current = true
      setCurrentIndex(prev => prev - 1)
      // Reset navigation flag after state update
      setTimeout(() => {
        isNavigating.current = false
      }, 0)
      return history[currentIndex - 1]
    }
    return null
  }, [currentIndex, history])

  // Navigate to next state (redo)
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isNavigating.current = true
      setCurrentIndex(prev => prev + 1)
      // Reset navigation flag after state update
      setTimeout(() => {
        isNavigating.current = false
      }, 0)
      return history[currentIndex + 1]
    }
    return null
  }, [currentIndex, history])

  // Clear history and reset to initial state
  const clearHistory = useCallback(() => {
    setHistory([initialState])
    setCurrentIndex(0)
    isNavigating.current = false
  }, [initialState])

  // Get current state
  const getCurrentState = useCallback(() => {
    return history[currentIndex] || initialState
  }, [history, currentIndex, initialState])

  // Check if undo is possible
  const canUndo = currentIndex > 0

  // Check if redo is possible
  const canRedo = currentIndex < history.length - 1

  // Get history statistics
  const getHistoryStats = useCallback(() => {
    return {
      current: currentIndex + 1,
      total: history.length,
      canUndo,
      canRedo
    }
  }, [currentIndex, history.length, canUndo, canRedo])

  return {
    pushState,
    undo,
    redo,
    clearHistory,
    getCurrentState,
    canUndo,
    canRedo,
    getHistoryStats
  }
} 