import React, { createContext, useContext, useState, useEffect } from 'react'
import UserSettingsService from '../services/userSettingsService'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadThemePreference()
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const loadThemePreference = async () => {
    try {
      const userSettings = await UserSettingsService.getUserSettings()
      setTheme(userSettings.preferences_theme || 'light')
    } catch (error) {
      console.error('Error loading theme preference:', error)
      // Default to light theme if there's an error
      setTheme('light')
    } finally {
      setLoading(false)
    }
  }

  const updateTheme = async (newTheme) => {
    try {
      setTheme(newTheme)
      // Get current user settings to preserve existing values
      const currentSettings = await UserSettingsService.getUserSettings()
      await UserSettingsService.updatePreferences({
        theme: newTheme,
        backgroundAnimation: currentSettings.preferences_background_animation !== false, // Preserve current setting
        timezone: currentSettings.preferences_timezone || 'UTC',
        language: currentSettings.preferences_language || 'en',
        emailFrequency: currentSettings.preferences_email_frequency || 'weekly'
      })
    } catch (error) {
      console.error('Error updating theme preference:', error)
    }
  }

  const applyTheme = (theme) => {
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }

  const value = {
    theme,
    updateTheme,
    loading
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
} 