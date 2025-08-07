import { supabase } from '../lib/supabase'

class UserSettingsService {
  /**
   * Get all user settings for the current user
   */
  static async getUserSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase.rpc('get_user_settings', {
        user_id: user.id
      })

      if (error) {
        console.error('Error fetching user settings:', error)
        throw error
      }

      return data || {}
    } catch (error) {
      console.error('Failed to get user settings:', error)
      throw error
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase.rpc('update_user_notification_settings', {
        user_id: user.id,
        settings: settings
      })

      if (error) {
        console.error('Error updating notification settings:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to update notification settings:', error)
      throw error
    }
  }

  /**
   * Update privacy settings
   */
  static async updatePrivacySettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase.rpc('update_user_privacy_settings', {
        user_id: user.id,
        settings: settings
      })

      if (error) {
        console.error('Error updating privacy settings:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Failed to update privacy settings:', error)
      throw error
    }
  }

  /**
   * Update security settings (2FA)
   */
  static async updateSecuritySettings(settings) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          security_two_factor_enabled: settings.twoFactorEnabled,
          security_two_factor_secret: settings.twoFactorSecret,
          security_backup_codes: settings.backupCodes,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('Error updating security settings:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Failed to update security settings:', error)
      throw error
    }
  }

  /**
   * Update payment methods (Stripe-specific)
   */
  static async updatePaymentMethods(paymentMethods, defaultMethodId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Validate Stripe payment method structure
      const validatedMethods = paymentMethods.map(method => ({
        id: method.id, // Stripe PaymentMethod ID (pm_...)
        type: method.type, // 'card', 'bank_account', etc.
        last4: method.last4,
        brand: method.brand, // 'visa', 'mastercard', etc.
        expiry_month: method.expiry_month,
        expiry_year: method.expiry_year,
        country: method.country,
        funding: method.funding, // 'credit', 'debit', 'prepaid'
        name: method.name || `${method.brand} ending in ${method.last4}`,
        isDefault: method.isDefault || false
      }))

      const { data, error } = await supabase
        .from('profiles')
        .update({
          payment_methods: validatedMethods,
          payment_default_method_id: defaultMethodId,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('Error updating payment methods:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Failed to update payment methods:', error)
      throw error
    }
  }

  /**
   * Update billing history
   */
  static async updateBillingHistory(billingHistory) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          billing_history: billingHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('Error updating billing history:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Failed to update billing history:', error)
      throw error
    }
  }

  /**
   * Update general preferences
   */
  static async updatePreferences(preferences) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const updateData = {
        updated_at: new Date().toISOString()
      }

      // Handle standard preferences
      if (preferences.timezone !== undefined) updateData.preferences_timezone = preferences.timezone
      if (preferences.language !== undefined) updateData.preferences_language = preferences.language
      if (preferences.theme !== undefined) updateData.preferences_theme = preferences.theme
      if (preferences.emailFrequency !== undefined) updateData.preferences_email_frequency = preferences.emailFrequency
      if (preferences.backgroundAnimation !== undefined) updateData.preferences_background_animation = preferences.backgroundAnimation

      // Handle privacy settings
      if (preferences.dataRetentionPolicy !== undefined) updateData.data_retention_policy = preferences.dataRetentionPolicy
      if (preferences.dataAnalyticsOptOut !== undefined) updateData.data_analytics_opt_out = preferences.dataAnalyticsOptOut
      if (preferences.marketingOptOut !== undefined) updateData.marketing_opt_out = preferences.marketingOptOut
      if (preferences.dataExportConsent !== undefined) updateData.data_export_consent = preferences.dataExportConsent
      if (preferences.dataProcessingConsent !== undefined) updateData.data_processing_consent = preferences.dataProcessingConsent

      // Handle GDPR settings
      if (preferences.gdprConsentGiven !== undefined) {
        if (preferences.gdprConsentGiven) {
          updateData.gdpr_consent_given_at = new Date().toISOString()
          updateData.gdpr_consent_version = '1.0'
        } else {
          updateData.gdpr_consent_given_at = null
        }
      }
      if (preferences.rightToBeForgottenRequested !== undefined) updateData.right_to_be_forgotten_requested = preferences.rightToBeForgottenRequested
      if (preferences.dataPortabilityRequested !== undefined) updateData.data_portability_requested = preferences.dataPortabilityRequested

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('Error updating preferences:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Failed to update preferences:', error)
      throw error
    }
  }

  /**
   * Update export preferences
   */
  static async updateExportPreferences(exportPreferences) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          export_preferences: exportPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('Error updating export preferences:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Failed to update export preferences:', error)
      throw error
    }
  }

  /**
   * Update login history
   */
  static async updateLoginHistory(loginEntry) {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get current login history
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('security_login_history, security_last_login_at')
        .eq('id', user.id)
        .single()

      const currentHistory = currentProfile?.security_login_history || []
      const updatedHistory = [loginEntry, ...currentHistory].slice(0, 50) // Keep last 50 entries

      const { data, error } = await supabase
        .from('profiles')
        .update({
          security_login_history: updatedHistory,
          security_last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()

      if (error) {
        console.error('Error updating login history:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      console.error('Failed to update login history:', error)
      throw error
    }
  }

  /**
   * Get login history
   */
  static async getLoginHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('security_login_history, security_last_login_at')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching login history:', error)
        throw error
      }

      return {
        loginHistory: data?.security_login_history || [],
        lastLoginAt: data?.security_last_login_at
      }
    } catch (error) {
      console.error('Failed to get login history:', error)
      throw error
    }
  }

  /**
   * Get payment methods
   */
  static async getPaymentMethods() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('payment_methods, payment_default_method_id')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching payment methods:', error)
        throw error
      }

      return {
        paymentMethods: data?.payment_methods || [],
        defaultMethodId: data?.payment_default_method_id
      }
    } catch (error) {
      console.error('Failed to get payment methods:', error)
      throw error
    }
  }

  /**
   * Get billing history
   */
  static async getBillingHistory() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('billing_history')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching billing history:', error)
        throw error
      }

      return data?.billing_history || []
    } catch (error) {
      console.error('Failed to get billing history:', error)
      throw error
    }
  }
}

export default UserSettingsService 