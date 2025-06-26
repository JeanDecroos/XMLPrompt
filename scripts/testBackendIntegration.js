#!/usr/bin/env node

/**
 * Test Backend Integration with New Supabase Instance
 * This script tests the backend configuration and database connectivity
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from backend/.env
config({ path: path.resolve(__dirname, '..', 'backend', '.env') })

// New Supabase project credentials
const supabaseUrl = 'https://nxwflnxspsokscfhuaqr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk5MzQsImV4cCI6MjA2NjM0NTkzNH0.jMWf2BEfI_4gAtMO9yzv3Nw5QWiIhyPanANP5px51gA'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2OTkzNCwiZXhwIjoyMDY2MzQ1OTM0fQ.CbT3iYiaghBJ_lJPSAXFVMKyJtTVJoFL-61x4HHMxi0'

console.log('🔧 XMLPrompter Backend Integration Test')
console.log('=' .repeat(50))

// Test backend configuration
async function testBackendConfig() {
  console.log('\n1. Testing backend configuration...')
  
  try {
    // Test if we can import backend config
    const backendConfigExists = await import('../backend/src/config/index.js').catch(() => null)
    
    if (backendConfigExists) {
      console.log('✅ Backend configuration files exist')
    } else {
      console.log('⚠️  Backend configuration files not found')
    }
    
    return !!backendConfigExists
  } catch (error) {
    console.error('❌ Backend configuration test failed:', error.message)
    return false
  }
}

// Test database operations
async function testDatabaseOperations() {
  console.log('\n2. Testing database operations...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test reading from profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (profilesError) {
      console.log('⚠️  Profiles table query failed:', profilesError.message)
      return false
    }
    
    console.log('✅ Database read operations working')
    
    // Test reading from prompts table
    const { data: prompts, error: promptsError } = await supabase
      .from('prompts')
      .select('id')
      .limit(1)
    
    if (promptsError) {
      console.log('⚠️  Prompts table query failed:', promptsError.message)
      return false
    }
    
    console.log('✅ All core tables accessible')
    return true
    
  } catch (error) {
    console.error('❌ Database operations test failed:', error.message)
    return false
  }
}

// Test authentication flow
async function testAuthFlow() {
  console.log('\n3. Testing authentication flow...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    // Test auth session check
    const { data: session, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError && sessionError.message !== 'Auth session missing!') {
      throw sessionError
    }
    
    console.log('✅ Authentication system accessible')
    
    // Test admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    
    const { data: users, error: usersError } = await adminClient.auth.admin.listUsers()
    
    if (usersError) {
      throw usersError
    }
    
    console.log(`✅ Admin operations working (${users.users.length} users found)`)
    return true
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message)
    return false
  }
}

// Test environment variables
function testEnvironmentVariables() {
  console.log('\n4. Testing environment variables...')
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missingVars = []
  const presentVars = []
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      presentVars.push(varName)
    } else {
      missingVars.push(varName)
    }
  }
  
  if (presentVars.length > 0) {
    console.log(`✅ Found environment variables: ${presentVars.join(', ')}`)
  }
  
  if (missingVars.length > 0) {
    console.log(`⚠️  Missing environment variables: ${missingVars.join(', ')}`)
    console.log('   (Using hardcoded values for testing)')
  }
  
  return missingVars.length === 0
}

// Test API endpoints
let apiEndpointsWorking = false
console.log('\n5. Testing API endpoints...')
try {
  const healthResponse = await fetch('http://localhost:3002/health')
  const healthData = await healthResponse.json()
  
  if (healthData.status === 'ok') {
    console.log('✅ Backend health endpoint working')
    
    // Test root endpoint
    const rootResponse = await fetch('http://localhost:3002/')
    const rootData = await rootResponse.json()
    
    if (rootData.name && rootData.name.includes('XMLPrompter')) {
      console.log('✅ Backend API endpoints working')
      apiEndpointsWorking = true
    } else {
      console.log('⚠️  Backend API endpoints responding but unexpected format')
    }
  } else {
    console.log('⚠️  Backend health check failed')
  }
} catch (error) {
  console.log(`⚠️  Could not connect to backend server: ${error.message}`)
  console.log('💡 Make sure backend is running on port 3002')
}

// Main execution
async function main() {
  console.log(`\n🔍 Testing integration with: ${supabaseUrl}`)
  
  const results = {
    backendConfig: await testBackendConfig(),
    database: await testDatabaseOperations(),
    auth: await testAuthFlow(),
    envVars: testEnvironmentVariables(),
    api: apiEndpointsWorking
  }
  
  // Provide summary
  console.log('\n📊 INTEGRATION TEST SUMMARY')
  console.log('=' .repeat(50))
  console.log(`Backend Configuration: ${results.backendConfig ? '✅' : '❌'}`)
  console.log(`Database Operations: ${results.database ? '✅' : '❌'}`)
  console.log(`Authentication Flow: ${results.auth ? '✅' : '❌'}`)
  console.log(`Environment Variables: ${results.envVars ? '✅' : '⚠️'}`)
  console.log(`API Endpoints: ${results.api ? '✅' : '⚠️'}`)
  
  const passedTests = Object.values(results).filter(Boolean).length
  const totalTests = Object.keys(results).length
  
  console.log(`\n🎯 Integration Score: ${passedTests}/${totalTests} tests passed`)
  
  if (passedTests >= 3) {
    console.log('\n🎉 Integration appears successful!')
    console.log('✅ Core functionality should work')
    
    if (!results.api) {
      console.log('\n💡 To start the backend server:')
      console.log('   cd backend && npm run dev')
    }
  } else {
    console.log('\n⚠️  Integration needs attention')
    console.log('❌ Some core functionality may not work')
  }
  
  console.log('\n🔧 Next steps:')
  console.log('1. Ensure environment variables are set')
  console.log('2. Start both frontend and backend servers')
  console.log('3. Test user registration and authentication')
  console.log('4. Verify prompt creation and management')
}

// Run the test
main().catch(error => {
  console.error('\n💥 Unexpected error:', error)
  process.exit(1)
}) 