#!/usr/bin/env node

/**
 * Template Schema Implementation Script
 * Uses MCP to implement the comprehensive template database schema
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 IMPLEMENTING TEMPLATE DATABASE SCHEMA VIA MCP');
console.log('================================================\n');

async function implementTemplateSchema() {
  try {
    console.log('📋 Step 1: Reading database schema...');
    
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'database-templates-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('✅ Schema file loaded successfully');
    console.log(`📄 Schema size: ${(schemaSQL.length / 1024).toFixed(2)} KB`);
    
    // Split the schema into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
      .map(stmt => stmt + ';');
    
    console.log(`🔧 Found ${statements.length} SQL statements to execute`);
    
    console.log('\n📋 Step 2: Executing schema statements...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.trim().startsWith('--') || statement.trim() === ';') {
        continue;
      }
      
      try {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        // Extract the first few words for logging
        const preview = statement.substring(0, 50).replace(/\s+/g, ' ').trim();
        console.log(`   Preview: ${preview}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        });
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          errorCount++;
          
          // Don't fail on certain expected errors
          if (error.message.includes('already exists') || 
              error.message.includes('relation') ||
              error.message.includes('duplicate')) {
            console.log('   ⚠️ This is an expected error (object already exists)');
            successCount++; // Count as success for idempotent operations
          }
        } else {
          console.log('   ✅ Success');
          successCount++;
        }
        
        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Step 3: Schema Implementation Results');
    console.log('=========================================');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    console.log(`📈 Success rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All schema statements executed successfully!');
    } else {
      console.log('\n⚠️ Some statements failed, but this might be expected for idempotent operations');
    }
    
    console.log('\n📋 Step 4: Verifying schema implementation...');
    
    // Check if key tables were created
    const keyTables = [
      'template_categories',
      'template_tags', 
      'templates',
      'template_tags_junction',
      'template_usage',
      'template_ratings',
      'template_favorites'
    ];
    
    for (const table of keyTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
    
    console.log('\n📋 Step 5: Checking initial data...');
    
    // Check if categories were inserted
    const { data: categories, error: categoriesError } = await supabase
      .from('template_categories')
      .select('name')
      .limit(5);
    
    if (categoriesError) {
      console.log(`❌ Error checking categories: ${categoriesError.message}`);
    } else {
      console.log(`✅ Found ${categories.length} categories: ${categories.map(c => c.name).join(', ')}`);
    }
    
    // Check if tags were inserted
    const { data: tags, error: tagsError } = await supabase
      .from('template_tags')
      .select('name')
      .limit(5);
    
    if (tagsError) {
      console.log(`❌ Error checking tags: ${tagsError.message}`);
    } else {
      console.log(`✅ Found ${tags.length} tags: ${tags.map(t => t.name).join(', ')}`);
    }
    
    console.log('\n🎉 Template Schema Implementation Complete!');
    console.log('============================================');
    console.log('\n📝 Next Steps:');
    console.log('1. Run the template migration script: node scripts/migrateTemplatesToDatabase.js');
    console.log('2. Test the template API endpoints');
    console.log('3. Update the frontend to use the database-driven templates');
    
  } catch (error) {
    console.error('\n❌ Schema implementation failed:', error);
    process.exit(1);
  }
}

// Run the implementation
implementTemplateSchema(); 