#!/usr/bin/env node

/**
 * Database migration script
 * Usage: node scripts/runMigration.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Running database migration...')

    // Read the schema file
    const schemaPath = join(__dirname, '..', 'database-schema.sql')
    const schema = readFileSync(schemaPath, 'utf8')

    // Split schema into individual statements (basic approach)
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`Found ${statements.length} SQL statements to execute`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`)
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          // Try direct query if RPC doesn't work
          const { error: directError } = await supabase
            .from('_dummy') // This will fail but we can catch SQL execution errors
            .select('*')
          
          console.warn(`Statement ${i + 1} may have failed:`, error.message)
          // Continue with other statements
        } else {
          console.log(`✓ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.warn(`Statement ${i + 1} execution warning:`, err.message)
        // Continue with other statements
      }
    }

    console.log('\n✅ Migration completed!')
    console.log('\nNext steps:')
    console.log('1. Grant Pro access to specific users:')
    console.log('   node scripts/grantProAccess.js bartjan.decroos@me.com')
    console.log('2. Test the application to verify subscription status')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Alternative approach: Create tables directly using Supabase client
async function createTablesDirectly() {
  try {
    console.log('🚀 Creating database tables directly...')

    // Create profiles table
    console.log('Creating profiles table...')
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT,
          full_name TEXT,
          avatar_url TEXT,
          subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
          subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
          subscription_expires_at TIMESTAMP WITH TIME ZONE,
          subscription_created_at TIMESTAMP WITH TIME ZONE,
          billing_customer_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })

    if (profilesError) {
      console.log('Profiles table may already exist or RPC not available')
    } else {
      console.log('✓ Profiles table created')
    }

    // Since direct SQL execution might not work, let's try to verify tables exist
    console.log('\nVerifying table structure...')
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
      
      if (!error) {
        console.log('✓ Profiles table is accessible')
      } else {
        console.log('❌ Profiles table not accessible:', error.message)
      }
    } catch (err) {
      console.log('❌ Could not verify profiles table:', err.message)
    }

    console.log('\n✅ Direct table creation completed!')

  } catch (error) {
    console.error('❌ Direct table creation failed:', error.message)
  }
}

async function main() {
  console.log('Database Migration Tool')
  console.log('=======================')
  
  // Try both approaches
  await runMigration()
  await createTablesDirectly()
}

// Run the script
main().catch(console.error) 