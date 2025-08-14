import { supabase, isAuthEnabled } from '../lib/supabase.js'

// Cache for subscription status to avoid repeated database calls
const subscriptionCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Known Pro users (fallback list for immediate access)
const KNOWN_PRO_USERS = [
  'bartjan.decroos@me.com',
  // Add other known Pro users here
]

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
}

export class SubscriptionService {
  /**
   * Check if a user has Pro access using multiple methods
   * @param {Object} user - The user object from Supabase
   * @returns {Promise<boolean>} - Whether the user has Pro access
   */
  static async isProUser(user) {
    if (!user) return false

    // Method 1: Check known Pro users list (immediate access)
    if (KNOWN_PRO_USERS.includes(user.email?.toLowerCase())) {
      return true
    }

    // Method 2: Check cache first
    const cacheKey = `pro_status_${user.id}`
    const cachedResult = subscriptionCache.get(cacheKey)
    
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return cachedResult.isPro
    }

    // Method 3: Check user_metadata
    if (user.user_metadata?.subscription_tier === SUBSCRIPTION_TIERS.PRO) {
      this.cacheResult(cacheKey, true)
      return true
    }

    // Method 4: Check app_metadata (set by Supabase admin or webhooks)
    if (user.app_metadata?.subscription_tier === SUBSCRIPTION_TIERS.PRO) {
      this.cacheResult(cacheKey, true)
      return true
    }

    // Method 5: Check profiles table in database
    if (isAuthEnabled) {
      try {
        const dbResult = await this.checkDatabaseSubscription(user.id)
        if (dbResult !== null) {
          this.cacheResult(cacheKey, dbResult)
          return dbResult
        }
      } catch (error) {
        console.warn('Failed to check database subscription:', error)
      }
    }

    // Method 6: Check for any subscription indicators
    const hasSubscriptionIndicators = this.hasSubscriptionIndicators(user)
    this.cacheResult(cacheKey, hasSubscriptionIndicators)
    
