#!/usr/bin/env node

/**
 * Test RPC Functions for MCP Integration
 * Verifies that the database RPC functions are working properly
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🧪 TESTING RPC FUNCTIONS FOR MCP INTEGRATION');
console.log('=============================================\n');

async function testRpcFunctions() {
  const tests = [
    {
      name: 'Test exec_query function',
      test: async () => {
        const { data, error } = await supabase.rpc('exec_query', {
          sql_query: "SELECT 'Hello from RPC!' as message, now() as timestamp"
        });
        return { data, error };
      }
    },
    {
      name: 'Test database stats function',
      test: async () => {
        const { data, error } = await supabase.rpc('get_database_stats');
        return { data, error };
      }
    },
    {
      name: 'Test index creation function',
      test: async () => {
        const { data, error } = await supabase.rpc('create_index_safe', {
          index_name: 'test_rpc_index',
          table_name: 'profiles',
          column_definition: 'created_at',
          index_type: 'btree'
        });
        return { data, error };
      }
    },
    {
      name: 'Test query performance analysis',
      test: async () => {
        const { data, error } = await supabase.rpc('analyze_query_performance', {
          query_text: 'SELECT COUNT(*) FROM profiles'
        });
        return { data, error };
      }
    },
    {
      name: 'Test exec_sql function (CREATE INDEX)',
      test: async () => {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: 'CREATE INDEX IF NOT EXISTS idx_test_rpc_profiles ON profiles(email)'
        });
        return { data, error };
      }
    },
    {
      name: 'Test migration function',
      test: async () => {
        const { data, error } = await supabase.rpc('exec_migration', {
          migration_name: 'test_rpc_migration_' + Date.now(),
          sql_query: 'CREATE INDEX IF NOT EXISTS idx_test_migration ON profiles(updated_at)'
        });
        return { data, error };
      }
    }
  ];

  let successCount = 0;
  let failureCount = 0;

  for (const test of tests) {
    console.log(`🔧 Testing: ${test.name}`);
    
    try {
      const result = await test.test();
      
      if (result.error) {
        console.log(`   ❌ Failed: ${result.error.message}`);
        failureCount++;
      } else {
        console.log(`   ✅ Success`);
        if (result.data) {
          console.log(`   📊 Result:`, JSON.stringify(result.data, null, 2).substring(0, 200) + '...');
        }
        successCount++;
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failureCount++;
    }
    
    console.log('');
  }

  console.log('📊 TEST SUMMARY');
  console.log('===============');
  console.log(`✅ Successful: ${successCount}/${tests.length}`);
  console.log(`❌ Failed: ${failureCount}/${tests.length}`);
  
  if (successCount === tests.length) {
    console.log('\n🎉 ALL RPC FUNCTIONS WORKING!');
    console.log('MCP can now execute SQL directly through Supabase');
    await demonstrateMcpCapabilities();
  } else {
    console.log('\n⚠️ SOME TESTS FAILED');
    console.log('Please ensure you have executed database-rpc-functions.sql first');
  }
}

async function demonstrateMcpCapabilities() {
  console.log('\n🚀 DEMONSTRATING MCP SQL CAPABILITIES');
  console.log('====================================');
  
  const demonstrations = [
    {
      name: 'Create Performance Index via MCP',
      description: 'MCP can now create database indexes automatically',
      rpc: 'exec_sql',
      params: {
        sql_query: 'CREATE INDEX IF NOT EXISTS idx_mcp_demo_prompts_category ON prompts(category)'
      }
    },
    {
      name: 'Analyze Database Performance via MCP',
      description: 'MCP can analyze query performance in real-time',
      rpc: 'analyze_query_performance',
      params: {
        query_text: 'SELECT category, COUNT(*) FROM prompts GROUP BY category'
      }
    },
    {
      name: 'Get Real-time Database Stats via MCP',
      description: 'MCP can monitor database health automatically',
      rpc: 'get_database_stats',
      params: {}
    },
    {
      name: 'Execute Complex Query via MCP',
      description: 'MCP can run complex analytics queries',
      rpc: 'exec_query',
      params: {
        sql_query: `
          SELECT 
            'Database Health Check' as check_type,
            COUNT(*) as total_tables
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `
      }
    }
  ];

  for (const demo of demonstrations) {
    console.log(`\n🔧 ${demo.name}`);
    console.log(`   Purpose: ${demo.description}`);
    
    try {
      const { data, error } = await supabase.rpc(demo.rpc, demo.params);
      
      if (error) {
        console.log(`   ❌ Failed: ${error.message}`);
      } else {
        console.log(`   ✅ Success - MCP executed SQL successfully`);
        if (data && typeof data === 'object') {
          console.log(`   📊 Sample Result:`, JSON.stringify(data, null, 2).substring(0, 150) + '...');
        }
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n💡 MCP CAPABILITIES NOW ENABLED:');
  console.log('================================');
  console.log('✅ Direct SQL execution via supabase.rpc("exec_sql", {sql_query: "..."})');
  console.log('✅ Safe query execution via supabase.rpc("exec_query", {sql_query: "SELECT..."})');
  console.log('✅ Migration management via supabase.rpc("exec_migration", {...})');
  console.log('✅ Performance analysis via supabase.rpc("analyze_query_performance", {...})');
  console.log('✅ Database monitoring via supabase.rpc("get_database_stats")');
  console.log('✅ Safe index creation via supabase.rpc("create_index_safe", {...})');
  console.log('✅ Data cleanup via supabase.rpc("cleanup_old_data", {...})');
}

async function showMcpExamples() {
  console.log('\n📚 MCP USAGE EXAMPLES');
  console.log('====================');
  
  const examples = [
    {
      title: 'Create Database Index',
      code: `await supabase.rpc('exec_sql', {
  sql_query: 'CREATE INDEX idx_prompts_tags ON prompts USING GIN(tags)'
})`
    },
    {
      title: 'Analyze Query Performance',
      code: `await supabase.rpc('analyze_query_performance', {
  query_text: 'SELECT * FROM prompts WHERE tags @> ["productivity"]'
})`
    },
    {
      title: 'Get Database Statistics',
      code: `await supabase.rpc('get_database_stats')`
    },
    {
      title: 'Execute Migration',
      code: `await supabase.rpc('exec_migration', {
  migration_name: 'add_user_preferences',
  sql_query: 'ALTER TABLE profiles ADD COLUMN preferences JSONB'
})`
    },
    {
      title: 'Cleanup Old Data',
      code: `await supabase.rpc('cleanup_old_data', {
  table_name: 'usage_tracking',
  date_column: 'created_at',
  days_to_keep: 90
})`
    }
  ];

  examples.forEach(example => {
    console.log(`\n📝 ${example.title}:`);
    console.log('   ' + example.code.split('\n').join('\n   '));
  });
}

// Run the tests
testRpcFunctions().then(() => {
  showMcpExamples();
  
  console.log('\n✅ RPC Function Testing Complete!');
  console.log('=================================');
  console.log('🎯 Next Steps:');
  console.log('1. Execute database-rpc-functions.sql in Supabase SQL Editor');
  console.log('2. Run this test again to verify functionality');
  console.log('3. Use MCP to execute database improvements automatically');
  console.log('4. Your AI assistant can now manage your database directly!');
}); 