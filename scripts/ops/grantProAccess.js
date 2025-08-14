#!/usr/bin/env node

/**
 * Utility script to grant Pro access to specific users
 * Usage: node scripts/grantProAccess.js <email>
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nxwflnxspsokscfhuaqr.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2OTkzNCwiZXhwIjoyMDY2MzQ1OTM0fQ.CbT3iYiaghBJ_lJPSAXFVMKyJtTVJoFL-61x4HHMxi0' // This should be the service role key, not anon key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function grantProAccess(email) {
  try {
    console.log(`Granting Pro access to: ${email}`)

    // Step 1: Find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`)
    }

    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      throw new Error(`User not found: ${email}`)
    }

    console.log(`Found user: ${user.id}`)

    // Step 2: Update user metadata to include Pro subscription
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_granted_at: new Date().toISOString()
      }
    })

    if (updateError) {
      throw new Error(`Failed to update user metadata: ${updateError.message}`)
    }

    console.log('✓ Updated user metadata')

    // Step 3: Create or update profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || null,
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.warn(`Failed to update profiles table: ${profileError.message}`)
      console.log('This might be expected if the profiles table doesn\'t exist yet')
    } else {
      console.log('✓ Updated profiles table')
    }

    console.log(`\n🎉 Successfully granted Pro access to ${email}`)
    console.log('\nUser can now:')
    console.log('- Access all premium features')
    console.log('- Use advanced AI enhancements')
    console.log('- Unlimited prompt generations')
    console.log('- Priority support')

  } catch (error) {
    console.error(`❌ Error granting Pro access: ${error.message}`)
    process.exit(1)
  }
}

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.log('Usage: node scripts/grantProAccess.js <email>')
    console.log('Example: node scripts/grantProAccess.js user@example.com')
    process.exit(1)
  }

  await grantProAccess(email)
}

// Run the script
main().catch(console.error) 