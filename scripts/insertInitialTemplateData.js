#!/usr/bin/env node

/**
 * Insert Initial Template Data Script
 * Inserts categories, tags, and templates into the database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🚀 INSERTING INITIAL TEMPLATE DATA');
console.log('==================================\n');

async function insertInitialData() {
  try {
    console.log('📋 Step 1: Inserting template categories...');
    
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
    
    console.log('\n📋 Step 2: Inserting template tags...');
    
    const tags = [
      // Business & Industry
      { name: 'SMEs', description: 'Small and Medium Enterprises', category: 'business' },
      { name: 'startups', description: 'Startup companies and entrepreneurs', category: 'business' },
      { name: 'enterprise', description: 'Large enterprise organizations', category: 'business' },
      { name: 'B2B', description: 'Business-to-Business', category: 'business' },
      { name: 'B2C', description: 'Business-to-Consumer', category: 'business' },
      { name: 'e-commerce', description: 'E-commerce and online retail', category: 'business' },
      { name: 'SaaS', description: 'Software as a Service', category: 'business' },
      { name: 'fintech', description: 'Financial technology', category: 'business' },
      
      // Marketing & Sales
      { name: 'email-marketing', description: 'Email marketing campaigns', category: 'marketing' },
      { name: 'social-media', description: 'Social media content', category: 'marketing' },
      { name: 'content-marketing', description: 'Content marketing strategies', category: 'marketing' },
      { name: 'SEO', description: 'Search Engine Optimization', category: 'marketing' },
      { name: 'PPC', description: 'Pay-Per-Click advertising', category: 'marketing' },
      { name: 'influencer-marketing', description: 'Influencer marketing', category: 'marketing' },
      { name: 'branding', description: 'Brand development and management', category: 'marketing' },
      { name: 'lead-generation', description: 'Lead generation strategies', category: 'marketing' },
      
      // Development & Tech
      { name: 'javascript', description: 'JavaScript development', category: 'development' },
      { name: 'python', description: 'Python development', category: 'development' },
      { name: 'react', description: 'React framework', category: 'development' },
      { name: 'nodejs', description: 'Node.js development', category: 'development' },
      { name: 'api', description: 'API development and documentation', category: 'development' },
      { name: 'documentation', description: 'Technical documentation', category: 'development' },
      { name: 'code-review', description: 'Code review processes', category: 'development' },
      { name: 'testing', description: 'Software testing', category: 'development' },
      { name: 'deployment', description: 'Deployment and DevOps', category: 'development' },
      { name: 'devops', description: 'DevOps practices', category: 'development' },
      
      // Content Types
      { name: 'blog-posts', description: 'Blog post creation', category: 'content' },
      { name: 'newsletters', description: 'Newsletter content', category: 'content' },
      { name: 'whitepapers', description: 'Whitepaper creation', category: 'content' },
      { name: 'case-studies', description: 'Case study development', category: 'content' },
      { name: 'tutorials', description: 'Tutorial creation', category: 'content' },
      { name: 'guides', description: 'How-to guides', category: 'content' },
      { name: 'reports', description: 'Report writing', category: 'content' },
      { name: 'presentations', description: 'Presentation creation', category: 'content' },
      
      // Target Audiences
      { name: 'developers', description: 'Developer audience', category: 'audience' },
      { name: 'marketers', description: 'Marketing professionals', category: 'audience' },
      { name: 'managers', description: 'Management and executives', category: 'audience' },
      { name: 'executives', description: 'C-level executives', category: 'audience' },
      { name: 'customers', description: 'Customer-facing content', category: 'audience' },
      { name: 'partners', description: 'Partner communications', category: 'audience' },
      { name: 'investors', description: 'Investor relations', category: 'audience' },
      { name: 'employees', description: 'Internal communications', category: 'audience' },
      
      // Use Cases
      { name: 'onboarding', description: 'User onboarding processes', category: 'use-case' },
      { name: 'product-launch', description: 'Product launch campaigns', category: 'use-case' },
      { name: 'customer-support', description: 'Customer support responses', category: 'use-case' },
      { name: 'sales-pitch', description: 'Sales presentations', category: 'use-case' },
      { name: 'project-management', description: 'Project management', category: 'use-case' },
      { name: 'strategy', description: 'Strategic planning', category: 'use-case' },
      { name: 'analysis', description: 'Data analysis and insights', category: 'use-case' },
      
      // Formats
      { name: 'email', description: 'Email format', category: 'format' },
      { name: 'social-post', description: 'Social media post', category: 'format' },
      { name: 'documentation', description: 'Documentation format', category: 'format' },
      { name: 'presentation', description: 'Presentation format', category: 'format' },
      { name: 'report', description: 'Report format', category: 'format' },
      { name: 'proposal', description: 'Proposal format', category: 'format' },
      { name: 'plan', description: 'Planning document', category: 'format' }
    ];
    
    for (const tag of tags) {
      const { error: insertError } = await supabase
        .from('template_tags')
        .insert(tag);
      
      if (insertError && !insertError.message.includes('duplicate')) {
        console.log(`❌ Error inserting tag "${tag.name}": ${insertError.message}`);
      } else {
        console.log(`✅ Tag "${tag.name}" inserted`);
      }
    }
    
    console.log('\n📋 Step 3: Getting category and tag IDs for template creation...');
    
    // Get category IDs
    const { data: categoryData, error: categoryError } = await supabase
      .from('template_categories')
      .select('id, name');
    
    if (categoryError) {
      console.log(`❌ Error fetching categories: ${categoryError.message}`);
      return;
    }
    
    const categoryMap = new Map(categoryData.map(cat => [cat.name, cat.id]));
    
    // Get tag IDs
    const { data: tagData, error: tagError } = await supabase
      .from('template_tags')
      .select('id, name');
    
    if (tagError) {
      console.log(`❌ Error fetching tags: ${tagError.message}`);
      return;
    }
    
    const tagMap = new Map(tagData.map(tag => [tag.name, tag.id]));
    
    console.log(`✅ Found ${categoryMap.size} categories and ${tagMap.size} tags`);
    
    console.log('\n📋 Step 4: Inserting sample templates...');
    
    const sampleTemplates = [
      {
        title: 'Business Plan Generator',
        description: 'Create comprehensive business plans and strategies for startups and SMEs',
        category: 'Business & Strategy',
        tags: ['business-plan', 'strategy', 'startups', 'SMEs', 'planning', 'investors', 'executives'],
        tier: 'pro',
        author_name: 'Business Team',
        template_data: {
          role: 'Business Consultant',
          task: 'Develop a comprehensive business plan for {business_type} in {industry}',
          context: 'Business Type: {business_type}\nIndustry: {industry}\nFunding Required: {funding}\nTimeline: {timeline}',
          requirements: 'Include executive summary, market analysis, competitive analysis, financial projections, marketing strategy, and risk assessment',
          style: 'Professional and comprehensive',
          output: 'Structured business plan document'
        },
        preview_text: 'Develop a business plan for {industry} startup with {funding} and {timeline}...',
        usage: 223,
        rating: 4.4
      },
      {
        title: 'Marketing Email Generator',
        description: 'Create compelling marketing emails for product launches and campaigns with proven conversion strategies',
        category: 'Marketing & Sales',
        tags: ['email-marketing', 'product-launch', 'conversion', 'B2B', 'B2C', 'SaaS', 'e-commerce'],
        tier: 'free',
        author_name: 'PromptCraft Team',
        template_data: {
          role: 'Marketing Manager',
          task: 'Create a compelling marketing email for {product} that targets {audience} and drives {goal}',
          context: 'Product: {product}\nAudience: {audience}\nGoal: {goal}\nBrand Voice: {tone}',
          requirements: 'Include compelling subject line, clear value proposition, strong call-to-action, and mobile-optimized design',
          style: 'Professional and engaging',
          output: 'HTML email template with subject line'
        },
        preview_text: 'Generate a marketing email for {product} targeting {audience} with {goal}...',
        usage: 1247,
        rating: 4.8
      },
      {
        title: 'Code Documentation Assistant',
        description: 'Generate comprehensive documentation for code functions and APIs with best practices',
        category: 'Development',
        tags: ['documentation', 'api', 'javascript', 'python', 'react', 'nodejs', 'developers'],
        tier: 'pro',
        author_name: 'Dev Team',
        template_data: {
          role: 'Software Developer',
          task: 'Create comprehensive documentation for {function_name} in {language}',
          context: 'Function: {function_name}\nLanguage: {language}\nFramework: {framework}\nPurpose: {purpose}',
          requirements: 'Include function signature, parameters, return values, examples, error handling, and usage notes',
          style: 'Technical and precise',
          output: 'JSDoc/TSDoc format with examples'
        },
        preview_text: 'Document this {language} function with parameters, return values, and examples...',
        usage: 892,
        rating: 4.9
      }
    ];
    
    for (const template of sampleTemplates) {
      const categoryId = categoryMap.get(template.category);
      if (!categoryId) {
        console.log(`❌ Category "${template.category}" not found for template "${template.title}"`);
        continue;
      }
      
      // Create template
      const { data: newTemplate, error: templateError } = await supabase
        .from('templates')
        .insert({
          title: template.title,
          description: template.description,
          category_id: categoryId,
          template_data: template.template_data,
          preview_text: template.preview_text,
          tier: template.tier,
          author_name: template.author_name,
          status: 'active',
          is_system_template: true,
          usage_count: template.usage,
          rating_average: template.rating,
          rating_count: Math.floor(template.usage * 0.1),
          view_count: template.usage * 2,
          copy_count: template.usage * 0.3,
          published_at: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (templateError) {
        console.log(`❌ Error creating template "${template.title}": ${templateError.message}`);
        continue;
      }
      
      console.log(`✅ Created template "${template.title}" with ID ${newTemplate.id}`);
      
      // Add tags to template
      const tagInserts = template.tags
        .map(tagName => {
          const tagId = tagMap.get(tagName);
          return tagId ? { template_id: newTemplate.id, tag_id: tagId } : null;
        })
        .filter(Boolean);
      
      if (tagInserts.length > 0) {
        const { error: tagError } = await supabase
          .from('template_tags_junction')
          .insert(tagInserts);
        
        if (tagError) {
          console.log(`⚠️ Failed to add tags to template "${template.title}": ${tagError.message}`);
        } else {
          console.log(`✅ Added ${tagInserts.length} tags to template "${template.title}"`);
        }
      }
    }
    
    console.log('\n🎉 Initial Template Data Insertion Complete!');
    console.log('============================================');
    console.log('\n📝 Summary:');
    console.log(`- Categories inserted: ${categories.length}`);
    console.log(`- Tags inserted: ${tags.length}`);
    console.log(`- Templates inserted: ${sampleTemplates.length}`);
    
    console.log('\n✅ Users can now:');
    console.log('1. Search for "SME" and find the Business Plan Generator');
    console.log('2. Filter by tags like "SMEs", "startups", "business"');
    console.log('3. Browse templates by category (Business & Strategy, Marketing & Sales, Development)');
    console.log('4. Use templates in the main prompt generator');
    
  } catch (error) {
    console.error('\n❌ Data insertion failed:', error);
    process.exit(1);
  }
}

// Run the data insertion
insertInitialData(); 