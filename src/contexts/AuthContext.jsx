import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../lib/supabase'
import { SubscriptionService, SUBSCRIPTION_TIERS } from '../services/subscriptionService'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPro, setIsPro] = useState(false)
  const [subscriptionTier, setSubscriptionTier] = useState(SUBSCRIPTION_TIERS.FREE)

  // Function to check and update subscription status
  const checkSubscriptionStatus = async (currentUser) => {
    if (!currentUser) {
      setIsPro(false)
      setSubscriptionTier(SUBSCRIPTION_TIERS.FREE)
      return
    }

    try {
      const isUserPro = await SubscriptionService.isProUser(currentUser)
      const tier = await SubscriptionService.getSubscriptionTier(currentUser)
      
      setIsPro(isUserPro)
      setSubscriptionTier(tier)
      
      console.log(`User ${currentUser.email} subscription status:`, {
        isPro: isUserPro,
        tier: tier
      })
    } catch (error) {
      console.error('Failed to check subscription status:', error)
      // Fallback to checking user metadata directly
      const fallbackIsPro = currentUser?.user_metadata?.subscription_tier === 'pro' || false
      setIsPro(fallbackIsPro)
      setSubscriptionTier(fallbackIsPro ? SUBSCRIPTION_TIERS.PRO : SUBSCRIPTION_TIERS.FREE)
    }
  }

  useEffect(() => {
    // Get initial session
    auth.getSession().then(async ({ session, error }) => {
      if (error) {
        console.error('Error getting session:', error)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Check subscription status for the user
        await checkSubscriptionStatus(session?.user ?? null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session)
      setSession(session)
      setUser(session?.user ?? null)
      
      // Check subscription status when auth state changes
      await checkSubscriptionStatus(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, options) => {
    setLoading(true)
    try {
      const { data, error } = await auth.signUp(email, password, options)
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await auth.signIn(email, password)
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  const signInWithOAuth = async (provider) => {
    setLoading(true)
    try {
      const { data, error } = await auth.signInWithOAuth(provider)
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await auth.signOut()
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    const { data, error } = await auth.resetPassword(email)
    return { data, error }
  }

  const updatePassword = async (password) => {
    const { data, error } = await auth.updatePassword(password)
    return { data, error }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    isAuthenticated: !!user,
    isPro,
    subscriptionTier,
    checkSubscriptionStatus: () => checkSubscriptionStatus(user),
    refreshSubscription: async () => {
      if (user) {
        SubscriptionService.clearCache(user.id)
        await checkSubscriptionStatus(user)
      }
    },
    canPerformAction: async (action) => {
      return await SubscriptionService.canPerformAction(user, action)
    },
    getFeatureLimits: () => {
      return SubscriptionService.getFeatureLimits(subscriptionTier)
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 