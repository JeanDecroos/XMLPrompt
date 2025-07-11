#!/usr/bin/env node

/**
 * Test script to verify MCP connection with Supabase
 * This script helps debug MCP setup and connection issues
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const projectRef = process.env.SUPABASE_PROJECT_REF;

console.log('🔍 MCP Connection Test Starting...\n');

// Test 1: Environment Variables
console.log('📋 Step 1: Checking Environment Variables');
console.log('----------------------------------------');

const checks = [
  { name: 'VITE_SUPABASE_URL', value: supabaseUrl, required: true },
  { name: 'VITE_SUPABASE_ANON_KEY', value: supabaseAnonKey, required: true },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', value: supabaseServiceKey, required: false },
  { name: 'SUPABASE_ACCESS_TOKEN', value: accessToken, required: true },
  { name: 'SUPABASE_PROJECT_REF', value: projectRef, required: true }
];

let envErrors = 0;
checks.forEach(check => {
  if (check.value) {
    console.log(`✅ ${check.name}: ${check.value.substring(0, 20)}...`);
  } else {
    console.log(`${check.required ? '❌' : '⚠️'} ${check.name}: Not set`);
    if (check.required) envErrors++;
  }
});

if (envErrors > 0) {
  console.log(`\n❌ ${envErrors} required environment variables are missing!`);
  console.log('Please check your .env.local file and follow the setup guide.');
  process.exit(1);
}

console.log('\n✅ All required environment variables are set!\n');

// Test 2: Basic Supabase Connection
console.log('🔗 Step 2: Testing Supabase Connection');
console.log('-------------------------------------');

try {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Test basic connection
  const { data, error } = await supabase.from('profiles').select('count').limit(1);
  
  if (error) {
    console.log('❌ Supabase connection failed:', error.message);
    console.log('   This might be normal if you haven\'t set up the database schema yet.');
  } else {
    console.log('✅ Supabase connection successful!');
  }
} catch (error) {
  console.log('❌ Supabase connection error:', error.message);
}

// Test 3: Database Schema Check
console.log('\n🗄️ Step 3: Checking Database Schema');
console.log('-----------------------------------');

try {
  const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);
  
  // Check if core tables exist
  const tables = ['profiles', 'prompts', 'usage_tracking'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`⚠️ Table '${table}' does not exist`);
        } else {
          console.log(`❌ Error checking table '${table}':`, error.message);
        }
      } else {
        console.log(`✅ Table '${table}' exists and is accessible`);
      }
    } catch (err) {
      console.log(`❌ Error checking table '${table}':`, err.message);
    }
  }
} catch (error) {
  console.log('❌ Database schema check failed:', error.message);
}

// Test 4: MCP Server Configuration Check
console.log('\n⚙️ Step 4: MCP Configuration Check');
console.log('----------------------------------');

console.log('Expected MCP Configuration:');
console.log(JSON.stringify({
  mcpServers: {
    supabase: {
      command: "npx",
      args: [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        `--project-ref=${projectRef}`
      ],
      env: {
        SUPABASE_ACCESS_TOKEN: accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT_SET'
      }
    }
  }
}, null, 2));

console.log('\n📝 Instructions:');
console.log('1. Copy the configuration above');
console.log('2. Open Cursor IDE Settings');
console.log('3. Navigate to MCP tab');
console.log('4. Click "Add new global MCP Server"');
console.log('5. Paste the configuration');
console.log('6. Replace the truncated token with your full token');
console.log('7. Save and restart Cursor');

// Test 5: Sample Queries
console.log('\n🔍 Step 5: Sample MCP Queries to Test');
console.log('------------------------------------');

const sampleQueries = [
  "Can you show me information about my Supabase project?",
  "What tables exist in my database?",
  "Can you describe the structure of the prompts table?",
  "How many users are in the profiles table?",
  "Show me the latest 5 prompts created",
  "What are the most popular prompt categories?",
  "Generate a report of user engagement metrics"
];

console.log('Try these queries in Cursor chat (Agent mode):');
sampleQueries.forEach((query, index) => {
  console.log(`${index + 1}. "${query}"`);
});

// Test 6: Troubleshooting Tips
console.log('\n🛠️ Step 6: Troubleshooting Tips');
console.log('-------------------------------');

console.log('If MCP is not working:');
console.log('1. Check that your Personal Access Token has the right permissions');
console.log('2. Verify your project reference ID is correct');
console.log('3. Ensure you have internet connection for npx to download the server');
console.log('4. Try restarting the MCP server in Cursor settings');
console.log('5. Check Cursor\'s MCP server logs for error messages');
console.log('6. Make sure you\'re using Cursor (not VS Code) as MCP support varies');

console.log('\n🎉 MCP Connection Test Complete!');
console.log('================================');

console.log('Next steps:');
console.log('1. Set up the MCP server in Cursor using the configuration above');
console.log('2. Test the sample queries in Cursor chat');
console.log('3. If issues persist, check the troubleshooting section in the guide');
console.log('4. Create your database schema using the SQL provided in the guide');

console.log('\n📚 For more help, see: SUPABASE_MCP_INTEGRATION_GUIDE.md'); 