    return hasSubscriptionIndicators
  }

  /**
   * Get the user's subscription tier
   * @param {Object} user - The user object from Supabase
   * @returns {Promise<string>} - The subscription tier
   */
  static async getSubscriptionTier(user) {
    if (!user) return SUBSCRIPTION_TIERS.FREE

    const isPro = await this.isProUser(user)
    return isPro ? SUBSCRIPTION_TIERS.PRO : SUBSCRIPTION_TIERS.FREE
  }

  /**
   * Check subscription status in the database
   * @param {string} userId - The user ID
   * @returns {Promise<boolean|null>} - Pro status or null if not found
   */
  static async checkDatabaseSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, subscription_expires_at')
        .eq('id', userId)
        .single()

      if (error) {
        // If profiles table doesn't exist or user not found, return null
        if (error.code === 'PGRST116' || error.code === '42P01') {
          return null
        }
        throw error
      }

      if (!data) return null

      // Check if subscription is active and not expired
      const isActive = data.subscription_status === 'active'
      const isPro = data.subscription_tier === SUBSCRIPTION_TIERS.PRO
      const notExpired = !data.subscription_expires_at || 
                        new Date(data.subscription_expires_at) > new Date()

      return isActive && isPro && notExpired
    } catch (error) {
      console.error('Database subscription check failed:', error)
      return null
    }
  }

  /**
   * Check for any subscription indicators in user metadata
   * @param {Object} user - The user object
   * @returns {boolean} - Whether user has subscription indicators
   */
  static hasSubscriptionIndicators(user) {
    // Check various metadata fields that might indicate Pro status
    const metadata = { ...user.user_metadata, ...user.app_metadata }
    
    return !!(
      metadata.subscription_tier === SUBSCRIPTION_TIERS.PRO ||
      metadata.plan === 'pro' ||
      metadata.tier === 'pro' ||
      metadata.subscription === 'pro' ||
      metadata.is_pro === true ||
      metadata.premium === true ||
      metadata.paid === true
    )
  }

  /**
   * Update user's subscription status in the database
   * @param {string} userId - The user ID
   * @param {string} tier - The subscription tier
   * @param {string} status - The subscription status
   * @param {Date} expiresAt - When the subscription expires
   * @returns {Promise<boolean>} - Success status
   */
  static async updateSubscription(userId, tier, status = 'active', expiresAt = null) {
    if (!isAuthEnabled) return false

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          subscription_tier: tier,
          subscription_status: status,
          subscription_expires_at: expiresAt,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Clear cache for this user
      const cacheKey = `pro_status_${userId}`
      subscriptionCache.delete(cacheKey)

      return true
    } catch (error) {
      console.error('Failed to update subscription:', error)
      return false
    }
  }

  /**
   * Grant Pro access to a user (admin function)
   * @param {string} userEmail - The user's email
   * @returns {Promise<boolean>} - Success status
   */
  static async grantProAccess(userEmail) {
    if (!isAuthEnabled) return false

    try {
      // First, try to find the user
      const { data: users, error: userError } = await supabase.auth.admin.listUsers()
      
      if (userError) throw userError

      const user = users.users.find(u => u.email?.toLowerCase() === userEmail.toLowerCase())
      
      if (!user) {
        console.error('User not found:', userEmail)
        return false
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          subscription_tier: SUBSCRIPTION_TIERS.PRO
        }
      })

      if (updateError) throw updateError

      // Also update the profiles table
      await this.updateSubscription(user.id, SUBSCRIPTION_TIERS.PRO)

      // Clear cache
      const cacheKey = `pro_status_${user.id}`
      subscriptionCache.delete(cacheKey)

      console.log(`Pro access granted to ${userEmail}`)
      return true
    } catch (error) {
      console.error('Failed to grant Pro access:', error)
      return false
    }
  }

  /**
   * Cache a subscription result
   * @param {string} cacheKey - The cache key
   * @param {boolean} isPro - Whether the user is Pro
   */
  static cacheResult(cacheKey, isPro) {
    subscriptionCache.set(cacheKey, {
      isPro,
      timestamp: Date.now()
    })
  }

  /**
   * Clear subscription cache for a user
   * @param {string} userId - The user ID
   */
  static clearCache(userId) {
    const cacheKey = `pro_status_${userId}`
    subscriptionCache.delete(cacheKey)
  }

  /**
   * Clear all subscription cache
   */
  static clearAllCache() {
    subscriptionCache.clear()
  }

  /**
   * Get feature limits based on subscription tier
   * @param {string} tier - The subscription tier
   * @returns {Object} - Feature limits
   */
  static getFeatureLimits(tier) {
    switch (tier) {
      case SUBSCRIPTION_TIERS.PRO:
        return {
          maxTokens: 200000,
          maxPrompts: -1, // unlimited
          maxEnrichments: -1, // unlimited
          advancedFeatures: true,
          prioritySupport: true,
          customModels: true
        }
      case SUBSCRIPTION_TIERS.FREE:
      default:
        return {
          maxTokens: 4000,
          maxPrompts: 50,
          maxEnrichments: 10,
          advancedFeatures: false,
          prioritySupport: false,
          customModels: false
        }
    }
  }

  /**
   * Check if user can perform an action based on their subscription
   * @param {Object} user - The user object
   * @param {string} action - The action to check
   * @returns {Promise<boolean>} - Whether the action is allowed
   */
  static async canPerformAction(user, action) {
    const tier = await this.getSubscriptionTier(user)
    const limits = this.getFeatureLimits(tier)

    switch (action) {
      case 'use_advanced_features':
        return limits.advancedFeatures
      case 'unlimited_prompts':
        return limits.maxPrompts === -1
      case 'unlimited_enrichments':
        return limits.maxEnrichments === -1
      case 'priority_support':
        return limits.prioritySupport
      case 'custom_models':
        return limits.customModels
      default:
        return true
    }
  }
} 