# 🚀 Complete Guide: Integrating Supabase with XMLPrompter via MCP

## Overview

This guide will walk you through setting up Model Context Protocol (MCP) to connect your XMLPrompter project with Supabase, allowing your AI assistant to directly interact with your database without manual intervention.

## What You'll Achieve

After completing this guide, your AI assistant will be able to:
- Query your Supabase database directly
- Create and modify tables
- Manage user data and prompts
- Run analytics queries
- Perform database operations on your behalf

## Prerequisites

- ✅ Supabase project (you already have this configured)
- ✅ Cursor IDE installed
- ✅ Node.js 18+ installed
- ✅ XMLPrompter project ready

## Step 1: Get Your Supabase Personal Access Token

1. **Go to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Log in to your account

2. **Navigate to Settings**
   - Click on your profile picture in the top right
   - Select "Account Settings"
   - Go to "Access Tokens" tab

3. **Create a Personal Access Token**
   - Click "Generate new token"
   - Name it: `XMLPrompter-MCP-Token`
   - Select appropriate scopes (recommended: read, write)
   - **IMPORTANT**: Copy and save this token securely - you won't see it again!

## Step 2: Get Your Project Reference

1. **Find Your Project Reference**
   - In your Supabase dashboard, go to your XMLPrompter project
   - Go to Settings → General
   - Copy the "Project ID" (this is your project-ref)
   - It should look like: `nxwflnxspsokscfhuaqr`

## Step 3: Set Up Environment Variables

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://nxwflnxspsokscfhuaqr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Njk5MzQsImV4cCI6MjA2NjM0NTkzNH0.jMWf2BEfI_4gAtMO9yzv3Nw5QWiIhyPanANP5px51gA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d2ZsbnhzcHNva3NjZmh1YXFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDc2OTkzNCwiZXhwIjoyMDY2MzQ1OTM0fQ.CbT3iYiaghBJ_lJPSAXFVMKyJtTVJoFL-61x4HHMxi0

# MCP Configuration
SUPABASE_ACCESS_TOKEN=your-personal-access-token-here
SUPABASE_PROJECT_REF=nxwflnxspsokscfhuaqr

# Other Configuration
NODE_ENV=development
```

**Replace the following:**
- `your-personal-access-token-here` with your actual Personal Access Token from Step 1
- Update the project URLs if your project ID is different

## Step 4: Configure MCP in Cursor

1. **Open Cursor Settings**
   - Open Cursor IDE
   - Go to Settings (Cmd/Ctrl + ,)
   - Navigate to "MCP" tab
   - Click "Add new global MCP Server"

2. **Add Supabase MCP Server Configuration**
   
   Paste the following configuration:

   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--read-only",
           "--project-ref=nxwflnxspsokscfhuaqr"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "your-personal-access-token-here"
         }
       }
     }
   }
   ```

   **Important**: Replace `your-personal-access-token-here` with your actual token.

3. **Save and Restart Cursor**
   - Save the configuration
   - Restart Cursor IDE
   - Check that the MCP server shows a green "Active" status

## Step 5: Set Up Your Database Schema

Since you already have a comprehensive database schema in your setup guide, let's implement it:

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard
   - Navigate to "SQL Editor"
   - Create a new query

