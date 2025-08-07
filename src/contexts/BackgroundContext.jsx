import React, { createContext, useContext, useState, useEffect } from 'react'
import UserSettingsService from '../services/userSettingsService'

const BackgroundContext = createContext()

export const useBackground = () => {
  const context = useContext(BackgroundContext)
  if (!context) {
    throw new Error('useBackground must be used within a BackgroundProvider')
  }
  return context
}

export const BackgroundProvider = ({ children }) => {
  const [backgroundAnimation, setBackgroundAnimation] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBackgroundPreference()
  }, [])

  const loadBackgroundPreference = async () => {
    try {
      const userSettings = await UserSettingsService.getUserSettings()
      setBackgroundAnimation(userSettings.preferences_background_animation !== false)
    } catch (error) {
      console.error('Error loading background preference:', error)
      // Default to true if there's an error
      setBackgroundAnimation(true)
    } finally {
      setLoading(false)
    }
  }

  const updateBackgroundPreference = async (enabled) => {
    try {
      setBackgroundAnimation(enabled)
      await UserSettingsService.updatePreferences({
        backgroundAnimation: enabled,
        timezone: 'UTC',
        language: 'en',
        emailFrequency: 'weekly'
      })
    } catch (error) {
      console.error('Error updating background preference:', error)
    }
  }

  const value = {
    backgroundAnimation,
    updateBackgroundPreference,
    loading
  }

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  )
} 