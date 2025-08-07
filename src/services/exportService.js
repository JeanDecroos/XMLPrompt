import { supabase } from '../lib/supabase'
import UserSettingsService from './userSettingsService'

class ExportService {
  /**
   * Export user data based on selected options
   */
  static async exportUserData(selectedData, format) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const exportData = {}

      // Export prompts and templates
      if (selectedData.prompts) {
        exportData.prompts = await this.getUserPrompts(user.id)
      }

      // Export usage history
      if (selectedData.usage) {
        exportData.usage = await this.getUserUsageHistory(user.id)
      }

      // Export profile data
      if (selectedData.profile) {
        exportData.profile = await this.getUserProfile(user.id)
      }

      // Export settings
      if (selectedData.settings) {
        exportData.settings = await this.getUserSettings(user.id)
      }

      // Add metadata
      exportData.metadata = {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        format: format,
        version: '1.0'
      }

      // Format the data based on selected format
      const formattedData = await this.formatExportData(exportData, format)

      // Save export preferences
      await this.saveExportPreferences(selectedData, format)

      return formattedData
    } catch (error) {
      console.error('Export failed:', error)
      throw error
    }
  }

  /**
   * Get user prompts and templates (privacy-safe)
   */
  static async getUserPrompts(userId) {
    try {
      const { data: prompts, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Sanitize prompts to remove sensitive data
      const safePrompts = (prompts || []).map(prompt => ({
        // User content (safe to export)
        title: prompt.title,
        description: prompt.description,
        category: prompt.category,
        tags: prompt.tags,
        role: prompt.role,
        task: prompt.task,
        context: prompt.context,
        requirements: prompt.requirements,
        style: prompt.style,
        output: prompt.output,
        raw_prompt: prompt.raw_prompt,
        enriched_prompt: prompt.enriched_prompt,
        
        // Metadata (safe to export)
        selected_model: prompt.selected_model,
        quality_score: prompt.quality_score,
        token_count: prompt.token_count,
        is_favorite: prompt.is_favorite,
        is_template: prompt.is_template,
        version: prompt.version,
        
        // Timestamps (safe to export)
        created_at: prompt.created_at,
        updated_at: prompt.updated_at,
        published_at: prompt.published_at
      }))

      return {
        count: safePrompts.length,
        prompts: safePrompts
      }
    } catch (error) {
      console.error('Error fetching prompts:', error)
      return { count: 0, prompts: [], error: error.message }
    }
  }

  /**
   * Get user usage history (privacy-safe, aggregated)
   */
  static async getUserUsageHistory(userId) {
    try {
      // Get session history (limited and sanitized)
      let sessions = []
      try {
        const { data: sessionData, error: sessionsError } = await supabase
          .from('session_history')
          .select('session_type, created_at, data')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100) // Limit to last 100 sessions

        if (!sessionsError && sessionData) {
          sessions = sessionData.map(session => ({
            session_type: session.session_type,
            created_at: session.created_at,
            // Only include non-sensitive data
            data_summary: session.data ? {
              features_used: session.data.features_used || [],
              duration: session.data.duration,
              success: session.data.success
            } : null
          }))
        }
      } catch (error) {
        console.warn('Session history table may not exist:', error.message)
      }

      // Get analytics data (aggregated only)
      let analytics = []
      try {
        const { data: analyticsData, error: analyticsError } = await supabase
          .from('user_analytics')
          .select('event_type, created_at, metadata')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50) // Limit to last 50 events

        if (!analyticsError && analyticsData) {
          analytics = analyticsData.map(event => ({
            event_type: event.event_type,
            created_at: event.created_at,
            // Only include non-sensitive metadata
            metadata_summary: event.metadata ? {
              feature: event.metadata.feature,
              success: event.metadata.success,
              duration: event.metadata.duration
            } : null
          }))
        }
      } catch (error) {
        console.warn('Analytics table may not exist:', error.message)
      }

      return {
        sessions: {
          count: sessions.length,
          data: sessions
        },
        analytics: {
          count: analytics.length,
          data: analytics
        }
      }
    } catch (error) {
      console.error('Error fetching usage history:', error)
      return { 
        sessions: { count: 0, data: [] }, 
        analytics: { count: 0, data: [] }, 
        error: error.message 
      }
    }
  }

  /**
   * Get user profile data (privacy-safe)
   */
  static async getUserProfile(userId) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Create a privacy-safe profile with only necessary data
      const safeProfile = {
        // Basic account info (safe to export)
        email: profile.email,
        subscription_tier: profile.subscription_tier,
        subscription_status: profile.subscription_status,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        
        // Privacy settings (user's own choices)
        privacy_profile_visibility: profile.privacy_profile_visibility,
        privacy_prompt_sharing: profile.privacy_prompt_sharing,
        privacy_data_analytics: profile.privacy_data_analytics,
        privacy_third_party_sharing: profile.privacy_third_party_sharing,
        privacy_search_visibility: profile.privacy_search_visibility,
        
        // Notification preferences (user's own choices)
        notification_email: profile.notification_email,
        notification_prompt_reminders: profile.notification_prompt_reminders,
        notification_usage_alerts: profile.notification_usage_alerts,
        notification_security_alerts: profile.notification_security_alerts,
        notification_marketing_emails: profile.notification_marketing_emails,
        notification_weekly_digest: profile.notification_weekly_digest,
        
        // Theme and UI preferences (user's own choices)
        preferences_theme: profile.preferences_theme,
        preferences_language: profile.preferences_language,
        preferences_timezone: profile.preferences_timezone,
        preferences_email_frequency: profile.preferences_email_frequency,
        preferences_background_animation: profile.preferences_background_animation,
        
        // Export preferences (user's own choices)
        export_preferences: profile.export_preferences,
        
        // Basic usage stats (aggregated, not detailed)
        total_prompts: profile.total_prompts,
        total_shares: profile.total_shares,
        profile_views: profile.profile_views,
        last_active_at: profile.last_active_at
      }

      return safeProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return { error: error.message }
    }
  }

  /**
   * Get user settings
   */
  static async getUserSettings(userId) {
    try {
      const userSettings = await UserSettingsService.getUserSettings()
      return userSettings
    } catch (error) {
      console.error('Error fetching settings:', error)
      return { error: error.message }
    }
  }

  /**
   * Format export data based on selected format
   */
  static async formatExportData(data, format) {
    switch (format) {
      case 'json':
        return {
          data: JSON.stringify(data, null, 2),
          filename: `export_${new Date().toISOString().split('T')[0]}.json`,
          mimeType: 'application/json'
        }

      case 'csv':
        return {
          data: this.convertToCSV(data),
          filename: `export_${new Date().toISOString().split('T')[0]}.csv`,
          mimeType: 'text/csv'
        }

      case 'zip':
        return {
          data: await this.createZipArchive(data),
          filename: `export_${new Date().toISOString().split('T')[0]}.zip`,
          mimeType: 'application/zip'
        }

      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Convert data to CSV format
   */
  static convertToCSV(data) {
    const csvRows = []
    
    // Add metadata
    csvRows.push(['Metadata', 'Value'])
    csvRows.push(['Exported At', data.metadata?.exportedAt || ''])
    csvRows.push(['User ID', data.metadata?.userId || ''])
    csvRows.push(['Format', data.metadata?.format || ''])
    csvRows.push([])

    // Add prompts
    if (data.prompts?.prompts?.length > 0) {
      csvRows.push(['Prompts'])
      csvRows.push(['ID', 'Title', 'Content', 'Created At', 'Updated At'])
      data.prompts.prompts.forEach(prompt => {
        csvRows.push([
          prompt.id,
          prompt.title || '',
          prompt.content || '',
          prompt.created_at || '',
          prompt.updated_at || ''
        ])
      })
      csvRows.push([])
    }

    // Add usage sessions
    if (data.usage?.sessions?.data?.length > 0) {
      csvRows.push(['Usage Sessions'])
      csvRows.push(['ID', 'Session Type', 'Created At', 'Data'])
      data.usage.sessions.data.forEach(session => {
        csvRows.push([
          session.id,
          session.session_type || '',
          session.created_at || '',
          JSON.stringify(session.data || {})
        ])
      })
      csvRows.push([])
    }

    // Add profile data
    if (data.profile && !data.profile.error) {
      csvRows.push(['Profile Data'])
      csvRows.push(['Field', 'Value'])
      Object.entries(data.profile).forEach(([key, value]) => {
        if (typeof value === 'object') {
          csvRows.push([key, JSON.stringify(value)])
        } else {
          csvRows.push([key, value])
        }
      })
    }

    return csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
  }

  /**
   * Create ZIP archive (simplified implementation)
   */
  static async createZipArchive(data) {
    // For now, return JSON data as a simple implementation
    // In a real implementation, you would use a library like JSZip
    const jsonData = JSON.stringify(data, null, 2)
    return btoa(jsonData) // Base64 encode for demo
  }

  /**
   * Save export preferences
   */
  static async saveExportPreferences(selectedData, format) {
    try {
      await UserSettingsService.updateExportPreferences({
        include_prompts: selectedData.prompts,
        include_usage: selectedData.usage,
        include_profile: selectedData.profile,
        include_settings: selectedData.settings,
        format: format
      })
    } catch (error) {
      console.error('Error saving export preferences:', error)
      // Don't throw error as this is not critical
    }
  }

  /**
   * Download file
   */
  static downloadFile(data, filename, mimeType) {
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Get export preferences
   */
  static async getExportPreferences() {
    try {
      const userSettings = await UserSettingsService.getUserSettings()
      return userSettings.export || {
        include_prompts: true,
        include_usage: true,
        include_profile: true,
        include_settings: false,
        format: 'json'
      }
    } catch (error) {
      console.error('Error loading export preferences:', error)
      return {
        include_prompts: true,
        include_usage: true,
        include_profile: true,
        include_settings: false,
        format: 'json'
      }
    }
  }
}

export default ExportService 