2. **Run the Database Schema**
   
   Execute the following core schema (based on your existing setup):

   ```sql
   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

   -- Create profiles table
   CREATE TABLE IF NOT EXISTS profiles (
       id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
       email TEXT UNIQUE,
       full_name TEXT,
       avatar_url TEXT,
       subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
       subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
       subscription_expires_at TIMESTAMP WITH TIME ZONE,
       subscription_created_at TIMESTAMP WITH TIME ZONE,
       billing_customer_id TEXT UNIQUE,
       api_key_hash TEXT,
       preferences JSONB DEFAULT '{}',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create prompts table with enhanced schema
   CREATE TABLE IF NOT EXISTS prompts (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       
       -- Prompt metadata
       title TEXT NOT NULL,
       description TEXT,
       category TEXT DEFAULT 'general',
       tags TEXT[] DEFAULT '{}',
       
       -- Form data fields
       role TEXT,
       task TEXT NOT NULL,
       context TEXT,
       requirements TEXT,
       style TEXT,
       output TEXT,
       
       -- Generated prompts
       raw_prompt TEXT,
       enriched_prompt TEXT,
       
       -- Model and metadata
       selected_model TEXT DEFAULT 'claude-3-5-sonnet',
       prompt_metadata JSONB DEFAULT '{}',
       enrichment_result JSONB DEFAULT '{}',
       
       -- Usage and engagement
       token_count INTEGER DEFAULT 0,
       is_favorite BOOLEAN DEFAULT FALSE,
       is_public BOOLEAN DEFAULT FALSE,
       view_count INTEGER DEFAULT 0,
       copy_count INTEGER DEFAULT 0,
       
       -- Version control
       version INTEGER DEFAULT 1,
       parent_id UUID REFERENCES prompts(id),
       
       -- Timestamps
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create usage tracking table
   CREATE TABLE IF NOT EXISTS usage_tracking (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
       
       -- Action details
       action_type TEXT NOT NULL CHECK (action_type IN ('prompt_generation', 'enhancement', 'save', 'share', 'api_call')),
       resource_type TEXT,
       resource_id UUID,
       
       -- Usage metrics
       tokens_used INTEGER DEFAULT 0,
       processing_time_ms INTEGER,
       model_used TEXT,
       success BOOLEAN DEFAULT TRUE,
       error_message TEXT,
       
       -- Request context
       ip_address INET,
       user_agent TEXT,
       referer TEXT,
       session_id TEXT,
       
       -- Timestamps
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Enable Row Level Security**
   
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

   -- Create basic policies
   CREATE POLICY "Users can view their own profile" ON profiles
       FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update their own profile" ON profiles
       FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Users can insert their own profile" ON profiles
       FOR INSERT WITH CHECK (auth.uid() = id);

   CREATE POLICY "Users can view their own prompts" ON prompts
       FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own prompts" ON prompts
       FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own prompts" ON prompts
       FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own prompts" ON prompts
       FOR DELETE USING (auth.uid() = user_id);
   ```

## Step 6: Test the MCP Connection

1. **Open Cursor Chat**
   - Open Cursor IDE
   - Open the chat panel (Cmd/Ctrl + L)
   - Make sure you're in "Agent" mode

2. **Test Basic Connection**
   
   Try these commands:
   
   ```
   Can you show me information about my Supabase project?
   ```
   
   ```
   What tables exist in my database?
   ```
   
   ```
   Can you describe the structure of the prompts table?
   ```

3. **Test Data Operations**
   
   ```
   How many users are currently in the profiles table?
   ```
   
   ```
   Show me the latest 5 prompts created
   ```

## Step 7: Create MCP Helper Functions

Create a file `src/lib/mcpHelpers.js` to assist with MCP operations:

```javascript
// Helper functions for MCP operations
export const mcpHelpers = {
  // Generate MCP-compatible queries
  generateQuery: (table, filters = {}) => {
    let query = `SELECT * FROM ${table}`;
    
    if (Object.keys(filters).length > 0) {
      const conditions = Object.entries(filters)
        .map(([key, value]) => `${key} = '${value}'`)
        .join(' AND ');
      query += ` WHERE ${conditions}`;
    }
    
    return query;
  },

  // Format data for MCP responses
  formatResponse: (data, metadata = {}) => {
    return {
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'supabase-mcp',
        ...metadata
      }
    };
  },

  // Common database operations
  operations: {
    getUserPrompts: (userId) => `
      SELECT id, title, description, category, created_at, updated_at
      FROM prompts 
      WHERE user_id = '${userId}'
      ORDER BY created_at DESC
      LIMIT 10
    `,
    
    getPromptAnalytics: () => `
      SELECT 
        category,
        COUNT(*) as count,
        AVG(view_count) as avg_views
      FROM prompts 
      GROUP BY category
      ORDER BY count DESC
    `,
    
    getRecentActivity: () => `
      SELECT 
        action_type,
        COUNT(*) as count,
        DATE_TRUNC('day', created_at) as date
      FROM usage_tracking 
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY action_type, DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `
  }
};
```

