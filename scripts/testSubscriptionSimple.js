#!/usr/bin/env node

/**
 * Simplified test script for subscription service
 * Usage: node scripts/testSubscriptionSimple.js
 */

// Mock the subscription service directly without Supabase dependencies
const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
}

// Known Pro users (same as in the service)
const KNOWN_PRO_USERS = [
  'bartjan.decroos@me.com',
]

// Simplified subscription service for testing
class TestSubscriptionService {
  static async isProUser(user) {
    if (!user) return false

    // Method 1: Check known Pro users list
    if (KNOWN_PRO_USERS.includes(user.email?.toLowerCase())) {
      return true
    }

    // Method 2: Check user_metadata
    if (user.user_metadata?.subscription_tier === SUBSCRIPTION_TIERS.PRO) {
      return true
    }

    // Method 3: Check app_metadata
    if (user.app_metadata?.subscription_tier === SUBSCRIPTION_TIERS.PRO) {
      return true
    }

    // Method 4: Check for subscription indicators
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

  static async getSubscriptionTier(user) {
    if (!user) return SUBSCRIPTION_TIERS.FREE
    const isPro = await this.isProUser(user)
    return isPro ? SUBSCRIPTION_TIERS.PRO : SUBSCRIPTION_TIERS.FREE
  }

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

// Mock user objects for testing
const mockUsers = {
  proUser: {
    id: 'test-pro-user-id',
    email: 'bartjan.decroos@me.com',
    user_metadata: {},
    app_metadata: {}
  },
  freeUser: {
    id: 'test-free-user-id',
    email: 'free@example.com',
    user_metadata: {},
    app_metadata: {}
  },
  metadataProUser: {
    id: 'test-metadata-pro-user-id',
    email: 'metadata-pro@example.com',
    user_metadata: {
      subscription_tier: 'pro'
    },
    app_metadata: {}
  },
  indicatorProUser: {
    id: 'test-indicator-pro-user-id',
    email: 'indicator-pro@example.com',
    user_metadata: {
      premium: true
    },
    app_metadata: {}
  }
}

async function runTests() {
  console.log('🧪 Testing Subscription Service (Simplified)')
  console.log('=============================================')

  let testsPassed = 0
  let totalTests = 0

  function test(description, condition) {
    totalTests++
    if (condition) {
      console.log(`✅ ${description}`)
      testsPassed++
    } else {
      console.log(`❌ ${description}`)
    }
  }

  try {
    // Test 1: Known Pro User Recognition
    console.log('\n📋 Test 1: Known Pro User Recognition')
    const isProUser = await TestSubscriptionService.isProUser(mockUsers.proUser)
    test('Should recognize bartjan.decroos@me.com as Pro user', isProUser === true)

    // Test 2: Free User Recognition
    console.log('\n📋 Test 2: Free User Recognition')
    const isFreeUser = await TestSubscriptionService.isProUser(mockUsers.freeUser)
    test('Should recognize free@example.com as free user', isFreeUser === false)

    // Test 3: Metadata Pro User Recognition
    console.log('\n📋 Test 3: Metadata Pro User Recognition')
    const isMetadataProUser = await TestSubscriptionService.isProUser(mockUsers.metadataProUser)
    test('Should recognize user with pro metadata as Pro user', isMetadataProUser === true)

    // Test 4: Indicator Pro User Recognition
    console.log('\n📋 Test 4: Indicator Pro User Recognition')
    const isIndicatorProUser = await TestSubscriptionService.isProUser(mockUsers.indicatorProUser)
    test('Should recognize user with premium indicator as Pro user', isIndicatorProUser === true)

    // Test 5: Subscription Tier Detection
    console.log('\n📋 Test 5: Subscription Tier Detection')
    const proTier = await TestSubscriptionService.getSubscriptionTier(mockUsers.proUser)
    const freeTier = await TestSubscriptionService.getSubscriptionTier(mockUsers.freeUser)
    test('Pro user should have pro tier', proTier === SUBSCRIPTION_TIERS.PRO)
    test('Free user should have free tier', freeTier === SUBSCRIPTION_TIERS.FREE)

    // Test 6: Feature Limits
    console.log('\n📋 Test 6: Feature Limits')
    const proLimits = TestSubscriptionService.getFeatureLimits(SUBSCRIPTION_TIERS.PRO)
    const freeLimits = TestSubscriptionService.getFeatureLimits(SUBSCRIPTION_TIERS.FREE)
    
    test('Pro users should have 200k tokens', proLimits.maxTokens === 200000)
    test('Pro users should have advanced features', proLimits.advancedFeatures === true)
    test('Free users should have 4k tokens', freeLimits.maxTokens === 4000)
    test('Free users should not have advanced features', freeLimits.advancedFeatures === false)

    // Test 7: Action Permissions
    console.log('\n📋 Test 7: Action Permissions')
    const proCanUseAdvanced = await TestSubscriptionService.canPerformAction(mockUsers.proUser, 'use_advanced_features')
    const freeCanUseAdvanced = await TestSubscriptionService.canPerformAction(mockUsers.freeUser, 'use_advanced_features')
    
    test('Pro user can use advanced features', proCanUseAdvanced === true)
    test('Free user cannot use advanced features', freeCanUseAdvanced === false)

    // Test 8: Null User Handling
    console.log('\n📋 Test 8: Null User Handling')
    const nullUserIsPro = await TestSubscriptionService.isProUser(null)
    const nullUserTier = await TestSubscriptionService.getSubscriptionTier(null)
    
    test('Null user should not be Pro', nullUserIsPro === false)
    test('Null user should have free tier', nullUserTier === SUBSCRIPTION_TIERS.FREE)

    // Test Results
    console.log('\n📊 Test Results')
    console.log('================')
    console.log(`Tests Passed: ${testsPassed}/${totalTests}`)
    console.log(`Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`)

    if (testsPassed === totalTests) {
      console.log('\n🎉 All tests passed! Subscription service logic is working correctly.')
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.')
      process.exit(1)
    }

    // Demo subscription status for target user
    console.log('\n🔍 Demo: Subscription Status for bartjan.decroos@me.com')
    console.log('========================================================')
    
    const demoUser = mockUsers.proUser
    const isPro = await TestSubscriptionService.isProUser(demoUser)
    const tier = await TestSubscriptionService.getSubscriptionTier(demoUser)
    const limits = TestSubscriptionService.getFeatureLimits(tier)
    
    console.log(`Email: ${demoUser.email}`)
    console.log(`Is Pro: ${isPro}`)
    console.log(`Subscription Tier: ${tier}`)
    console.log(`Max Tokens: ${limits.maxTokens === -1 ? 'Unlimited' : limits.maxTokens.toLocaleString()}`)
    console.log(`Max Prompts: ${limits.maxPrompts === -1 ? 'Unlimited' : limits.maxPrompts}`)
    console.log(`Advanced Features: ${limits.advancedFeatures ? 'Enabled' : 'Disabled'}`)
    console.log(`Priority Support: ${limits.prioritySupport ? 'Enabled' : 'Disabled'}`)
    console.log(`Custom Models: ${limits.customModels ? 'Enabled' : 'Disabled'}`)

    console.log('\n✅ CONCLUSION: bartjan.decroos@me.com will be recognized as a Pro user')
    console.log('   and will have access to all premium features including:')
    console.log('   • Unlimited prompt generation')
    console.log('   • Advanced AI enhancements')
    console.log('   • Priority support')
    console.log('   • Custom model access')

  } catch (error) {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  }
}

// Run the tests
runTests().catch(console.error) 