import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let isAuthEnabled;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables! Using mock authentication.');
  // You might want to throw an error or handle this more robustly in production
  // For now, it will proceed with mockAuth if not configured
  isAuthEnabled = false;
} else {
  isAuthEnabled = true;
}

export { isAuthEnabled };

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    if (!isAuthEnabled) {
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
    if (!isAuthEnabled) {
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
    if (!isAuthEnabled) {
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
    if (!isAuthEnabled) {
      return mockAuth.signOut()
    }
    
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  resetPassword: async (email) => {
    if (!isAuthEnabled) {
      console.warn('Supabase not configured - using mock auth')
      return mockAuth.resetPasswordForEmail()
    }
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  updatePassword: async (password) => {
    if (!isAuthEnabled) {
      console.warn('Supabase not configured - using mock auth')
      return mockAuth.updateUser()
    }
    
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  },

  getSession: async () => {
    if (!isAuthEnabled) {
      return mockAuth.getSession()
    }
    
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  getUser: async () => {
    if (!isAuthEnabled) {
      return mockAuth.getUser()
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  onAuthStateChange: (callback) => {
    if (!isAuthEnabled) {
      return mockAuth.onAuthStateChange(callback)
    }
    
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Log configuration status for debugging
if (import.meta.env.DEV) {
  if (isAuthEnabled) {
    console.log('✅ Supabase configured and ready')
  } else {
    console.warn('⚠️ Supabase not configured - using mock authentication. To enable real auth, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
  }
} 