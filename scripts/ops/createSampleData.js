#!/usr/bin/env node

/**
 * Create Sample Data for MCP Testing
 * Generates realistic sample data to test MCP functionality
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

console.log('🚀 Creating Sample Data for MCP Testing');
console.log('======================================\n');

// Sample data generators
const samplePrompts = [
  {
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
    view_count: Math.floor(Math.random() * 100),
    copy_count: Math.floor(Math.random() * 20)
  },
  {
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
    view_count: Math.floor(Math.random() * 50),
    copy_count: Math.floor(Math.random() * 10)
  },
  {
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
    view_count: Math.floor(Math.random() * 200),
    copy_count: Math.floor(Math.random() * 30)
  },
  {
    title: "Customer Support Response",
    description: "Generate empathetic customer support responses",
    category: "support",
    task: "Respond to a billing inquiry",
    role: "Customer Support Agent",
    context: "SaaS subscription service",
    requirements: "Empathetic tone, clear explanation, solution-focused",
    style: "Friendly and professional",
    output: "Email response",
    selected_model: "gpt-4",
    is_public: false,
    view_count: Math.floor(Math.random() * 75),
    copy_count: Math.floor(Math.random() * 15)
  },
  {
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
    view_count: Math.floor(Math.random() * 150),
    copy_count: Math.floor(Math.random() * 25)
  }
];

const sampleUsers = [
  {
    email: "alice@example.com",
    full_name: "Alice Johnson",
    subscription_tier: "pro",
    subscription_status: "active"
  },
  {
    email: "bob@example.com",
    full_name: "Bob Smith",
    subscription_tier: "free",
    subscription_status: "active"
  },
  {
    email: "carol@example.com",
    full_name: "Carol Davis",
    subscription_tier: "enterprise",
    subscription_status: "active"
  },
  {
    email: "david@example.com",
    full_name: "David Wilson",
    subscription_tier: "free",
    subscription_status: "active"
  }
];

const sampleUsageEvents = [
  "prompt_generation",
  "enhancement",
  "save",
  "share",
  "api_call"
];

async function createSampleData() {
  try {
    console.log('👥 Creating sample users...');
    
    // Create sample users (these would normally be created via auth)
    const userIds = [];
    for (let i = 0; i < sampleUsers.length; i++) {
      const userId = randomUUID();
      userIds.push(userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          ...sampleUsers[i]
        });
      
      if (error) {
        console.log(`⚠️ Could not create user ${sampleUsers[i].email}:`, error.message);
      } else {
        console.log(`✅ Created user: ${sampleUsers[i].email}`);
      }
    }

    console.log('\n📝 Creating sample prompts...');
    
    // Create sample prompts
    for (let i = 0; i < samplePrompts.length; i++) {
      const prompt = samplePrompts[i];
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      
      const { data, error } = await supabase
        .from('prompts')
        .insert({
          ...prompt,
          user_id: randomUserId,
          raw_prompt: `Generate ${prompt.title.toLowerCase()}`,
          enriched_prompt: `As a ${prompt.role}, ${prompt.task}. Context: ${prompt.context}. Requirements: ${prompt.requirements}`,
          token_count: Math.floor(Math.random() * 500) + 100
        });
      
      if (error) {
        console.log(`⚠️ Could not create prompt ${prompt.title}:`, error.message);
      } else {
        console.log(`✅ Created prompt: ${prompt.title}`);
      }
    }

    console.log('\n📊 Creating sample usage tracking...');
    
    // Create sample usage tracking events
    for (let i = 0; i < 50; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const randomAction = sampleUsageEvents[Math.floor(Math.random() * sampleUsageEvents.length)];
      const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Last 30 days
      
      const { data, error } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: randomUserId,
          action_type: randomAction,
          tokens_used: Math.floor(Math.random() * 200),
          processing_time_ms: Math.floor(Math.random() * 5000) + 100,
          model_used: ['claude-3-5-sonnet', 'gpt-4', 'gpt-3.5-turbo'][Math.floor(Math.random() * 3)],
          success: Math.random() > 0.1, // 90% success rate
          created_at: randomDate.toISOString()
        });
      
      if (error && i === 0) {
        console.log(`⚠️ Could not create usage event:`, error.message);
        break;
      }
    }
    
    console.log(`✅ Created 50 usage tracking events`);

    console.log('\n🔗 Creating sample shared prompts...');
    
    // Create a few shared prompts
    const { data: promptsData } = await supabase
      .from('prompts')
      .select('id, user_id')
      .limit(3);
    
    if (promptsData) {
      for (const prompt of promptsData) {
        const { data, error } = await supabase
          .from('shared_prompts')
          .insert({
            prompt_id: prompt.id,
            created_by: prompt.user_id,
            is_public: Math.random() > 0.5,
            view_count: Math.floor(Math.random() * 50)
          });
        
        if (!error) {
          console.log(`✅ Created shared prompt for prompt ID: ${prompt.id}`);
        }
      }
    }

    console.log('\n🎉 Sample Data Creation Complete!');
    console.log('================================');
    
    // Run analysis to show the results
    console.log('\n📊 Running quick analysis...');
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
    
    const { count: shareCount } = await supabase
      .from('shared_prompts')
      .select('*', { count: 'exact', head: true });

    console.log(`👥 Users: ${userCount || 0}`);
    console.log(`📝 Prompts: ${promptCount || 0}`);
    console.log(`📊 Usage Events: ${usageCount || 0}`);
    console.log(`🔗 Shared Prompts: ${shareCount || 0}`);
    
    console.log('\n🚀 Ready for MCP Testing!');
    console.log('Now you can test these MCP commands in Cursor:');
    console.log('• "Show me all users and their subscription tiers"');
    console.log('• "What are the most popular prompt categories?"');
    console.log('• "Generate a user engagement report"');
    console.log('• "Show me the latest prompts created"');
    console.log('• "Which AI models are used most frequently?"');
    
  } catch (error) {
    console.log('⚠️ Could not run quick analysis:', error.message);
  }
}

// Run the data creation
createSampleData(); 