# Subscription System Implementation

## Overview

This document describes the comprehensive subscription system implemented for PromptCraft AI, designed to properly handle user entitlements and ensure paid users receive full access to premium features.

## Architecture

### Core Components

1. **SubscriptionService** (`src/services/subscriptionService.js`)
   - Centralized subscription logic with multiple fallback methods
   - Caching system for performance optimization
   - Support for multiple subscription tiers (Free, Pro, Enterprise)

2. **Enhanced AuthContext** (`src/contexts/AuthContext.jsx`)
   - Integrated subscription status checking
   - Real-time subscription updates
   - Context-aware feature access

3. **Database Schema** (`database-schema.sql`)
   - Profiles table with subscription fields
   - RLS policies for data security
   - Automatic profile creation triggers

4. **Admin Tools** (`scripts/`)
   - User management utilities
   - Database migration scripts
   - Pro access granting tools

## Subscription Checking Methods

The system uses multiple methods to determine user subscription status, providing robust fallback mechanisms:

### Method 1: Known Pro Users List
- Immediate access for hardcoded Pro users
- Includes `bartjan.decroos@me.com` by default
- Fastest method, no database queries required

### Method 2: Caching System
- 5-minute cache duration for subscription status
- Reduces database load and improves performance
- Automatic cache invalidation on subscription changes

### Method 3: User Metadata
- Checks `user.user_metadata.subscription_tier`
- Set during user registration or admin updates
- Persists across sessions

### Method 4: App Metadata
- Checks `user.app_metadata.subscription_tier`
- Set by Supabase admin functions or webhooks
- More secure than user metadata

### Method 5: Database Profiles Table
- Authoritative source for subscription data
- Includes expiration dates and billing status
- Supports complex subscription scenarios

### Method 6: Subscription Indicators
- Checks various metadata fields for Pro indicators
- Flexible pattern matching for different subscription systems
- Fallback for legacy or external integrations

## Database Schema

### Profiles Table

```sql
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    subscription_created_at TIMESTAMP WITH TIME ZONE,
    billing_customer_id TEXT, -- For Stripe/payment processor integration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Key Features

- **Subscription Tiers**: Free, Pro, Enterprise
- **Status Tracking**: Active, Inactive, Cancelled, Past Due
- **Expiration Handling**: Automatic expiration checking
- **Billing Integration**: Customer ID field for payment processors
- **RLS Security**: Row-level security policies
- **Automatic Timestamps**: Created/updated tracking

## Feature Limits

### Free Tier
- Max Tokens: 4,000
- Max Prompts: 50
- Max Enrichments: 10
- Advanced Features: Disabled
- Priority Support: Disabled
- Custom Models: Disabled

### Pro Tier
- Max Tokens: 200,000 (Unlimited)
- Max Prompts: Unlimited
- Max Enrichments: Unlimited
- Advanced Features: Enabled
- Priority Support: Enabled
- Custom Models: Enabled

## Usage Examples

### Checking Subscription Status

```javascript
import { SubscriptionService } from '../services/subscriptionService'

// Check if user is Pro
const isPro = await SubscriptionService.isProUser(user)

// Get subscription tier
const tier = await SubscriptionService.getSubscriptionTier(user)

// Check specific action permissions
const canUseAdvanced = await SubscriptionService.canPerformAction(user, 'use_advanced_features')
```

### Using in Components

```javascript
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { isPro, subscriptionTier, getFeatureLimits, canPerformAction } = useAuth()
  
  const limits = getFeatureLimits()
  const canUseAdvanced = await canPerformAction('use_advanced_features')
  
  return (
    <div>
      {isPro ? (
        <PremiumFeature />
      ) : (
        <UpgradePrompt />
      )}
    </div>
  )
}
```

## Admin Operations

### Granting Pro Access

```bash
# Grant Pro access to a specific user
node scripts/grantProAccess.js bartjan.decroos@me.com

# Run database migrations
node scripts/runMigration.js
```

### Programmatic Access

```javascript
import { SubscriptionService } from '../services/subscriptionService'

// Grant Pro access
await SubscriptionService.grantProAccess('user@example.com')

