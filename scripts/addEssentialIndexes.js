#!/usr/bin/env node

/**
 * Add Essential Database Indexes
 * Implements the high-priority indexes identified in the database analysis
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 ADDING ESSENTIAL DATABASE INDEXES');
console.log('====================================\n');

const indexes = [
  // Profiles table indexes
  {
    name: 'idx_profiles_subscription_tier',
    table: 'profiles',
    sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);',
    description: 'Speed up subscription tier filtering'
  },
  {
    name: 'idx_profiles_subscription_status',
    table: 'profiles',
    sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);',
    description: 'Speed up subscription status queries'
  },
  {
    name: 'idx_profiles_tier_status',
    table: 'profiles',
    sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_tier_status ON profiles(subscription_tier, subscription_status);',
    description: 'Composite index for admin dashboard queries'
  },
  
  // Prompts table indexes
  {
    name: 'idx_prompts_tags_gin',
    table: 'prompts',
    sql: 'CREATE INDEX IF NOT EXISTS idx_prompts_tags_gin ON prompts USING GIN(tags);',
    description: 'GIN index for efficient tag searches'
  },
  {
    name: 'idx_prompts_title_description_fts',
    table: 'prompts',
    sql: `CREATE INDEX IF NOT EXISTS idx_prompts_title_description_fts ON prompts 
          USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));`,
    description: 'Full-text search on title and description'
  },
  {
    name: 'idx_prompts_user_created',
    table: 'prompts',
    sql: 'CREATE INDEX IF NOT EXISTS idx_prompts_user_created ON prompts(user_id, created_at DESC);',
    description: 'Optimize user prompt history queries'
  },
  {
    name: 'idx_prompts_category_public',
    table: 'prompts',
    sql: 'CREATE INDEX IF NOT EXISTS idx_prompts_category_public ON prompts(category, is_public);',
    description: 'Speed up public prompt browsing by category'
  },
  {
    name: 'idx_prompts_public_trending',
    table: 'prompts',
    sql: 'CREATE INDEX IF NOT EXISTS idx_prompts_public_trending ON prompts(is_public, view_count DESC) WHERE is_public = true;',
    description: 'Partial index for trending public prompts'
  },
  {
    name: 'idx_prompts_model_usage',
    table: 'prompts',
    sql: 'CREATE INDEX IF NOT EXISTS idx_prompts_model_usage ON prompts(selected_model) WHERE selected_model IS NOT NULL;',
    description: 'Track model usage patterns'
  },
  
  // Usage tracking indexes
  {
    name: 'idx_usage_tracking_user_date',
    table: 'usage_tracking',
    sql: 'CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date ON usage_tracking(user_id, created_at DESC);',
    description: 'User activity timeline queries'
  },
  {
    name: 'idx_usage_tracking_action_date',
    table: 'usage_tracking',
    sql: 'CREATE INDEX IF NOT EXISTS idx_usage_tracking_action_date ON usage_tracking(action_type, created_at DESC);',
    description: 'Action type analytics'
  },
  {
    name: 'idx_usage_tracking_success_rate',
    table: 'usage_tracking',
    sql: 'CREATE INDEX IF NOT EXISTS idx_usage_tracking_success_rate ON usage_tracking(success, created_at DESC);',
    description: 'Success rate monitoring'
  },
  
  // Shared prompts indexes
  {
    name: 'idx_shared_prompts_token',
    table: 'shared_prompts',
    sql: 'CREATE INDEX IF NOT EXISTS idx_shared_prompts_token ON shared_prompts(share_token);',
    description: 'Fast share token lookups'
  },
  {
    name: 'idx_shared_prompts_creator',
    table: 'shared_prompts',
    sql: 'CREATE INDEX IF NOT EXISTS idx_shared_prompts_creator ON shared_prompts(created_by, created_at DESC);',
    description: 'Creator share history'
  },
  {
    name: 'idx_shared_prompts_public',
    table: 'shared_prompts',
    sql: 'CREATE INDEX IF NOT EXISTS idx_shared_prompts_public ON shared_prompts(is_public, view_count DESC) WHERE is_public = true;',
    description: 'Public share discovery'
  },
  
  // API keys indexes
  {
    name: 'idx_api_keys_user_active',
    table: 'api_keys',
    sql: 'CREATE INDEX IF NOT EXISTS idx_api_keys_user_active ON api_keys(user_id, is_active) WHERE is_active = true;',
    description: 'Active API keys per user'
  },
  {
    name: 'idx_api_keys_hash',
    table: 'api_keys',
    sql: 'CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);',
    description: 'Fast API key authentication'
  },
  
  // Rate limits indexes
  {
    name: 'idx_rate_limits_identifier',
    table: 'rate_limits',
    sql: 'CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, identifier_type, endpoint, window_start);',
    description: 'Rate limiting lookups'
  },
  {
    name: 'idx_rate_limits_cleanup',
    table: 'rate_limits',
    sql: 'CREATE INDEX IF NOT EXISTS idx_rate_limits_cleanup ON rate_limits(window_start);',
    description: 'Cleanup old rate limit windows'
  }
];

async function addIndexes() {
  console.log('📊 Starting index creation process...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const index of indexes) {
    try {
      console.log(`🔧 Creating: ${index.name}`);
      console.log(`   Table: ${index.table}`);
      console.log(`   Purpose: ${index.description}`);
      
      // Execute the index creation
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: index.sql 
      }).catch(async () => {
        // Fallback for databases without exec_sql function
        throw new Error('Direct SQL execution not available - use Supabase SQL editor');
      });
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Created successfully`);
        successCount++;
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
    
    console.log(''); // Empty line for spacing
  }
  
  console.log('📊 INDEX CREATION SUMMARY');
  console.log('=========================');
  console.log(`✅ Successfully created: ${successCount} indexes`);
  console.log(`❌ Failed to create: ${errorCount} indexes`);
  console.log(`📊 Total attempted: ${indexes.length} indexes`);
  
  if (errorCount > 0) {
    console.log('\n⚠️ MANUAL EXECUTION REQUIRED');
    console.log('============================');
    console.log('Some indexes failed to create automatically.');
    console.log('Please run the following SQL commands in your Supabase SQL Editor:');
    console.log('');
    
    indexes.forEach(index => {
      console.log(`-- ${index.description}`);
      console.log(index.sql);
      console.log('');
    });
  }
  
  console.log('\n🎯 NEXT STEPS');
  console.log('=============');
  console.log('1. Monitor query performance improvements');
  console.log('2. Set up query monitoring dashboard');
  console.log('3. Implement full-text search features');
  console.log('4. Add monitoring for slow queries');
  console.log('5. Consider adding more specialized indexes based on usage patterns');
  
  console.log('\n💡 PERFORMANCE TESTING');
  console.log('======================');
  console.log('Test these common queries to verify performance improvements:');
  console.log('• SELECT * FROM prompts WHERE tags @> \'["marketing"]\';');
  console.log('• SELECT * FROM prompts WHERE to_tsvector(\'english\', title) @@ to_tsquery(\'email\');');
  console.log('• SELECT * FROM prompts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10;');
  console.log('• SELECT * FROM prompts WHERE is_public = true ORDER BY view_count DESC LIMIT 20;');
}

// Additional utility functions
async function analyzeIndexUsage() {
  console.log('\n📈 INDEX USAGE ANALYSIS');
  console.log('=======================');
  
  try {
    // This would require special permissions, so we'll provide the SQL for manual execution
    console.log('Run this query in Supabase SQL Editor to analyze index usage:');
    console.log('');
    console.log(`
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
    `);
    
  } catch (error) {
    console.log('⚠️ Index usage analysis requires special permissions');
  }
}

// Run the index creation
addIndexes().then(() => {
  console.log('\n✅ Index Creation Process Complete!');
  console.log('==================================');
  console.log('🚀 Your database performance should be significantly improved!');
  console.log('💡 Use your MCP assistant to test queries and monitor performance');
  
  // Show index usage analysis
  analyzeIndexUsage();
}); 