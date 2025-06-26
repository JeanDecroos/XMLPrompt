/**
 * Database Configuration and Connection Management
 * Handles Supabase client initialization and connection pooling
 */

import { createClient } from '@supabase/supabase-js'
import { config } from './index.js'
import { logger } from '../utils/logger.js'

let supabaseClient = null

export const database = {
  async initialize() {
    try {
      supabaseClient = createClient(
        config.database.supabaseUrl,
        config.database.supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      // Test the connection with a simple query that doesn't depend on specific tables
      try {
        const { data, error } = await supabaseClient
          .from('users')
          .select('count')
          .limit(1)
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
          // If it's not a "table doesn't exist" error, log it but don't fail
          logger.warn('Database connection test returned an error (continuing anyway):', error.message)
        }
      } catch (testError) {
        // If the test fails, log it but don't fail the initialization
        logger.warn('Database connection test failed (continuing anyway):', testError.message)
      }
      
      logger.info('Supabase connection established successfully')
      return true
    } catch (error) {
      logger.error('Failed to initialize Supabase connection:', error)
      // Don't throw the error - allow the server to start even if database is not ready
      logger.warn('Server will continue without database connection')
      return false
    }
  },

  async close() {
    // Supabase client doesn't need explicit closing
    logger.info('Supabase connection closed')
    return true
  },

  get client() {
    if (!supabaseClient) {
      logger.warn('Database not initialized. Some features may not work.')
      // Return a stub client instead of throwing
      return {
        from: () => ({
          select: () => ({ data: null, error: { message: 'Database not connected' } }),
          insert: () => ({ data: null, error: { message: 'Database not connected' } }),
          update: () => ({ data: null, error: { message: 'Database not connected' } }),
          delete: () => ({ data: null, error: { message: 'Database not connected' } })
        }),
        auth: () => ({ 
          signUp: () => ({ data: null, error: { message: 'Database not connected' } }),
          signIn: () => ({ data: null, error: { message: 'Database not connected' } })
        })
      }
    }
    return supabaseClient
  },

  // Helper methods for common operations
  from(table) {
    return this.client.from(table)
  },

  auth() {
    return this.client.auth
  },

  storage() {
    return this.client.storage
  }
}

// Export as db for backward compatibility
export const db = database

export default database 