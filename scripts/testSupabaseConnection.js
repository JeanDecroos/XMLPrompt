#!/usr/bin/env node

/**
 * Test Supabase Connection and Setup Guide
 * This script tests the connection to the new Supabase instance and provides setup instructions
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

// New Supabase project credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nxwflnxspsokscfhuaqr.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk5MzQsImV4cCI6MjA2NjM0NTkzNH0.jMWf2BEfI_4gAtMO9yzv3Nw5QWiIhyPanANP5px51gA'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2OTkzNCwiZXhwIjoyMDY2MzQ1OTM0fQ.CbT3iYiaghBJ_lJPSAXFVMKyJtTVJoFL-61x4HHMxi0'

// JWT Secret
const jwtSecret = 'FKqIjknWVw736dGhQokNzTANr8LCScfnUSRyXmpBP1aAClyiOpj5YUvrSsXeVK2H1dTlDqaso9ghTj3AqBKI2A=='

console.log('🚀 XMLPrompter Supabase Integration Test')
console.log('=' .repeat(50))

// Test basic connection
async function testConnection() {
  console.log('\n1. Testing basic connection...')
  
  try {
    // Create client with anon key
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test connection by querying auth
    const { data, error } = await supabase.auth.getSession()
    
    if (error && error.message !== 'Auth session missing!') {
      throw error
    }
    
    console.log('✅ Basic connection successful')
    console.log(`   Project URL: ${supabaseUrl}`)
    console.log(`   Project ID: nxwflnxspsokscfhuaqr`)
    
    return supabase
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    return null
  }
}

// Test admin connection
async function testAdminConnection() {
  console.log('\n2. Testing admin connection...')
  
  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    // Test admin capabilities
    const { data, error } = await adminClient.auth.admin.listUsers()
    
    if (error) {
      throw error
    }
    
    console.log('✅ Admin connection successful')
    console.log(`   Found ${data.users.length} users in the system`)
    
    return adminClient
  } catch (error) {
    console.error('❌ Admin connection failed:', error.message)
    return null
  }
}

// Check if schema is set up
async function checkSchema(supabase) {
  console.log('\n3. Checking database schema...')
  
  try {
    // Try to query profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Profiles table not found - schema needs to be set up')
      return false
    }
    
    console.log('✅ Schema appears to be set up')
    return true
  } catch (error) {
    console.log('⚠️  Schema check failed - needs setup')
    return false
  }
}

// Provide setup instructions
function provideSetupInstructions() {
  console.log('\n📋 SETUP INSTRUCTIONS')
  console.log('=' .repeat(50))
  
  console.log('\n🔧 Step 1: Set up database schema')
  console.log('1. Go to https://supabase.com/dashboard/project/nxwflnxspsokscfhuaqr')
  console.log('2. Navigate to SQL Editor')
  console.log('3. Copy the contents of database-schema-v2.sql')
  console.log('4. Paste and execute in the SQL Editor')
  
  console.log('\n🌐 Step 2: Configure environment variables')
  console.log('Create .env.local file with:')
  console.log(`VITE_SUPABASE_URL=${supabaseUrl}`)
  console.log(`VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}`)
  console.log(`SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}`)
  
  console.log('\n🔐 Step 3: Configure authentication')
  console.log('1. Go to Authentication > Settings in Supabase Dashboard')
  console.log('2. Add redirect URLs:')
  console.log('   - http://localhost:3000/auth/callback')
  console.log('   - http://localhost:3009/auth/callback')
  console.log('   - http://localhost:3010/auth/callback')
  console.log('   - https://yourdomain.com/auth/callback')
  
  console.log('\n🔑 Step 4: Update backend configuration')
  console.log('Create backend/.env file with the provided credentials')
  
  console.log('\n✅ Step 5: Test the setup')
  console.log('1. Run: npm run dev')
  console.log('2. Try signing up a new user')
  console.log('3. Check if authentication works')
}

// Main execution
async function main() {
  console.log(`\n🔍 Testing connection to: ${supabaseUrl}`)
  
  // Test connections
  const supabase = await testConnection()
  if (!supabase) {
    console.log('\n❌ Cannot proceed without basic connection')
    process.exit(1)
  }
  
  const adminClient = await testAdminConnection()
  if (!adminClient) {
    console.log('\n❌ Admin connection failed - check service role key')
  }
  
  // Check schema
  const schemaReady = await checkSchema(supabase)
  
  // Provide configuration summary
  console.log('\n📊 CONFIGURATION SUMMARY')
  console.log('=' .repeat(50))
  console.log(`Project URL: ${supabaseUrl}`)
  console.log(`Project ID: nxwflnxspsokscfhuaqr`)
  console.log(`Basic Connection: ✅`)
  console.log(`Admin Connection: ${adminClient ? '✅' : '❌'}`)
  console.log(`Schema Ready: ${schemaReady ? '✅' : '⚠️'}`)
  console.log(`JWT Secret: ${jwtSecret ? '✅' : '❌'}`)
  
  if (!schemaReady) {
    provideSetupInstructions()
  } else {
    console.log('\n🎉 Setup appears complete! Try running the application.')
  }
  
  console.log('\n🔧 Next steps:')
  console.log('1. Set up your environment variables')
  console.log('2. Run database schema if needed')
  console.log('3. Start the development server: npm run dev')
  console.log('4. Test authentication and database operations')
}

// Run the test
main().catch(error => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
}) 