## Step 8: Advanced MCP Configuration (Optional)

For more advanced usage, you can configure additional MCP features:

1. **Enable Write Operations** (Remove `--read-only` from configuration)
   
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--project-ref=nxwflnxspsokscfhuaqr"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "your-personal-access-token-here"
         }
       }
     }
   }
   ```

2. **Add Multiple Project Support**
   
   ```json
   {
     "mcpServers": {
       "supabase-prod": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--read-only",
           "--project-ref=your-prod-project-ref"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "your-prod-access-token"
         }
       },
       "supabase-dev": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--project-ref=your-dev-project-ref"
         ],
         "env": {
           "SUPABASE_ACCESS_TOKEN": "your-dev-access-token"
         }
       }
     }
   }
   ```

## Step 9: Common MCP Commands You Can Use

Once set up, you can use these types of commands with your AI assistant:

### Database Queries
```
Show me all users who signed up in the last week
```

```
What are the most popular prompt categories?
```

```
Find prompts that contain the word "marketing" in their title
```

### Data Analysis
```
Generate a report of user engagement metrics
```

```
Show me the distribution of subscription tiers
```

```
What's the average number of prompts per user?
```

### Database Management
```
Create a new table for storing user feedback
```

```
Add an index to improve query performance on the prompts table
```

```
Update the database schema to add a new column
```

## Step 10: Troubleshooting

### Common Issues and Solutions

1. **MCP Server Not Starting**
   - Check your Personal Access Token is correct
   - Verify your project reference ID
   - Ensure you have internet connection for npx to download the server

2. **Permission Errors**
   - Make sure your Personal Access Token has the right permissions
   - Check that Row Level Security policies allow your operations

3. **Connection Timeouts**
   - Verify your Supabase project is active
   - Check your internet connection
   - Try restarting the MCP server in Cursor settings

4. **Query Errors**
   - Ensure your database schema is properly set up
   - Check that table names and column names are correct
   - Verify RLS policies aren't blocking your queries

### Debug Commands

Test these in Cursor chat to verify everything is working:

```
Can you list all available MCP tools?
```

```
Show me the current MCP server status
```

```
What databases can you access through MCP?
```

## Step 11: Security Best Practices

1. **Use Read-Only Mode Initially**
   - Start with `--read-only` flag
   - Only enable write operations when needed

2. **Limit Token Permissions**
   - Create tokens with minimal required permissions
   - Use separate tokens for different environments

3. **Monitor Usage**
   - Regularly check your Supabase dashboard for unusual activity
   - Set up alerts for high usage

4. **Environment Separation**
   - Use different tokens for development and production
   - Never commit tokens to version control

## Step 12: Next Steps

Once you have MCP working, you can:

1. **Automate Data Operations**
   - Set up automated reports
   - Create data backup routines
   - Implement data validation checks

2. **Enhance Your Application**
   - Use MCP to improve prompt generation
   - Implement better user analytics
   - Create automated content moderation

3. **Build Advanced Features**
   - Real-time data synchronization
   - Automated A/B testing
   - Intelligent user segmentation

## Conclusion

You now have a fully functional MCP integration between your XMLPrompter project and Supabase! Your AI assistant can now:

- ✅ Query your database directly
- ✅ Analyze user data and usage patterns
- ✅ Help with database management tasks
- ✅ Generate insights and reports
- ✅ Assist with data-driven decisions

The AI assistant will handle all the technical details of database connections, query formatting, and data analysis, allowing you to focus on building great features for your users.

## Support and Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)

Happy building! 🚀 