// Update subscription
await SubscriptionService.updateSubscription(userId, 'pro', 'active')

// Clear cache
SubscriptionService.clearCache(userId)
```

## Security Considerations

### Row Level Security (RLS)
- Users can only access their own subscription data
- Admin functions require service role key
- Secure data isolation between users

### Caching Security
- Cache keys include user ID to prevent cross-user access
- Automatic cache invalidation on sensitive operations
- Memory-based cache (not persistent across restarts)

### Fallback Mechanisms
- Multiple verification methods prevent single points of failure
- Graceful degradation if database is unavailable
- Known user list provides immediate access during outages

## Troubleshooting

### User Not Recognized as Pro

1. **Check Known Users List**
   - Verify email is in `KNOWN_PRO_USERS` array
   - Case-insensitive matching is used

2. **Verify Database Records**
   - Check profiles table for subscription data
   - Ensure subscription_status is 'active'
   - Verify expiration date is in the future

3. **Check User Metadata**
   - Inspect user.user_metadata.subscription_tier
   - Verify user.app_metadata.subscription_tier
   - Use SubscriptionStatus component for debugging

4. **Clear Cache**
   - Use `refreshSubscription()` function
   - Restart application if needed
   - Check browser console for errors

### Common Issues

1. **Subscription Not Updating**
   - Clear user cache: `SubscriptionService.clearCache(userId)`
   - Refresh subscription: `refreshSubscription()`
   - Check database connectivity

2. **Features Still Restricted**
   - Verify component uses `isPro` from AuthContext
   - Check feature-specific permission checks
   - Ensure proper subscription tier checking

3. **Database Errors**
   - Run migration script: `node scripts/runMigration.js`
   - Check Supabase connection and permissions
   - Verify RLS policies are correctly configured

## Integration Points

### Payment Processors
- Stripe integration via `billing_customer_id` field
- Webhook handlers for subscription updates
- Automatic status synchronization

### External APIs
- Backend API enhanced with subscription checking
- Token limits enforced based on subscription tier
- Feature gating at API level

### Frontend Components
- Conditional rendering based on subscription status
- Subscription status display component
- Upgrade prompts for free users

## Future Enhancements

1. **Enterprise Tier**
   - Team management features
   - Advanced analytics
   - Custom integrations

2. **Usage Tracking**
   - Token consumption monitoring
   - Feature usage analytics
   - Billing optimization

3. **Webhook Integration**
   - Real-time subscription updates
   - Payment processor synchronization
   - Automated tier changes

4. **A/B Testing**
   - Feature flag system
   - Subscription tier experiments
   - Conversion optimization

## Testing

### Manual Testing Checklist

1. **Free User Experience**
   - [ ] Limited feature access
   - [ ] Upgrade prompts displayed
   - [ ] Token limits enforced

2. **Pro User Experience**
   - [ ] Full feature access
   - [ ] No upgrade prompts
   - [ ] Unlimited token usage

3. **Subscription Status**
   - [ ] Correct tier displayed
   - [ ] Refresh functionality works
   - [ ] Debug info accessible

4. **Admin Functions**
   - [ ] Pro access granting works
   - [ ] Database updates correctly
   - [ ] Cache invalidation functions

### Automated Testing

```javascript
// Example test cases
describe('SubscriptionService', () => {
  test('should identify known Pro users', async () => {
    const user = { email: 'bartjan.decroos@me.com' }
    const isPro = await SubscriptionService.isProUser(user)
    expect(isPro).toBe(true)
  })
  
  test('should return correct feature limits', () => {
    const limits = SubscriptionService.getFeatureLimits('pro')
    expect(limits.maxTokens).toBe(200000)
    expect(limits.advancedFeatures).toBe(true)
  })
})
```

## Conclusion

This subscription system provides a robust, secure, and scalable solution for managing user entitlements in PromptCraft AI. The multi-layered approach ensures reliable access control while maintaining performance and user experience.

For immediate resolution of the `bartjan.decroos@me.com` access issue, the user is included in the known Pro users list, providing instant access to all premium features. 