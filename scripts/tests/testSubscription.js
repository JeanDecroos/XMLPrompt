#!/usr/bin/env node

/**
 * Test script for subscription service
 * Usage: node scripts/testSubscription.js
 */

import { SubscriptionService, SUBSCRIPTION_TIERS } from '../src/services/subscriptionService.js'

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
  }
}

async function runTests() {
  console.log('🧪 Testing Subscription Service')
  console.log('================================')

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
    const isProUser = await SubscriptionService.isProUser(mockUsers.proUser)
    test('Should recognize bartjan.decroos@me.com as Pro user', isProUser === true)

    // Test 2: Free User Recognition
    console.log('\n📋 Test 2: Free User Recognition')
    const isFreeUser = await SubscriptionService.isProUser(mockUsers.freeUser)
    test('Should recognize free@example.com as free user', isFreeUser === false)

    // Test 3: Metadata Pro User Recognition
    console.log('\n📋 Test 3: Metadata Pro User Recognition')
    const isMetadataProUser = await SubscriptionService.isProUser(mockUsers.metadataProUser)
    test('Should recognize user with pro metadata as Pro user', isMetadataProUser === true)

    // Test 4: Subscription Tier Detection
    console.log('\n📋 Test 4: Subscription Tier Detection')
    const proTier = await SubscriptionService.getSubscriptionTier(mockUsers.proUser)
    const freeTier = await SubscriptionService.getSubscriptionTier(mockUsers.freeUser)
    test('Pro user should have pro tier', proTier === SUBSCRIPTION_TIERS.PRO)
    test('Free user should have free tier', freeTier === SUBSCRIPTION_TIERS.FREE)

    // Test 5: Feature Limits
    console.log('\n📋 Test 5: Feature Limits')
    const proLimits = SubscriptionService.getFeatureLimits(SUBSCRIPTION_TIERS.PRO)
    const freeLimits = SubscriptionService.getFeatureLimits(SUBSCRIPTION_TIERS.FREE)
    
    test('Pro users should have unlimited tokens', proLimits.maxTokens === 200000)
    test('Pro users should have advanced features', proLimits.advancedFeatures === true)
    test('Free users should have limited tokens', freeLimits.maxTokens === 4000)
    test('Free users should not have advanced features', freeLimits.advancedFeatures === false)

    // Test 6: Action Permissions
    console.log('\n📋 Test 6: Action Permissions')
    const proCanUseAdvanced = await SubscriptionService.canPerformAction(mockUsers.proUser, 'use_advanced_features')
    const freeCanUseAdvanced = await SubscriptionService.canPerformAction(mockUsers.freeUser, 'use_advanced_features')
    
    test('Pro user can use advanced features', proCanUseAdvanced === true)
    test('Free user cannot use advanced features', freeCanUseAdvanced === false)

    // Test 7: Subscription Indicators
    console.log('\n📋 Test 7: Subscription Indicators')
    const userWithIndicators = {
      id: 'test-indicators-user',
      email: 'indicators@example.com',
      user_metadata: { premium: true },
      app_metadata: {}
    }
    
    const hasIndicators = SubscriptionService.hasSubscriptionIndicators(userWithIndicators)
    test('Should detect subscription indicators', hasIndicators === true)

    // Test 8: Caching
    console.log('\n📋 Test 8: Caching')
    // Clear cache and test again
    SubscriptionService.clearCache(mockUsers.proUser.id)
    const isProUserCached = await SubscriptionService.isProUser(mockUsers.proUser)
    test('Caching should not affect Pro user recognition', isProUserCached === true)

    // Test 9: Null User Handling
    console.log('\n📋 Test 9: Null User Handling')
    const nullUserIsPro = await SubscriptionService.isProUser(null)
    const nullUserTier = await SubscriptionService.getSubscriptionTier(null)
    
    test('Null user should not be Pro', nullUserIsPro === false)
    test('Null user should have free tier', nullUserTier === SUBSCRIPTION_TIERS.FREE)

    // Test Results
    console.log('\n📊 Test Results')
    console.log('================')
    console.log(`Tests Passed: ${testsPassed}/${totalTests}`)
    console.log(`Success Rate: ${Math.round((testsPassed / totalTests) * 100)}%`)

    if (testsPassed === totalTests) {
      console.log('\n🎉 All tests passed! Subscription service is working correctly.')
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.')
    }

    // Demo subscription status for known Pro user
    console.log('\n🔍 Demo: Subscription Status for bartjan.decroos@me.com')
    console.log('========================================================')
    
    const demoUser = mockUsers.proUser
    const isPro = await SubscriptionService.isProUser(demoUser)
    const tier = await SubscriptionService.getSubscriptionTier(demoUser)
    const limits = SubscriptionService.getFeatureLimits(tier)
    
    console.log(`Email: ${demoUser.email}`)
    console.log(`Is Pro: ${isPro}`)
    console.log(`Subscription Tier: ${tier}`)
    console.log(`Max Tokens: ${limits.maxTokens === -1 ? 'Unlimited' : limits.maxTokens}`)
    console.log(`Advanced Features: ${limits.advancedFeatures ? 'Enabled' : 'Disabled'}`)
    console.log(`Priority Support: ${limits.prioritySupport ? 'Enabled' : 'Disabled'}`)

  } catch (error) {
    console.error('❌ Test execution failed:', error)
    process.exit(1)
  }
}

// Run the tests
runTests().catch(console.error) 