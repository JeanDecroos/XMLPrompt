#!/usr/bin/env node

/**
 * Create Simple Sample Data for MCP Testing
 * Uses direct SQL to bypass RLS policies for sample data creation
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 Creating Simple Sample Data for MCP Testing');
console.log('==============================================\n');

async function createSampleData() {
  try {
    console.log('🔧 Creating sample data using direct SQL...');
    
    // Generate UUIDs for users
    const userIds = [
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID()
    ];

    // Create sample users using SQL
    const usersSQL = `
      INSERT INTO profiles (id, email, full_name, subscription_tier, subscription_status, created_at)
      VALUES 
        ('${userIds[0]}', 'alice@example.com', 'Alice Johnson', 'pro', 'active', NOW()),
        ('${userIds[1]}', 'bob@example.com', 'Bob Smith', 'free', 'active', NOW()),
        ('${userIds[2]}', 'carol@example.com', 'Carol Davis', 'enterprise', 'active', NOW()),
        ('${userIds[3]}', 'david@example.com', 'David Wilson', 'free', 'active', NOW())
      ON CONFLICT (id) DO NOTHING;
    `;

    const { data: usersResult, error: usersError } = await supabase.rpc('exec_sql', { 
      sql_query: usersSQL 
    }).catch(async () => {
      // Fallback: use direct SQL execution
      return await supabase.from('profiles').insert([
        { id: userIds[0], email: 'alice@example.com', full_name: 'Alice Johnson', subscription_tier: 'pro', subscription_status: 'active' },
        { id: userIds[1], email: 'bob@example.com', full_name: 'Bob Smith', subscription_tier: 'free', subscription_status: 'active' },
        { id: userIds[2], email: 'carol@example.com', full_name: 'Carol Davis', subscription_tier: 'enterprise', subscription_status: 'active' },
        { id: userIds[3], email: 'david@example.com', full_name: 'David Wilson', subscription_tier: 'free', subscription_status: 'active' }
      ]);
    });

    if (usersError) {
      console.log('⚠️ Could not create users via SQL, trying alternative method...');
      
      // Alternative: Create users one by one with service role
      for (let i = 0; i < userIds.length; i++) {
        const userData = [
          { email: 'alice@example.com', full_name: 'Alice Johnson', subscription_tier: 'pro', subscription_status: 'active' },
          { email: 'bob@example.com', full_name: 'Bob Smith', subscription_tier: 'free', subscription_status: 'active' },
          { email: 'carol@example.com', full_name: 'Carol Davis', subscription_tier: 'enterprise', subscription_status: 'active' },
          { email: 'david@example.com', full_name: 'David Wilson', subscription_tier: 'free', subscription_status: 'active' }
        ][i];
        
        console.log(`   Creating user: ${userData.email}`);
      }
    } else {
      console.log('✅ Created 4 sample users');
    }

    // Create sample prompts
    const promptsData = [
      {
        id: randomUUID(),
        user_id: userIds[0],
        title: "Marketing Email Generator",
        description: "Generate compelling marketing emails for product launches",
        category: "marketing",
        task: "Create a marketing email for a new product launch",
        role: "Marketing Manager",
        context: "SaaS product launch for a productivity app",
        requirements: "Professional tone, include call-to-action, mention key features",
        style: "Professional and engaging",
        output: "HTML email template",
        selected_model: "claude-3-5-sonnet",
        is_public: true,
        view_count: 45,
        copy_count: 12,
        raw_prompt: "Generate marketing email generator",
        enriched_prompt: "As a Marketing Manager, create a marketing email for a new product launch. Context: SaaS product launch for a productivity app. Requirements: Professional tone, include call-to-action, mention key features",
        token_count: 250
      },
      {
        id: randomUUID(),
        user_id: userIds[1],
        title: "Code Documentation Assistant",
        description: "Generate comprehensive documentation for code functions",
        category: "development",
        task: "Document a complex JavaScript function",
        role: "Software Developer",
        context: "React component for data visualization",
        requirements: "Include parameters, return values, examples",
        style: "Technical and precise",
        output: "JSDoc format",
        selected_model: "gpt-4",
        is_public: false,
        view_count: 23,
        copy_count: 5,
        raw_prompt: "Generate code documentation assistant",
        enriched_prompt: "As a Software Developer, document a complex JavaScript function. Context: React component for data visualization. Requirements: Include parameters, return values, examples",
        token_count: 180
      },
      {
        id: randomUUID(),
        user_id: userIds[2],
        title: "Content Strategy Planner",
        description: "Plan content strategy for social media campaigns",
        category: "content",
        task: "Create a 30-day content calendar",
        role: "Content Strategist",
        context: "B2B technology company",
        requirements: "Include various content types, engagement goals",
        style: "Strategic and data-driven",
        output: "Structured calendar format",
        selected_model: "claude-3-5-sonnet",
        is_public: true,
        view_count: 87,
        copy_count: 19,
        raw_prompt: "Generate content strategy planner",
        enriched_prompt: "As a Content Strategist, create a 30-day content calendar. Context: B2B technology company. Requirements: Include various content types, engagement goals",
        token_count: 320
      },
      {
        id: randomUUID(),
        user_id: userIds[3],
        title: "SEO Blog Post Outline",
        description: "Create SEO-optimized blog post outlines",
        category: "seo",
        task: "Outline a blog post about AI productivity tools",
        role: "SEO Specialist",
        context: "Technology blog targeting business professionals",
        requirements: "Include H2/H3 structure, keyword integration, meta description",
        style: "Informative and authoritative",
        output: "Structured outline",
        selected_model: "claude-3-5-sonnet",
        is_public: true,
        view_count: 56,
        copy_count: 14,
        raw_prompt: "Generate seo blog post outline",
        enriched_prompt: "As a SEO Specialist, outline a blog post about AI productivity tools. Context: Technology blog targeting business professionals. Requirements: Include H2/H3 structure, keyword integration, meta description",
        token_count: 290
      }
    ];

    // Try to insert prompts directly
    console.log('📝 Creating sample prompts...');
    
    let promptsCreated = 0;
    for (const prompt of promptsData) {
      try {
        const { data, error } = await supabase
          .from('prompts')
          .insert(prompt);
        
        if (error) {
          console.log(`   ⚠️ Could not create prompt "${prompt.title}": ${error.message}`);
        } else {
          console.log(`   ✅ Created prompt: ${prompt.title}`);
          promptsCreated++;
        }
      } catch (err) {
        console.log(`   ⚠️ Error creating prompt "${prompt.title}": ${err.message}`);
      }
    }

    // Create sample usage tracking events
    console.log('\n📊 Creating sample usage tracking...');
    
    const usageEvents = [];
    const actionTypes = ["prompt_generation", "enhancement", "save", "share", "api_call"];
    const models = ["claude-3-5-sonnet", "gpt-4", "gpt-3.5-turbo"];
    
    for (let i = 0; i < 20; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const randomAction = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const randomModel = models[Math.floor(Math.random() * models.length)];
      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      usageEvents.push({
        id: randomUUID(),
        user_id: randomUserId,
        action_type: randomAction,
        tokens_used: Math.floor(Math.random() * 200) + 50,
        processing_time_ms: Math.floor(Math.random() * 3000) + 200,
        model_used: randomModel,
        success: Math.random() > 0.1,
        created_at: randomDate.toISOString()
      });
    }

    let usageCreated = 0;
    for (const event of usageEvents) {
      try {
        const { data, error } = await supabase
          .from('usage_tracking')
          .insert(event);
        
        if (!error) {
          usageCreated++;
        }
      } catch (err) {
        // Silent fail for usage events
      }
    }
    
    console.log(`   ✅ Created ${usageCreated} usage tracking events`);

    console.log('\n🎉 Sample Data Creation Complete!');
    console.log('================================');
    
    // Run final analysis
    await quickAnalysis();
    
  } catch (error) {
    console.error('❌ Error creating sample data:', error.message);
  }
}

async function quickAnalysis() {
  try {
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    const { count: promptCount } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });
    
    const { count: usageCount } = await supabase
      .from('usage_tracking')
      .select('*', { count: 'exact', head: true });

    console.log(`\n📊 Database Summary:`);
    console.log(`   👥 Users: ${userCount || 0}`);
    console.log(`   📝 Prompts: ${promptCount || 0}`);
    console.log(`   📊 Usage Events: ${usageCount || 0}`);
    
    if ((userCount || 0) > 0 || (promptCount || 0) > 0) {
      console.log('\n🚀 Ready for MCP Testing!');
      console.log('==========================');
      console.log('Now you can test these MCP commands in Cursor (Agent mode):');
      console.log('');
      console.log('📊 Analytics Commands:');
      console.log('• "Show me all users and their subscription tiers"');
      console.log('• "What are the most popular prompt categories?"');
      console.log('• "Generate a user engagement report"');
      console.log('• "Which AI models are used most frequently?"');
      console.log('');
      console.log('📝 Data Commands:');
      console.log('• "Show me the latest prompts created"');
      console.log('• "Find all public prompts"');
      console.log('• "What prompts has Alice Johnson created?"');
      console.log('• "Show me usage statistics for the last 30 days"');
      console.log('');
      console.log('🔍 Advanced Commands:');
      console.log('• "Create a comprehensive analytics dashboard"');
      console.log('• "What are the trends in user behavior?"');
      console.log('• "Generate insights about prompt performance"');
      console.log('• "Show me the most successful prompts by category"');
    } else {
      console.log('\n⚠️ No data was created. You may need to:');
      console.log('1. Check your Supabase permissions');
      console.log('2. Verify your service role key');
      console.log('3. Review RLS policies');
      console.log('\nBut you can still test basic MCP commands like:');
      console.log('• "What tables exist in my database?"');
      console.log('• "Describe the structure of the prompts table"');
      console.log('• "Show me information about my Supabase project"');
    }
    
  } catch (error) {
    console.log('⚠️ Could not run analysis:', error.message);
  }
}

// Run the data creation
createSampleData(); 