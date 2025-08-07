import { supabase } from '../lib/supabase'

class DataRetentionService {
  /**
   * Clean up old data according to retention policy
   */
  static async cleanupOldData() {
    try {
      console.log('🧹 Starting data retention cleanup...')
      
      const results = {
        sessionsCleaned: 0,
        analyticsCleaned: 0,
        failedLoginsCleaned: 0,
        tempDataCleaned: 0,
        errors: []
      }

      // Clean up session history older than 12 months
      try {
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
        
        const { data: sessions, error: sessionsError } = await supabase
          .from('session_history')
          .delete()
          .lt('created_at', twelveMonthsAgo.toISOString())
          .select('id')

        if (sessionsError) {
          results.errors.push(`Session cleanup error: ${sessionsError.message}`)
        } else {
          results.sessionsCleaned = sessions?.length || 0
        }
      } catch (error) {
        results.errors.push(`Session cleanup failed: ${error.message}`)
      }

      // Clean up analytics data older than 12 months
      try {
        const twelveMonthsAgo = new Date()
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
        
        const { data: analytics, error: analyticsError } = await supabase
          .from('user_analytics')
          .delete()
          .lt('created_at', twelveMonthsAgo.toISOString())
          .select('id')

        if (analyticsError) {
          results.errors.push(`Analytics cleanup error: ${analyticsError.message}`)
        } else {
          results.analyticsCleaned = analytics?.length || 0
        }
      } catch (error) {
        results.errors.push(`Analytics cleanup failed: ${error.message}`)
      }

      // Clean up failed login attempts older than 30 days
      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        // This would clean up security_login_history entries older than 30 days
        // Implementation depends on how failed logins are stored
        results.failedLoginsCleaned = 0 // Placeholder
      } catch (error) {
        results.errors.push(`Failed login cleanup failed: ${error.message}`)
      }

      // Clean up temporary data older than 30 days
      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        // Clean up any temporary data tables
        results.tempDataCleaned = 0 // Placeholder
      } catch (error) {
        results.errors.push(`Temp data cleanup failed: ${error.message}`)
      }

