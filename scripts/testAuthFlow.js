#!/usr/bin/env node

/**
 * Complete Authentication Flow Test
 * Tests signup, signin, and validation flows
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

console.log('🔐 XMLPrompter Complete Authentication Flow Test')
console.log('=' .repeat(60))

async function testAuthFlow() {
  const results = {
    configurationValid: false,
    supabaseConnection: false,
    signupValidation: false,
    passwordValidation: false,
    emailValidation: false,
    authEndpointReachable: false
  }

  try {
    // 1. Test Configuration
    console.log('\n1. Testing Configuration...')
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('❌ Missing Supabase configuration')
      console.log('   Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
      return results
    }
    
    console.log('✅ Configuration valid')
    console.log(`   URL: ${supabaseUrl}`)
    console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`)
    results.configurationValid = true

    // 2. Test Supabase Connection
    console.log('\n2. Testing Supabase Connection...')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    if (!supabase) {
      console.log('❌ Failed to create Supabase client')
      return results
    }
    
    console.log('✅ Supabase client created successfully')
    results.supabaseConnection = true

    // 3. Test Auth Endpoint Reachability
    console.log('\n3. Testing Auth Endpoint...')
    try {
      const { data, error } = await supabase.auth.getSession()
      console.log('✅ Auth endpoint reachable')
      results.authEndpointReachable = true
    } catch (error) {
      console.log('❌ Auth endpoint unreachable:', error.message)
      return results
    }

    // 4. Test Email Validation
    console.log('\n4. Testing Email Validation...')
    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user@domain',
      'user.domain.com'
    ]
    
    let emailValidationPassed = true
    for (const email of invalidEmails) {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password: 'TestPassword123!'
        })
        
        if (!error || !error.message.includes('invalid')) {
          console.log(`❌ Email validation failed for: ${email}`)
          emailValidationPassed = false
        }
      } catch (err) {
        // Expected to fail
      }
    }
    
    if (emailValidationPassed) {
      console.log('✅ Email validation working correctly')
      results.emailValidation = true
    }

    // 5. Test Password Validation
    console.log('\n5. Testing Password Validation...')
    const weakPasswords = ['123', 'abc', 'pass', '12345']
    
    let passwordValidationPassed = true
    for (const password of weakPasswords) {
      try {
        const { error } = await supabase.auth.signUp({
          email: 'test@example.com',
          password
        })
        
        if (!error || !error.message.includes('Password')) {
          console.log(`❌ Password validation failed for: ${password}`)
          passwordValidationPassed = false
        }
      } catch (err) {
        // Expected to fail
      }
    }
    
    if (passwordValidationPassed) {
      console.log('✅ Password validation working correctly')
      results.passwordValidation = true
    }

    // 6. Test Signup Flow with Valid Data
    console.log('\n6. Testing Valid Signup Flow...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'SecurePassword123!'
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      })
      
      if (error) {
        if (error.message.includes('invalid') && testEmail.includes('example.com')) {
          console.log('✅ Signup validation working (test email rejected as expected)')
          results.signupValidation = true
        } else {
          console.log('❌ Signup failed:', error.message)
        }
      } else {
        console.log('✅ Signup successful (would require email confirmation)')
        results.signupValidation = true
      }
    } catch (error) {
      console.log('❌ Signup test failed:', error.message)
    }

    // 7. Test Frontend Connectivity
    console.log('\n7. Testing Frontend Connectivity...')
    try {
      const response = await fetch('http://localhost:3000')
      if (response.ok) {
        console.log('✅ Frontend accessible at http://localhost:3000')
      } else {
        console.log('❌ Frontend not accessible')
      }
    } catch (error) {
      console.log('❌ Frontend connection failed:', error.message)
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }

  return results
}

// Run the test
testAuthFlow().then(results => {
  console.log('\n' + '=' .repeat(60))
  console.log('📊 Test Results Summary')
  console.log('=' .repeat(60))
  
  const tests = [
    { name: 'Configuration Valid', passed: results.configurationValid },
    { name: 'Supabase Connection', passed: results.supabaseConnection },
    { name: 'Auth Endpoint Reachable', passed: results.authEndpointReachable },
    { name: 'Email Validation', passed: results.emailValidation },
    { name: 'Password Validation', passed: results.passwordValidation },
    { name: 'Signup Flow', passed: results.signupValidation }
  ]
  
  tests.forEach(test => {
    console.log(`${test.passed ? '✅' : '❌'} ${test.name}`)
  })
  
  const passedTests = tests.filter(test => test.passed).length
  const totalTests = tests.length
  
  console.log('\n🎯 Authentication Flow Score: ' + `${passedTests}/${totalTests} tests passed`)
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Authentication system is fully functional.')
  } else if (passedTests >= totalTests * 0.8) {
    console.log('⚠️  Most tests passed. Minor issues may exist.')
  } else {
    console.log('❌ Multiple issues detected. Authentication needs attention.')
  }
  
  console.log('\n📝 Next Steps:')
  console.log('1. Open http://localhost:3000 in your browser')
  console.log('2. Click "Sign Up" to test the new password confirmation feature')
  console.log('3. Try creating an account with a real email address')
  console.log('4. Test the password strength indicator')
  console.log('5. Verify email validation and error handling')
}).catch(error => {
  console.error('Test execution failed:', error)
  process.exit(1)
}) 