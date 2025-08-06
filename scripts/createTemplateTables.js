#!/usr/bin/env node

/**
 * Direct Template Tables Creation Script
 * Creates the template tables directly using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 CREATING TEMPLATE TABLES DIRECTLY');
console.log('====================================\n');

async function createTemplateTables() {
  try {
    console.log('📋 Step 1: Creating template_categories table...');
    
    const createCategoriesTable = `
      CREATE TABLE IF NOT EXISTS template_categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT,
        color TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql_query: createCategoriesTable
    });
    
    if (categoriesError) {
      console.log(`❌ Error creating categories table: ${categoriesError.message}`);
    } else {
      console.log('✅ template_categories table created successfully');
    }
    
    console.log('\n📋 Step 2: Creating template_tags table...');
    
    const createTagsTable = `
      CREATE TABLE IF NOT EXISTS template_tags (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        category TEXT,
        usage_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: tagsError } = await supabase.rpc('exec_sql', {
      sql_query: createTagsTable
    });
    
    if (tagsError) {
      console.log(`❌ Error creating tags table: ${tagsError.message}`);
    } else {
      console.log('✅ template_tags table created successfully');
    }
    
    console.log('\n📋 Step 3: Creating templates table...');
    
    const createTemplatesTable = `
      CREATE TABLE IF NOT EXISTS templates (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category_id UUID REFERENCES template_categories(id),
        template_data JSONB NOT NULL DEFAULT '{}',
        preview_text TEXT,
        tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
        author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        author_name TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'pending_review')),
        is_featured BOOLEAN DEFAULT FALSE,
        is_system_template BOOLEAN DEFAULT FALSE,
        usage_count INTEGER DEFAULT 0,
        rating_average DECIMAL(3,2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        copy_count INTEGER DEFAULT 0,
        version INTEGER DEFAULT 1,
        parent_id UUID REFERENCES templates(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        published_at TIMESTAMP WITH TIME ZONE,
        CONSTRAINT templates_title_length CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
        CONSTRAINT templates_description_length CHECK (char_length(description) <= 1000)
      );
    `;
    
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql_query: createTemplatesTable
    });
    
    if (templatesError) {
      console.log(`❌ Error creating templates table: ${templatesError.message}`);
    } else {
      console.log('✅ templates table created successfully');
    }
    
    console.log('\n📋 Step 4: Creating template_tags_junction table...');
    
    const createJunctionTable = `
      CREATE TABLE IF NOT EXISTS template_tags_junction (
        template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES template_tags(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (template_id, tag_id)
      );
    `;
    
    const { error: junctionError } = await supabase.rpc('exec_sql', {
      sql_query: createJunctionTable
    });
    
    if (junctionError) {
      console.log(`❌ Error creating junction table: ${junctionError.message}`);
    } else {
      console.log('✅ template_tags_junction table created successfully');
    }
    
    console.log('\n📋 Step 5: Creating template_usage table...');
    
    const createUsageTable = `
      CREATE TABLE IF NOT EXISTS template_usage (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        action_type TEXT NOT NULL CHECK (action_type IN ('view', 'copy', 'use', 'rate', 'share')),
        session_id TEXT,
        source_page TEXT,
        search_query TEXT,
        filters_applied JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: usageError } = await supabase.rpc('exec_sql', {
      sql_query: createUsageTable
    });
    
    if (usageError) {
      console.log(`❌ Error creating usage table: ${usageError.message}`);
    } else {
      console.log('✅ template_usage table created successfully');
    }
    
    console.log('\n📋 Step 6: Creating template_ratings table...');
    
    const createRatingsTable = `
      CREATE TABLE IF NOT EXISTS template_ratings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        is_helpful BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(template_id, user_id)
      );
    `;
    
    const { error: ratingsError } = await supabase.rpc('exec_sql', {
      sql_query: createRatingsTable
    });
    
    if (ratingsError) {
      console.log(`❌ Error creating ratings table: ${ratingsError.message}`);
    } else {
      console.log('✅ template_ratings table created successfully');
    }
    
    console.log('\n📋 Step 7: Creating template_favorites table...');
    
    const createFavoritesTable = `
      CREATE TABLE IF NOT EXISTS template_favorites (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(template_id, user_id)
      );
    `;
    
    const { error: favoritesError } = await supabase.rpc('exec_sql', {
      sql_query: createFavoritesTable
    });
    
    if (favoritesError) {
      console.log(`❌ Error creating favorites table: ${favoritesError.message}`);
    } else {
      console.log('✅ template_favorites table created successfully');
    }
    
    console.log('\n📋 Step 8: Inserting initial data...');
    
    // Insert categories
    const categories = [
      { name: 'All Templates', description: 'Browse all available templates', icon: 'Grid', color: 'bg-gray-500', sort_order: 0 },
      { name: 'Marketing & Sales', description: 'Email campaigns, social media, advertising', icon: 'TrendingUp', color: 'bg-red-500', sort_order: 1 },
      { name: 'Development', description: 'Code documentation, API specs, technical writing', icon: 'Zap', color: 'bg-blue-500', sort_order: 2 },
      { name: 'Content Creation', description: 'Blog posts, articles, newsletters, copywriting', icon: 'BookOpen', color: 'bg-green-500', sort_order: 3 },
      { name: 'Analytics & Research', description: 'Data analysis, market research, insights', icon: 'BarChart3', color: 'bg-purple-500', sort_order: 4 },
      { name: 'Customer Support', description: 'Customer service, help documentation', icon: 'Users', color: 'bg-orange-500', sort_order: 5 },
      { name: 'Business & Strategy', description: 'Business plans, strategy, planning', icon: 'Crown', color: 'bg-indigo-500', sort_order: 6 },
      { name: 'Education', description: 'Lesson plans, training materials, academic', icon: 'GraduationCap', color: 'bg-teal-500', sort_order: 7 },
      { name: 'Creative', description: 'Creative writing, storytelling, design', icon: 'Palette', color: 'bg-pink-500', sort_order: 8 }
    ];
    
    for (const category of categories) {
      const { error: insertError } = await supabase
        .from('template_categories')
        .insert(category);
      
      if (insertError && !insertError.message.includes('duplicate')) {
        console.log(`❌ Error inserting category "${category.name}": ${insertError.message}`);
      } else {
        console.log(`✅ Category "${category.name}" inserted`);
      }
    }
    
    // Insert some popular tags
    const popularTags = [
      { name: 'SMEs', description: 'Small and Medium Enterprises', category: 'business' },
      { name: 'startups', description: 'Startup companies and entrepreneurs', category: 'business' },
      { name: 'email-marketing', description: 'Email marketing campaigns', category: 'marketing' },
      { name: 'social-media', description: 'Social media content', category: 'marketing' },
      { name: 'javascript', description: 'JavaScript development', category: 'development' },
      { name: 'python', description: 'Python development', category: 'development' },
      { name: 'blog-posts', description: 'Blog post creation', category: 'content' },
      { name: 'documentation', description: 'Technical documentation', category: 'development' }
    ];
    
    for (const tag of popularTags) {
      const { error: insertError } = await supabase
        .from('template_tags')
        .insert(tag);
      
      if (insertError && !insertError.message.includes('duplicate')) {
        console.log(`❌ Error inserting tag "${tag.name}": ${insertError.message}`);
      } else {
        console.log(`✅ Tag "${tag.name}" inserted`);
      }
    }
    
    console.log('\n📋 Step 9: Verifying table creation...');
    
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
    
    console.log('\n🎉 Template Tables Creation Complete!');
    console.log('=====================================');
    console.log('\n📝 Next Steps:');
    console.log('1. Run the template migration script: node scripts/migrateTemplatesToDatabase.js');
    console.log('2. Test the template API endpoints');
    console.log('3. Update the frontend to use the database-driven templates');
    
  } catch (error) {
    console.error('\n❌ Table creation failed:', error);
    process.exit(1);
  }
}

// Run the table creation
createTemplateTables(); 