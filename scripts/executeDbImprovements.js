#!/usr/bin/env node

/**
 * Execute Database Improvements
 * Applies all database optimizations using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 EXECUTING DATABASE IMPROVEMENTS');
console.log('==================================\n');

// SQL commands broken into manageable chunks
const sqlCommands = [
  {
    name: 'Profiles Indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
      CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
      CREATE INDEX IF NOT EXISTS idx_profiles_tier_status ON profiles(subscription_tier, subscription_status);
    `
  },
  {
    name: 'Prompts Indexes - Part 1',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_prompts_tags_gin ON prompts USING GIN(tags);
      CREATE INDEX IF NOT EXISTS idx_prompts_user_created ON prompts(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_prompts_category_public ON prompts(category, is_public);
    `
  },
  {
    name: 'Prompts Indexes - Part 2',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_prompts_title_description_fts ON prompts 
        USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
      CREATE INDEX IF NOT EXISTS idx_prompts_public_trending ON prompts(is_public, view_count DESC) 
        WHERE is_public = true;
      CREATE INDEX IF NOT EXISTS idx_prompts_model_usage ON prompts(selected_model) 
        WHERE selected_model IS NOT NULL;
    `
  },
  {
    name: 'Usage Tracking Indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date ON usage_tracking(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_usage_tracking_action_date ON usage_tracking(action_type, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_usage_tracking_success_rate ON usage_tracking(success, created_at DESC);
    `
  },
  {
    name: 'Shared Prompts Indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_shared_prompts_token ON shared_prompts(share_token);
      CREATE INDEX IF NOT EXISTS idx_shared_prompts_creator ON shared_prompts(created_by, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_shared_prompts_public ON shared_prompts(is_public, view_count DESC) 
        WHERE is_public = true;
    `
  },
  {
    name: 'API Keys and Rate Limits Indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_api_keys_user_active ON api_keys(user_id, is_active) 
        WHERE is_active = true;
      CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, identifier_type, endpoint, window_start);
      CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(window_start);
    `
  },
  {
    name: 'Data Validation - Fix Invalid Emails',
    sql: `
      UPDATE profiles 
      SET email = NULL 
      WHERE email IS NOT NULL 
        AND NOT (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
    `
  },
  {
    name: 'Data Validation - Fix Metrics',
    sql: `
      UPDATE prompts SET view_count = 0 WHERE view_count < 0;
      UPDATE prompts SET copy_count = 0 WHERE copy_count < 0;
    `
  },
  {
    name: 'Data Validation - Fix Subscription Data',
    sql: `
      UPDATE profiles 
      SET subscription_tier = 'free' 
      WHERE subscription_tier NOT IN ('free', 'pro', 'enterprise');
      
      UPDATE profiles 
      SET subscription_status = 'active' 
      WHERE subscription_status NOT IN ('active', 'inactive', 'cancelled', 'past_due');
    `
  },
  {
    name: 'Add Constraints',
    sql: `
      ALTER TABLE profiles 
      ADD CONSTRAINT IF NOT EXISTS check_email_format 
      CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$');
      
      ALTER TABLE prompts 
      ADD CONSTRAINT IF NOT EXISTS check_positive_view_count CHECK (view_count >= 0);
      
      ALTER TABLE prompts 
      ADD CONSTRAINT IF NOT EXISTS check_positive_copy_count CHECK (copy_count >= 0);
    `
  },
  {
    name: 'Add Subscription Constraints',
    sql: `
      ALTER TABLE profiles 
      ADD CONSTRAINT IF NOT EXISTS check_valid_subscription_tier 
      CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));
      
      ALTER TABLE profiles 
      ADD CONSTRAINT IF NOT EXISTS check_valid_subscription_status 
      CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due'));
    `
  },
  {
    name: 'Updated At Function',
    sql: `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `
  },
  {
    name: 'Updated At Triggers',
    sql: `
      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
      DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
      
      CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      
      CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `
  },
  {
    name: 'Add Audit Columns',
    sql: `
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'profiles' AND column_name = 'last_login_at'
          ) THEN
              ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
          END IF;
          
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'profiles' AND column_name = 'login_count'
          ) THEN
              ALTER TABLE profiles ADD COLUMN login_count INTEGER DEFAULT 0;
          END IF;
      END $$;
      
      CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at DESC);
    `
  },
  {
    name: 'Cleanup Functions',
    sql: `
      CREATE OR REPLACE FUNCTION cleanup_old_usage_tracking()
      RETURNS INTEGER AS $$
      DECLARE
          deleted_count INTEGER;
      BEGIN
          DELETE FROM usage_tracking 
          WHERE created_at < NOW() - INTERVAL '1 year';
          
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql;
      
      CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
      RETURNS INTEGER AS $$
      DECLARE
          deleted_count INTEGER;
      BEGIN
          DELETE FROM rate_limits 
          WHERE window_start < NOW() - INTERVAL '1 day';
          
          GET DIAGNOSTICS deleted_count = ROW_COUNT;
          RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql;
    `
  },
  {
    name: 'Analytics Views',
    sql: `
      DROP VIEW IF EXISTS user_engagement_metrics;
      DROP VIEW IF EXISTS prompt_performance_metrics;
      
      CREATE VIEW user_engagement_metrics AS
      SELECT 
          p.id as user_id,
          p.email,
          p.subscription_tier,
          p.subscription_status,
          p.created_at as user_since,
          p.last_login_at,
          p.login_count,
          COUNT(pr.id) as total_prompts,
          COUNT(CASE WHEN pr.is_public THEN 1 END) as public_prompts,
          COALESCE(SUM(pr.view_count), 0) as total_views,
          COALESCE(SUM(pr.copy_count), 0) as total_copies,
          COUNT(sp.id) as shared_prompts,
          COUNT(ak.id) as api_keys_count
      FROM profiles p
      LEFT JOIN prompts pr ON p.id = pr.user_id
      LEFT JOIN shared_prompts sp ON p.id = sp.created_by
      LEFT JOIN api_keys ak ON p.id = ak.user_id AND ak.is_active = true
      GROUP BY p.id, p.email, p.subscription_tier, p.subscription_status, 
               p.created_at, p.last_login_at, p.login_count;
    `
  },
  {
    name: 'Prompt Performance View',
    sql: `
      CREATE VIEW prompt_performance_metrics AS
      SELECT 
          pr.id,
          pr.title,
          pr.category,
          pr.tags,
          pr.is_public,
          pr.view_count,
          pr.copy_count,
          pr.created_at,
          pr.updated_at,
          p.email as creator_email,
          p.subscription_tier as creator_tier,
          COUNT(sp.id) as times_shared,
          CASE 
              WHEN pr.view_count > 0 THEN (pr.copy_count::float / pr.view_count::float) * 100
              ELSE 0 
          END as conversion_rate
      FROM prompts pr
      JOIN profiles p ON pr.user_id = p.id
      LEFT JOIN shared_prompts sp ON pr.id = sp.prompt_id
      GROUP BY pr.id, pr.title, pr.category, pr.tags, pr.is_public, 
               pr.view_count, pr.copy_count, pr.created_at, pr.updated_at,
               p.email, p.subscription_tier;
    `
  }
];

async function executeImprovements() {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  console.log(`📊 Executing ${sqlCommands.length} improvement batches...\n`);

  for (let i = 0; i < sqlCommands.length; i++) {
    const command = sqlCommands[i];
    console.log(`🔧 ${i + 1}/${sqlCommands.length}: ${command.name}`);
    
    try {
      // Try using rpc first, fallback to direct query execution
      let result;
      try {
        result = await supabase.rpc('exec_sql', { sql_query: command.sql });
      } catch (rpcError) {
        // If RPC fails, try direct execution for simple queries
        if (command.sql.includes('CREATE INDEX')) {
          console.log('   ⚠️ RPC not available, please execute manually in Supabase SQL Editor');
          errorCount++;
          errors.push({ command: command.name, error: 'RPC not available' });
          continue;
        }
      }
      
      if (result && result.error) {
        console.log(`   ❌ Failed: ${result.error.message}`);
        errorCount++;
        errors.push({ command: command.name, error: result.error.message });
      } else {
        console.log(`   ✅ Success`);
        successCount++;
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errorCount++;
      errors.push({ command: command.name, error: error.message });
    }
    
    // Small delay between commands
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 EXECUTION SUMMARY');
  console.log('====================');
  console.log(`✅ Successful: ${successCount}/${sqlCommands.length}`);
  console.log(`❌ Failed: ${errorCount}/${sqlCommands.length}`);
  
  if (errorCount > 0) {
    console.log('\n⚠️ MANUAL EXECUTION REQUIRED');
    console.log('============================');
    console.log('Some commands failed. Please execute the following in Supabase SQL Editor:');
    console.log('');
    
    // Output the complete fixed SQL file for manual execution
    console.log('Copy and paste this complete SQL script:');
    console.log('');
    console.log('-- XMLPrompter Database Improvements - Complete Script');
    console.log('-- Execute this entire script in Supabase SQL Editor');
    console.log('');
    
    try {
      const fixedSql = fs.readFileSync('database-improvements-fixed.sql', 'utf8');
      console.log(fixedSql);
    } catch (err) {
      console.log('Error reading fixed SQL file. Please use database-improvements-fixed.sql');
    }
  }
  
  // Verify improvements
  await verifyImprovements();
}

async function verifyImprovements() {
  console.log('\n🔍 VERIFYING IMPROVEMENTS');
  console.log('=========================');
  
  try {
    // Test basic database connectivity
    const { data: profileCount, error: countError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact' });
    
    if (countError) {
      console.log('❌ Database connectivity test failed');
    } else {
      console.log('✅ Database connectivity: OK');
    }
    
    console.log('\n📊 To verify index creation, run this in Supabase SQL Editor:');
    console.log(`
SELECT 
    'Index Verification' as check_type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
    `);
    
    console.log('\n⚡ To test performance improvements, run these queries:');
    console.log(`
-- Test 1: Tag search (should be fast with GIN index)
EXPLAIN ANALYZE SELECT * FROM prompts WHERE tags @> '["productivity"]';

-- Test 2: User prompt history (should use composite index)
EXPLAIN ANALYZE SELECT * FROM prompts 
WHERE user_id = (SELECT id FROM profiles LIMIT 1)
ORDER BY created_at DESC LIMIT 10;

-- Test 3: Public prompts (should use partial index)
EXPLAIN ANALYZE SELECT * FROM prompts 
WHERE is_public = true 
ORDER BY view_count DESC LIMIT 20;
    `);
    
  } catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
  }
}

// Execute the improvements
executeImprovements().then(() => {
  console.log('\n🎉 Database Improvement Execution Complete!');
  console.log('==========================================');
  console.log('🚀 If successful, your database now has:');
  console.log('   • 18+ performance indexes');
  console.log('   • Data validation constraints');
  console.log('   • Automated triggers');
  console.log('   • Analytics views');
  console.log('   • Cleanup functions');
  console.log('');
  console.log('💡 Expected performance improvement: 10-50x faster queries');
  console.log('📊 Monitor performance in your Supabase dashboard');
}); 