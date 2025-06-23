import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

// Create Supabase client only if environment variables are available
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Mock auth object for when Supabase is not configured
const mockAuth = {
  signUp: async () => ({ 
    data: null, 
    error: { message: 'Authentication is temporarily disabled' } 
  }),
  signInWithPassword: async () => ({ 
    data: null, 
    error: { message: 'Authentication is temporarily disabled' } 
  }),
  signInWithOAuth: async () => ({ 
    data: null, 
    error: { message: 'Authentication is temporarily disabled' } 
  }),
  signOut: async () => ({ 
    error: null 
  }),
  resetPasswordForEmail: async () => ({ 
    data: null, 
    error: { message: 'Authentication is temporarily disabled' } 
  }),
  updateUser: async () => ({ 
    data: null, 
    error: { message: 'Authentication is temporarily disabled' } 
  }),
  getSession: async () => ({ 
    session: null, 
    error: null 
  }),
  getUser: async () => ({ 
    user: null, 
    error: null 
  }),
  onAuthStateChange: (callback) => {
    // Call callback immediately with no session
    callback('SIGNED_OUT', null)
    // Return mock subscription object
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}

// Auth helper functions with fallback to mock when Supabase is not configured
export const auth = {
  signUp: async (email, password, options = {}) => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured - using mock auth')
      return mockAuth.signUp()
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured - using mock auth')
      return mockAuth.signInWithPassword()
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signInWithOAuth: async (provider) => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured - using mock auth')
      return mockAuth.signInWithOAuth()
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  signOut: async () => {
    if (!isSupabaseConfigured) {
      return mockAuth.signOut()
    }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured - using mock auth')
      return mockAuth.resetPasswordForEmail()
    }
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  updatePassword: async (password) => {
    if (!isSupabaseConfigured) {
      console.warn('Supabase not configured - using mock auth')
      return mockAuth.updateUser()
    }
    
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  getSession: async () => {
    if (!isSupabaseConfigured) {
      return mockAuth.getSession()
    }
    
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  getUser: async () => {
    if (!isSupabaseConfigured) {
      return mockAuth.getUser()
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback) => {
    if (!isSupabaseConfigured) {
      return mockAuth.onAuthStateChange(callback)
    }
    
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Export configuration status for components to check
export const isAuthEnabled = isSupabaseConfigured

// Log configuration status for debugging
if (import.meta.env.DEV) {
  if (isSupabaseConfigured) {
    console.log('✅ Supabase configured and ready')
  } else {
    console.warn('⚠️ Supabase not configured - using mock authentication. To enable real auth, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
  }
} 