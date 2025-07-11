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
    `,

    getPopularPrompts: () => `
      SELECT 
        id,
        title,
        description,
        category,
        view_count,
        copy_count,
        created_at
      FROM prompts 
      WHERE is_public = true
      ORDER BY view_count DESC
      LIMIT 20
    `,

    getUserStats: (userId) => `
      SELECT 
        COUNT(*) as total_prompts,
        COUNT(CASE WHEN is_favorite = true THEN 1 END) as favorite_prompts,
        COUNT(CASE WHEN is_public = true THEN 1 END) as public_prompts,
        SUM(view_count) as total_views,
        AVG(view_count) as avg_views_per_prompt
      FROM prompts 
      WHERE user_id = '${userId}'
    `,

    getSubscriptionStats: () => `
      SELECT 
        subscription_tier,
        COUNT(*) as user_count,
        COUNT(CASE WHEN subscription_status = 'active' THEN 1 END) as active_users
      FROM profiles 
      GROUP BY subscription_tier
      ORDER BY user_count DESC
    `,

    getModelUsage: () => `
      SELECT 
        selected_model,
        COUNT(*) as usage_count,
        AVG(token_count) as avg_tokens
      FROM prompts 
      WHERE selected_model IS NOT NULL
      GROUP BY selected_model
      ORDER BY usage_count DESC
    `,

    getActivityTrends: (days = 30) => `
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as prompt_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM prompts 
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `
  },

  // Data validation helpers
  validation: {
    isValidUUID: (uuid) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return uuidRegex.test(uuid);
    },

    sanitizeInput: (input) => {
      if (typeof input !== 'string') return input;
      return input.replace(/'/g, "''"); // Basic SQL injection prevention
    },

    validatePromptData: (data) => {
      const required = ['title', 'task'];
      const missing = required.filter(field => !data[field]);
      
      if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
      }
      
      return true;
    }
  },

  // MCP-specific utilities
  mcp: {
    // Format prompts for MCP tool calls
    formatPromptForMCP: (prompt) => ({
      id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      category: prompt.category,
      formData: {
        role: prompt.role,
        task: prompt.task,
        context: prompt.context,
        requirements: prompt.requirements,
        style: prompt.style,
        output: prompt.output
      },
      generatedPrompts: {
        raw: prompt.raw_prompt,
        enriched: prompt.enriched_prompt
      },
      metadata: {
        model: prompt.selected_model,
        tokens: prompt.token_count,
        views: prompt.view_count,
        isFavorite: prompt.is_favorite,
        isPublic: prompt.is_public,
        createdAt: prompt.created_at,
        updatedAt: prompt.updated_at
      }
    }),

    // Generate MCP-compatible error responses
    formatError: (error, context = {}) => ({
      error: {
        message: error.message || 'An error occurred',
        type: error.name || 'Error',
        code: error.code || 'UNKNOWN_ERROR',
        context,
        timestamp: new Date().toISOString()
      }
    }),

    // Create MCP tool descriptions
    getToolDescriptions: () => ({
      getUserPrompts: {
        name: 'getUserPrompts',
        description: 'Get all prompts for a specific user',
        parameters: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'UUID of the user'
            }
          },
          required: ['userId']
        }
      },
      getPromptAnalytics: {
        name: 'getPromptAnalytics',
        description: 'Get analytics about prompt categories and usage',
        parameters: {
          type: 'object',
          properties: {}
        }
      },
      getRecentActivity: {
        name: 'getRecentActivity',
        description: 'Get recent activity from the last 7 days',
        parameters: {
          type: 'object',
          properties: {}
        }
      },
      createPrompt: {
        name: 'createPrompt',
        description: 'Create a new prompt',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Prompt title' },
            task: { type: 'string', description: 'Main task description' },
            role: { type: 'string', description: 'Role context' },
            context: { type: 'string', description: 'Additional context' },
            requirements: { type: 'string', description: 'Specific requirements' },
            style: { type: 'string', description: 'Style preferences' },
            output: { type: 'string', description: 'Output format' },
            category: { type: 'string', description: 'Prompt category' },
            userId: { type: 'string', description: 'User ID' }
          },
          required: ['title', 'task', 'userId']
        }
      }
    })
  }
};

// Export individual utilities for easier importing
export const { generateQuery, formatResponse, operations, validation, mcp } = mcpHelpers;

// Default export
export default mcpHelpers; 