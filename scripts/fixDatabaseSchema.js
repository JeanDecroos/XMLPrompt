#!/usr/bin/env node

/**
 * Database Schema Fix Script
 * This script ensures the database schema matches the application's expectations
 * and fixes issues that might cause 500 errors during signup
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nxwflnxspsokscfhuaqr.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2OTkzNCwiZXhwIjoyMDY2MzQ1OTM0fQ.CbT3iYiaghBJ_lJPSAXFVMKyJtTVJoFL-61x4HHMxi0'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease set these in your .env file or environment')
  process.exit(1)
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema...')
  
  try {
    // First, let's check what tables exist
    console.log('\n1. Checking existing tables...')
    
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.warn('Could not query information_schema, proceeding with schema creation...')
    } else {
      console.log('Existing tables:', tables?.map(t => t.table_name) || [])
    }

    // Drop the old profiles table if it has the wrong schema
    console.log('\n2. Dropping old profiles table if it exists...')
    const { error: dropError } = await supabase.rpc('exec', {
      sql: 'DROP TABLE IF EXISTS profiles CASCADE;'
    })
    
    if (dropError) {
      console.log('Note: Could not drop profiles table (may not exist)')
    }

    // Create the correct profiles table
    console.log('\n3. Creating profiles table with correct schema...')
    const profilesSQL = `
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
    
    const { error: profilesError } = await supabase.rpc('exec', { sql: profilesSQL })
    if (profilesError) {
      console.error('Failed to create profiles table:', profilesError)
    } else {
      console.log('✅ Profiles table created successfully')
    }

    // Create indexes
    console.log('\n4. Creating indexes...')
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
      CREATE INDEX IF NOT EXISTS profiles_subscription_tier_idx ON profiles(subscription_tier);
      CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx ON profiles(subscription_status);
      CREATE INDEX IF NOT EXISTS profiles_billing_customer_idx ON profiles(billing_customer_id);
    `
    
    const { error: indexesError } = await supabase.rpc('exec', { sql: indexesSQL })
    if (indexesError) {
      console.error('Failed to create indexes:', indexesError)
    } else {
      console.log('✅ Indexes created successfully')
    }

    // Enable RLS
    console.log('\n5. Enabling Row Level Security...')
    const rlsSQL = `
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    `
    
    const { error: rlsError } = await supabase.rpc('exec', { sql: rlsSQL })
    if (rlsError) {
      console.error('Failed to enable RLS:', rlsError)
    } else {
      console.log('✅ RLS enabled successfully')
    }

    // Create RLS policies
    console.log('\n6. Creating RLS policies...')
    const policiesSQL = `
      DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
      
      CREATE POLICY "Users can view their own profile" ON profiles
          FOR SELECT USING (auth.uid() = id);

      CREATE POLICY "Users can update their own profile" ON profiles
          FOR UPDATE USING (auth.uid() = id);

      CREATE POLICY "Users can insert their own profile" ON profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
    `
    
    const { error: policiesError } = await supabase.rpc('exec', { sql: policiesSQL })
    if (policiesError) {
      console.error('Failed to create policies:', policiesError)
    } else {
      console.log('✅ RLS policies created successfully')
    }

    // Create the trigger function
    console.log('\n7. Creating trigger function...')
    const functionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
          fetched_email TEXT;
      BEGIN
          -- Explicitly fetch the email from auth.users table using NEW.id
          SELECT email INTO fetched_email FROM auth.users WHERE id = NEW.id;

          INSERT INTO public.profiles (id, email, full_name)
          VALUES (NEW.id, fetched_email, NEW.raw_user_meta_data->>'full_name');
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    const { error: functionError } = await supabase.rpc('exec', { sql: functionSQL })
    if (functionError) {
      console.error('Failed to create function:', functionError)
    } else {
      console.log('✅ Trigger function created successfully')
    }

    // Create the trigger
    console.log('\n8. Creating trigger...')
    const triggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
    
    const { error: triggerError } = await supabase.rpc('exec', { sql: triggerSQL })
    if (triggerError) {
      console.error('Failed to create trigger:', triggerError)
    } else {
      console.log('✅ Trigger created successfully')
    }

    // Create the updated_at function and triggers
    console.log('\n9. Creating updated_at function and triggers...')
    const updatedAtSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `
    
    const { error: updatedAtError } = await supabase.rpc('exec', { sql: updatedAtSQL })
    if (updatedAtError) {
      console.error('Failed to create updated_at triggers:', updatedAtError)
    } else {
      console.log('✅ Updated_at triggers created successfully')
    }

    console.log('\n🎉 Database schema fix completed successfully!')
    console.log('\nYou can now try signing up again. The 500 error should be resolved.')
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error.message)
    process.exit(1)
  }
}

// Run the fix
fixDatabaseSchema() 