#!/usr/bin/env node

/**
 * Comprehensive Database Analysis Script
 * Analyzes the entire XMLPrompter database structure and provides insights
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 COMPREHENSIVE DATABASE ANALYSIS');
console.log('==================================\n');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Utility function to format numbers
const formatNumber = (num) => new Intl.NumberFormat().format(num || 0);

// Utility function to format dates
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

async function analyzeDatabase() {
  try {
    console.log('📊 DATABASE OVERVIEW');
    console.log('===================');

    // Check known tables
    const knownTables = ['profiles', 'prompts', 'usage_tracking', 'shared_prompts', 'api_keys', 'rate_limits'];
    const existingTables = [];

    for (const table of knownTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
          existingTables.push(table);
        }
      } catch (err) {
        // Table doesn't exist or no access
      }
    }

    console.log(`📋 Tables Found: ${existingTables.length}`);
    console.log(`   ${existingTables.join(', ')}\n`);

    // Analyze each table
    for (const tableName of existingTables) {
      await analyzeTable(tableName);
    }

    // Overall insights
    await generateOverallInsights(existingTables);

  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

async function analyzeTable(tableName) {
  console.log(`🔍 ANALYZING TABLE: ${tableName.toUpperCase()}`);
  console.log('='.repeat(50));

  try {
    // Get row count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total Records: ${formatNumber(count)}`);

    // Get sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);

    if (sampleData && sampleData.length > 0) {
      console.log(`📋 Columns: ${Object.keys(sampleData[0]).length}`);
      console.log(`   ${Object.keys(sampleData[0]).join(', ')}`);

      // Table-specific analysis
      await analyzeTableSpecific(tableName, count);
    }

    console.log(''); // Empty line for spacing

  } catch (error) {
    console.log(`❌ Error analyzing ${tableName}:`, error.message);
    console.log('');
  }
}

async function analyzeTableSpecific(tableName, totalCount) {
  try {
    switch (tableName) {
      case 'profiles':
        await analyzeProfiles();
        break;
      case 'prompts':
        await analyzePrompts();
        break;
      case 'usage_tracking':
        await analyzeUsageTracking();
        break;
      case 'shared_prompts':
        await analyzeSharedPrompts();
        break;
      default:
        console.log('   (No specific analysis available)');
    }
  } catch (error) {
    console.log(`   ⚠️ Specific analysis failed: ${error.message}`);
  }
}

async function analyzeProfiles() {
  // Subscription tier distribution
  const { data: tierData } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .not('subscription_tier', 'is', null);

  if (tierData) {
    const tierCounts = tierData.reduce((acc, row) => {
      acc[row.subscription_tier] = (acc[row.subscription_tier] || 0) + 1;
      return acc;
    }, {});

    console.log('💰 Subscription Tiers:');
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${formatNumber(count)} users`);
    });
  }

  // Recent signups
  const { data: recentSignups } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  console.log(`📈 New Users (Last 30 days): ${formatNumber(recentSignups?.length || 0)}`);

  // Active users (users with recent prompts)
  const { data: activeUsers } = await supabase
    .from('prompts')
    .select('user_id')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .not('user_id', 'is', null);

  const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || []).size;
  console.log(`🔥 Active Users (Last 7 days): ${formatNumber(uniqueActiveUsers)}`);
}

async function analyzePrompts() {
  // Category distribution
  const { data: categoryData } = await supabase
    .from('prompts')
    .select('category')
    .not('category', 'is', null);

  if (categoryData) {
    const categoryCounts = categoryData.reduce((acc, row) => {
      acc[row.category] = (acc[row.category] || 0) + 1;
      return acc;
    }, {});

    console.log('📁 Top Categories:');
    Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${formatNumber(count)} prompts`);
      });
  }

  // Model usage
  const { data: modelData } = await supabase
    .from('prompts')
    .select('selected_model')
    .not('selected_model', 'is', null);

  if (modelData) {
    const modelCounts = modelData.reduce((acc, row) => {
      acc[row.selected_model] = (acc[row.selected_model] || 0) + 1;
      return acc;
    }, {});

    console.log('🤖 Popular AI Models:');
    Object.entries(modelCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([model, count]) => {
        console.log(`   ${model}: ${formatNumber(count)} uses`);
      });
  }

  // Public vs private prompts
  const { data: publicData } = await supabase
    .from('prompts')
    .select('is_public');

  if (publicData) {
    const publicCount = publicData.filter(p => p.is_public).length;
    const privateCount = publicData.length - publicCount;
    console.log(`🌐 Public Prompts: ${formatNumber(publicCount)}`);
    console.log(`🔒 Private Prompts: ${formatNumber(privateCount)}`);
  }

  // Average engagement
  const { data: engagementData } = await supabase
    .from('prompts')
    .select('view_count, copy_count')
    .not('view_count', 'is', null);

  if (engagementData && engagementData.length > 0) {
    const avgViews = engagementData.reduce((sum, p) => sum + (p.view_count || 0), 0) / engagementData.length;
    const avgCopies = engagementData.reduce((sum, p) => sum + (p.copy_count || 0), 0) / engagementData.length;
    console.log(`👀 Average Views per Prompt: ${avgViews.toFixed(1)}`);
    console.log(`📋 Average Copies per Prompt: ${avgCopies.toFixed(1)}`);
  }

  // Recent activity
  const { data: recentPrompts } = await supabase
    .from('prompts')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  console.log(`⚡ Prompts Created (Last 24h): ${formatNumber(recentPrompts?.length || 0)}`);
}

async function analyzeUsageTracking() {
  // Action type distribution
  const { data: actionData } = await supabase
    .from('usage_tracking')
    .select('action_type')
    .not('action_type', 'is', null);

  if (actionData) {
    const actionCounts = actionData.reduce((acc, row) => {
      acc[row.action_type] = (acc[row.action_type] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Action Types:');
    Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([action, count]) => {
        console.log(`   ${action}: ${formatNumber(count)} events`);
      });
  }

  // Success rate
  const { data: successData } = await supabase
    .from('usage_tracking')
    .select('success');

  if (successData) {
    const successCount = successData.filter(s => s.success).length;
    const successRate = (successCount / successData.length * 100).toFixed(1);
    console.log(`✅ Success Rate: ${successRate}%`);
  }

  // Recent activity
  const { data: recentActivity } = await supabase
    .from('usage_tracking')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  console.log(`📈 Events (Last 24h): ${formatNumber(recentActivity?.length || 0)}`);
}

async function analyzeSharedPrompts() {
  // Public vs password protected
  const { data: shareData } = await supabase
    .from('shared_prompts')
    .select('is_public, password_hash, view_count');

  if (shareData) {
    const publicShares = shareData.filter(s => s.is_public).length;
    const protectedShares = shareData.filter(s => s.password_hash).length;
    const totalViews = shareData.reduce((sum, s) => sum + (s.view_count || 0), 0);

    console.log(`🌐 Public Shares: ${formatNumber(publicShares)}`);
    console.log(`🔐 Protected Shares: ${formatNumber(protectedShares)}`);
    console.log(`👀 Total Share Views: ${formatNumber(totalViews)}`);
  }
}

async function generateOverallInsights(tables) {
  console.log('🎯 OVERALL INSIGHTS');
  console.log('==================');

  try {
    // Calculate key metrics
    const insights = [];

    if (tables.includes('profiles') && tables.includes('prompts')) {
      // User engagement
      const { data: userPromptCounts } = await supabase
        .from('prompts')
        .select('user_id')
        .not('user_id', 'is', null);

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (userPromptCounts && totalUsers) {
        const activeUsers = new Set(userPromptCounts.map(p => p.user_id)).size;
        const engagementRate = (activeUsers / totalUsers * 100).toFixed(1);
        insights.push(`📊 User Engagement Rate: ${engagementRate}% (${formatNumber(activeUsers)}/${formatNumber(totalUsers)} users have created prompts)`);

        const avgPromptsPerUser = (userPromptCounts.length / activeUsers).toFixed(1);
        insights.push(`📝 Average Prompts per Active User: ${avgPromptsPerUser}`);
      }
    }

    if (tables.includes('prompts')) {
      // Growth trends
      const { data: weeklyData } = await supabase
        .from('prompts')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (weeklyData && weeklyData.length > 0) {
        const thisWeek = weeklyData.filter(p => 
          new Date(p.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;
        const lastWeek = weeklyData.length - thisWeek;
        
        if (lastWeek > 0) {
          const growthRate = ((thisWeek - lastWeek) / lastWeek * 100).toFixed(1);
          insights.push(`📈 Week-over-Week Growth: ${growthRate}% (${formatNumber(thisWeek)} vs ${formatNumber(lastWeek)} prompts)`);
        }
      }
    }

    // Display insights
    if (insights.length > 0) {
      insights.forEach(insight => console.log(insight));
    } else {
      console.log('📊 Insufficient data for detailed insights');
    }

    console.log('\n🚀 RECOMMENDATIONS');
    console.log('==================');
    
    // Generate recommendations based on data
    const recommendations = [
      '💡 Set up regular analytics dashboards using MCP queries',
      '📊 Monitor user engagement metrics weekly',
      '🔍 Analyze popular prompt categories for content strategy',
      '🎯 Track conversion from free to paid subscriptions',
      '📈 Implement A/B testing for prompt generation features'
    ];

    recommendations.forEach(rec => console.log(rec));

  } catch (error) {
    console.log('⚠️ Could not generate insights:', error.message);
  }
}

// Run the analysis
analyzeDatabase().then(() => {
  console.log('\n✅ Database Analysis Complete!');
  console.log('=============================');
  console.log('💡 You can now use these insights with your MCP-enabled AI assistant');
  console.log('📊 Try asking: "Generate a comprehensive report of my database analytics"');
  console.log('🔍 Or: "What are the key trends in my user data?"');
}); 