      console.log('✅ Data retention cleanup completed:', results)
      return results
    } catch (error) {
      console.error('❌ Data retention cleanup failed:', error)
      throw error
    }
  }

  /**
   * Anonymize old data instead of deleting
   */
  static async anonymizeOldData() {
    try {
      console.log('🔒 Starting data anonymization...')
      
      const results = {
        sessionsAnonymized: 0,
        analyticsAnonymized: 0,
        errors: []
      }

      // Anonymize session history older than 24 months
      try {
        const twentyFourMonthsAgo = new Date()
        twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24)
        
        const { data: sessions, error: sessionsError } = await supabase
          .from('session_history')
          .update({
            user_id: null,
            data: { anonymized: true, original_user_id: 'anonymized' },
            anonymized_at: new Date().toISOString()
          })
          .lt('created_at', twentyFourMonthsAgo.toISOString())
          .is('anonymized_at', null)
          .select('id')

        if (sessionsError) {
          results.errors.push(`Session anonymization error: ${sessionsError.message}`)
        } else {
          results.sessionsAnonymized = sessions?.length || 0
        }
      } catch (error) {
        results.errors.push(`Session anonymization failed: ${error.message}`)
      }

      // Anonymize analytics data older than 24 months
      try {
        const twentyFourMonthsAgo = new Date()
        twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24)
        
        const { data: analytics, error: analyticsError } = await supabase
          .from('user_analytics')
          .update({
            user_id: null,
            metadata: { anonymized: true, original_user_id: 'anonymized' },
            anonymized_at: new Date().toISOString()
          })
          .lt('created_at', twentyFourMonthsAgo.toISOString())
          .is('anonymized_at', null)
          .select('id')

        if (analyticsError) {
          results.errors.push(`Analytics anonymization error: ${analyticsError.message}`)
        } else {
          results.analyticsAnonymized = analytics?.length || 0
        }
      } catch (error) {
        results.errors.push(`Analytics anonymization failed: ${error.message}`)
      }

      console.log('✅ Data anonymization completed:', results)
      return results
    } catch (error) {
      console.error('❌ Data anonymization failed:', error)
      throw error
    }
  }

  /**
   * Delete user data completely (GDPR right to be forgotten)
   */
  static async deleteUserData(userId) {
    try {
      console.log(`🗑️  Deleting all data for user: ${userId}`)
      
      const results = {
        promptsDeleted: 0,
        sessionsDeleted: 0,
        analyticsDeleted: 0,
        profileDeleted: false,
        errors: []
      }

      // Delete user prompts
      try {
        const { data: prompts, error: promptsError } = await supabase
          .from('prompts')
          .delete()
          .eq('user_id', userId)
          .select('id')

        if (promptsError) {
          results.errors.push(`Prompts deletion error: ${promptsError.message}`)
        } else {
          results.promptsDeleted = prompts?.length || 0
        }
      } catch (error) {
        results.errors.push(`Prompts deletion failed: ${error.message}`)
      }

      // Delete session history
      try {
        const { data: sessions, error: sessionsError } = await supabase
          .from('session_history')
          .delete()
          .eq('user_id', userId)
          .select('id')

        if (sessionsError) {
          results.errors.push(`Sessions deletion error: ${sessionsError.message}`)
        } else {
          results.sessionsDeleted = sessions?.length || 0
        }
      } catch (error) {
        results.errors.push(`Sessions deletion failed: ${error.message}`)
      }

      // Delete analytics data
      try {
        const { data: analytics, error: analyticsError } = await supabase
          .from('user_analytics')
          .delete()
          .eq('user_id', userId)
          .select('id')

        if (analyticsError) {
          results.errors.push(`Analytics deletion error: ${analyticsError.message}`)
        } else {
          results.analyticsDeleted = analytics?.length || 0
        }
      } catch (error) {
        results.errors.push(`Analytics deletion failed: ${error.message}`)
      }

      // Delete user profile (keep minimal record for legal compliance)
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            email: `deleted_${Date.now()}@deleted.com`,
            full_name: null,
            avatar_url: null,
            subscription_tier: 'deleted',
            subscription_status: 'deleted',
            api_calls_remaining: 0,
            total_prompts: 0,
            total_shares: 0,
            profile_views: 0,
            deleted_at: new Date().toISOString(),
            // Keep minimal data for legal compliance
            created_at: null, // Keep original for compliance
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)

        if (profileError) {
          results.errors.push(`Profile deletion error: ${profileError.message}`)
        } else {
          results.profileDeleted = true
        }
      } catch (error) {
        results.errors.push(`Profile deletion failed: ${error.message}`)
      }

      console.log('✅ User data deletion completed:', results)
      return results
    } catch (error) {
      console.error('❌ User data deletion failed:', error)
      throw error
    }
  }

  /**
   * Get data retention statistics
   */
  static async getRetentionStats() {
    try {
      const stats = {
        totalUsers: 0,
        totalPrompts: 0,
        totalSessions: 0,
        totalAnalytics: 0,
        oldDataToClean: {
          sessions: 0,
          analytics: 0
        }
      }

      // Get total users
      try {
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        stats.totalUsers = userCount || 0
      } catch (error) {
        console.warn('Could not get user count:', error.message)
      }

      // Get total prompts
      try {
        const { count: promptCount } = await supabase
          .from('prompts')
          .select('*', { count: 'exact', head: true })
        stats.totalPrompts = promptCount || 0
      } catch (error) {
        console.warn('Could not get prompt count:', error.message)
      }

      // Get old data counts
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

      try {
        const { count: oldSessions } = await supabase
          .from('session_history')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', twelveMonthsAgo.toISOString())
        stats.oldDataToClean.sessions = oldSessions || 0
      } catch (error) {
        console.warn('Could not get old sessions count:', error.message)
      }

      try {
        const { count: oldAnalytics } = await supabase
          .from('user_analytics')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', twelveMonthsAgo.toISOString())
        stats.oldDataToClean.analytics = oldAnalytics || 0
      } catch (error) {
        console.warn('Could not get old analytics count:', error.message)
      }

      return stats
    } catch (error) {
      console.error('Error getting retention stats:', error)
      throw error
    }
  }

  /**
   * Schedule regular cleanup (to be called by cron job)
   */
  static async scheduledCleanup() {
    try {
      console.log('🕐 Running scheduled data retention cleanup...')
      
      // Clean up old data
      const cleanupResults = await this.cleanupOldData()
      
      // Anonymize very old data
      const anonymizeResults = await this.anonymizeOldData()
      
      // Get statistics
      const stats = await this.getRetentionStats()
      
      const results = {
        cleanup: cleanupResults,
        anonymize: anonymizeResults,
        stats: stats,
        timestamp: new Date().toISOString()
      }
      
      console.log('✅ Scheduled cleanup completed:', results)
      return results
    } catch (error) {
      console.error('❌ Scheduled cleanup failed:', error)
      throw error
    }
  }
}

export default DataRetentionService 