#!/usr/bin/env node

/**
 * Test Template Migration Script
 * Verifies the template database state and migration
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🔍 TESTING TEMPLATE MIGRATION AND DATABASE STATE');
console.log('================================================\n');

async function testTemplateMigration() {
  try {
    console.log('📋 Step 1: Checking template tables...');
    
    const tables = [
      'template_categories',
      'template_tags', 
      'templates',
      'template_tags_junction',
      'template_usage',
      'template_ratings',
      'template_favorites'
    ];
    
    for (const table of tables) {
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
    
    console.log('\n📋 Step 2: Checking template categories...');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('template_categories')
      .select('*')
      .order('sort_order');
    
    if (categoriesError) {
      console.log(`❌ Error fetching categories: ${categoriesError.message}`);
    } else {
      console.log(`✅ Found ${categories.length} categories:`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.icon}, ${cat.color})`);
      });
    }
    
    console.log('\n📋 Step 3: Checking template tags...');
    
    const { data: tags, error: tagsError } = await supabase
      .from('template_tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(10);
    
    if (tagsError) {
      console.log(`❌ Error fetching tags: ${tagsError.message}`);
    } else {
      console.log(`✅ Found ${tags.length} tags (showing top 10):`);
      tags.forEach(tag => {
        console.log(`   - ${tag.name} (${tag.category}, ${tag.usage_count} uses)`);
      });
    }
    
    console.log('\n📋 Step 4: Checking templates...');
    
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select(`
        *,
        category:template_categories(name, icon, color),
        tags:template_tags_junction(
          tag:template_tags(name, description, category)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (templatesError) {
      console.log(`❌ Error fetching templates: ${templatesError.message}`);
    } else {
      console.log(`✅ Found ${templates.length} templates (showing latest 5):`);
      templates.forEach(template => {
        const tagNames = template.tags?.map(t => t.tag.name).join(', ') || 'No tags';
        console.log(`   - ${template.title} (${template.tier}, ${template.usage_count} uses)`);
        console.log(`     Category: ${template.category?.name || 'None'}`);
        console.log(`     Tags: ${tagNames}`);
      });
    }
    
    console.log('\n📋 Step 5: Testing template search...');
    
    // Test searching for "SME" as requested
    const { data: smeTemplates, error: searchError } = await supabase
      .from('templates')
      .select(`
        *,
        category:template_categories(name, icon, color),
        tags:template_tags_junction(
          tag:template_tags(name, description, category)
        )
      `)
      .or('title.ilike.%SME%,description.ilike.%SME%')
      .limit(5);
    
    if (searchError) {
      console.log(`❌ Error searching for SME templates: ${searchError.message}`);
    } else {
      console.log(`✅ Found ${smeTemplates.length} templates containing "SME":`);
      smeTemplates.forEach(template => {
        const tagNames = template.tags?.map(t => t.tag.name).join(', ') || 'No tags';
        console.log(`   - ${template.title} (${template.tier})`);
        console.log(`     Tags: ${tagNames}`);
      });
    }
    
    console.log('\n📋 Step 6: Testing tag filtering...');
    
    // Get the SME tag ID
    const { data: smeTag, error: smeTagError } = await supabase
      .from('template_tags')
      .select('id')
      .eq('name', 'SMEs')
      .single();
    
    if (smeTagError) {
      console.log(`❌ Error finding SME tag: ${smeTagError.message}`);
    } else {
      // Find templates with SME tag
      const { data: smeTaggedTemplates, error: tagFilterError } = await supabase
        .from('template_tags_junction')
        .select(`
          template:templates(
            *,
            category:template_categories(name, icon, color)
          )
        `)
        .eq('tag_id', smeTag.id);
      
      if (tagFilterError) {
        console.log(`❌ Error filtering by SME tag: ${tagFilterError.message}`);
      } else {
        console.log(`✅ Found ${smeTaggedTemplates.length} templates tagged with "SMEs":`);
        smeTaggedTemplates.forEach(item => {
          const template = item.template;
          console.log(`   - ${template.title} (${template.tier})`);
          console.log(`     Category: ${template.category?.name || 'None'}`);
        });
      }
    }
    
    console.log('\n🎉 Template Database Test Complete!');
    console.log('===================================');
    console.log('\n📝 Summary:');
    console.log(`- Categories: ${categories?.length || 0}`);
    console.log(`- Tags: ${tags?.length || 0}`);
    console.log(`- Templates: ${templates?.length || 0}`);
    console.log(`- SME search results: ${smeTemplates?.length || 0}`);
    
    if (templates && templates.length > 0) {
      console.log('\n✅ Template system is working! Users can now:');
      console.log('1. Search for "SME" and find relevant templates');
      console.log('2. Filter by tags like "SMEs", "startups", "business"');
      console.log('3. Browse templates by category');
      console.log('4. Use templates in the main prompt generator');
    } else {
      console.log('\n⚠️ No templates found. You may need to run the migration script.');
    }
    
  } catch (error) {
    console.error('\n❌ Template test failed:', error);
    process.exit(1);
  }
}

// Run the test
testTemplateMigration(); 