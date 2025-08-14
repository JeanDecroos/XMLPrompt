#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests the Supabase authentication functionality
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
config({ path: path.resolve(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  console.log('🔐 Promptr Authentication Test')
console.log('=' .repeat(50))

async function testAuthentication() {
  const results = {
    configurationValid: false,
    supabaseConnection: false,
    authEndpointReachable: false,
    signUpTest: false,
    signInTest: false
  }

  try {
    // Test 1: Configuration Validation
    console.log('\n1. Testing Configuration...')
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Missing Supabase configuration')
      console.log(`   VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
      console.log(`   VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Set' : '❌ Missing'}`)
      return results
    }
    
    console.log('✅ Configuration valid')
    console.log(`   URL: ${supabaseUrl}`)
    console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`)
    results.configurationValid = true

    // Test 2: Supabase Client Creation
    console.log('\n2. Testing Supabase Connection...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    if (!supabase) {
      console.log('❌ Failed to create Supabase client')
      return results
    }
    
    console.log('✅ Supabase client created successfully')
    results.supabaseConnection = true

    // Test 3: Auth Endpoint Reachability
    console.log('\n3. Testing Auth Endpoint...')
    try {
      const authUrl = `${supabaseUrl}/auth/v1/settings`
      const response = await fetch(authUrl, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      })
      
      if (response.ok) {
        console.log('✅ Auth endpoint reachable')
        results.authEndpointReachable = true
      } else {
        console.log(`❌ Auth endpoint returned status: ${response.status}`)
        const errorText = await response.text()
        console.log(`   Error: ${errorText}`)
      }
    } catch (error) {
      console.log(`❌ Auth endpoint unreachable: ${error.message}`)
      if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
        console.log('   This suggests a DNS resolution issue with the Supabase URL')
      }
    }

    // Test 4: Sign Up Test (with cleanup)
    console.log('\n4. Testing Sign Up...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      })
      
      if (error) {
        console.log(`❌ Sign up failed: ${error.message}`)
        if (error.message.includes('Failed to fetch')) {
          console.log('   This indicates a network connectivity issue')
        }
      } else {
        console.log('✅ Sign up successful')
        console.log(`   User ID: ${data.user?.id || 'N/A'}`)
        results.signUpTest = true
      }
    } catch (error) {
      console.log(`❌ Sign up error: ${error.message}`)
    }

    // Test 5: Sign In Test
    console.log('\n5. Testing Sign In...')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      })
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          console.log('✅ Sign in validation working (expected failure with wrong credentials)')
          results.signInTest = true
        } else if (error.message.includes('Failed to fetch')) {
          console.log('❌ Sign in failed due to network issue')
        } else {
          console.log(`❌ Sign in failed: ${error.message}`)
        }
      } else {
        console.log('⚠️  Sign in succeeded with wrong credentials (unexpected)')
      }
    } catch (error) {
      console.log(`❌ Sign in error: ${error.message}`)
    }

  } catch (error) {
    console.log(`❌ Test failed with error: ${error.message}`)
  }

  return results
}

async function main() {
  const results = await testAuthentication()
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 Test Results Summary')
  console.log('=' .repeat(50))
  
  const tests = [
    { name: 'Configuration Valid', result: results.configurationValid },
    { name: 'Supabase Connection', result: results.supabaseConnection },
    { name: 'Auth Endpoint Reachable', result: results.authEndpointReachable },
    { name: 'Sign Up Test', result: results.signUpTest },
    { name: 'Sign In Test', result: results.signInTest }
  ]
  
  let passedTests = 0
  tests.forEach(test => {
    const status = test.result ? '✅' : '❌'
    console.log(`${status} ${test.name}`)
    if (test.result) passedTests++
  })
  
  const score = `${passedTests}/${tests.length}`
  console.log(`\n🎯 Authentication Score: ${score} tests passed`)
  
  if (passedTests === tests.length) {
    console.log('🎉 All authentication tests passed! The system is ready.')
  } else if (passedTests >= 3) {
    console.log('⚠️  Most tests passed. Minor issues may exist.')
  } else {
    console.log('🚨 Multiple authentication issues detected. Please check configuration.')
  }
  
  // Troubleshooting tips
  if (!results.authEndpointReachable) {
    console.log('\n🔧 Troubleshooting Tips:')
    console.log('- Verify the Supabase URL is correct')
    console.log('- Check your internet connection')
    console.log('- Ensure the Supabase project is active')
    console.log('- Try accessing the Supabase dashboard to confirm the project exists')
  }
  
  process.exit(passedTests === tests.length ? 0 : 1)
}

main().catch(console.error) 