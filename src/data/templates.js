// Template Library Data
// Comprehensive template collection with proper tagging and categorization

export const templateCategories = [
  {
    id: 'all',
    name: 'All Templates',
    icon: 'Grid',
    description: 'Browse all available templates',
    color: 'bg-gray-500'
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    icon: 'TrendingUp',
    description: 'Email campaigns, social media, advertising',
    color: 'bg-red-500'
  },
  {
    id: 'development',
    name: 'Development',
    icon: 'Zap',
    description: 'Code documentation, API specs, technical writing',
    color: 'bg-blue-500'
  },
  {
    id: 'content',
    name: 'Content Creation',
    icon: 'BookOpen',
    description: 'Blog posts, articles, newsletters, copywriting',
    color: 'bg-green-500'
  },
  {
    id: 'analytics',
    name: 'Analytics & Research',
    icon: 'BarChart3',
    description: 'Data analysis, market research, insights',
    color: 'bg-purple-500'
  },
  {
    id: 'support',
    name: 'Customer Support',
    icon: 'Users',
    description: 'Customer service, help documentation',
    color: 'bg-orange-500'
  },
  {
    id: 'business',
    name: 'Business & Strategy',
    icon: 'Crown',
    description: 'Business plans, strategy, planning',
    color: 'bg-indigo-500'
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    description: 'Lesson plans, training materials, academic',
    color: 'bg-teal-500'
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: 'Palette',
    description: 'Creative writing, storytelling, design',
    color: 'bg-pink-500'
  }
]

export const templateTags = [
  // Business & Industry
  'SMEs', 'startups', 'enterprise', 'B2B', 'B2C', 'e-commerce', 'SaaS', 'fintech', 'healthcare', 'education',
  
  // Marketing & Sales
  'email-marketing', 'social-media', 'content-marketing', 'SEO', 'PPC', 'influencer-marketing', 'branding', 'lead-generation',
  
  // Development & Tech
  'javascript', 'python', 'react', 'nodejs', 'api', 'documentation', 'code-review', 'testing', 'deployment', 'devops',
  
  // Content Types
  'blog-posts', 'newsletters', 'whitepapers', 'case-studies', 'tutorials', 'guides', 'reports', 'presentations',
  
  // Target Audiences
  'developers', 'marketers', 'managers', 'executives', 'customers', 'partners', 'investors', 'employees',
  
  // Use Cases
  'onboarding', 'product-launch', 'customer-support', 'sales-pitch', 'project-management', 'strategy', 'analysis',
  
  // Formats
  'email', 'social-post', 'documentation', 'presentation', 'report', 'proposal', 'plan'
]

export const templates = [
  {
    id: 'marketing-email-generator',
    title: 'Marketing Email Generator',
    description: 'Create compelling marketing emails for product launches and campaigns with proven conversion strategies',
    category: 'marketing',
    tags: ['email-marketing', 'product-launch', 'conversion', 'B2B', 'B2C', 'SaaS', 'e-commerce'],
    usage: 1247,
    rating: 4.8,
    tier: 'free',
    author: 'PromptCraft Team',
    lastUpdated: '2024-01-15',
    preview: 'Generate a marketing email for {product} targeting {audience} with {goal}...',
    template: {
      role: 'Marketing Manager',
      task: 'Create a compelling marketing email for {product} that targets {audience} and drives {goal}',
      context: 'Product: {product}\nAudience: {audience}\nGoal: {goal}\nBrand Voice: {tone}',
      requirements: 'Include compelling subject line, clear value proposition, strong call-to-action, and mobile-optimized design',
      style: 'Professional and engaging',
      output: 'HTML email template with subject line'
    }
  },
  {
    id: 'code-documentation-assistant',
    title: 'Code Documentation Assistant',
    description: 'Generate comprehensive documentation for code functions and APIs with best practices',
    category: 'development',
    tags: ['documentation', 'api', 'javascript', 'python', 'react', 'nodejs', 'developers'],
    usage: 892,
    rating: 4.9,
    tier: 'pro',
    author: 'Dev Team',
    lastUpdated: '2024-01-10',
    preview: 'Document this {language} function with parameters, return values, and examples...',
    template: {
      role: 'Software Developer',
      task: 'Create comprehensive documentation for {function_name} in {language}',
      context: 'Function: {function_name}\nLanguage: {language}\nFramework: {framework}\nPurpose: {purpose}',
      requirements: 'Include function signature, parameters, return values, examples, error handling, and usage notes',
      style: 'Technical and precise',
      output: 'JSDoc/TSDoc format with examples'
    }
  },
  {
    id: 'content-strategy-planner',
    title: 'Content Strategy Planner',
    description: 'Plan content strategy for social media campaigns and content marketing with data-driven insights',
    category: 'content',
    tags: ['content-marketing', 'social-media', 'strategy', 'planning', 'marketers', 'B2B', 'B2C'],
    usage: 567,
    rating: 4.7,
    tier: 'free',
    author: 'Content Team',
    lastUpdated: '2024-01-12',
    preview: 'Create a {duration} content calendar for {platform} focusing on {theme}...',
    template: {
      role: 'Content Strategist',
      task: 'Develop a {duration} content strategy for {platform} focusing on {theme}',
      context: 'Platform: {platform}\nDuration: {duration}\nTheme: {theme}\nTarget Audience: {audience}',
      requirements: 'Include content themes, posting schedule, content types, engagement goals, and performance metrics',
      style: 'Strategic and data-driven',
      output: 'Structured content calendar with themes and schedule'
    }
  },
  {
    id: 'data-analysis-framework',
    title: 'Data Analysis Framework',
    description: 'Comprehensive data analysis and insights generation with visualization recommendations',
    category: 'analytics',
    tags: ['data-analysis', 'insights', 'analytics', 'research', 'business-intelligence', 'SMEs', 'enterprise'],
    usage: 445,
    rating: 4.6,
    tier: 'pro',
    author: 'Analytics Team',
    lastUpdated: '2024-01-08',
    preview: 'Analyze this dataset and provide insights on {metrics} with {visualization}...',
    template: {
      role: 'Data Analyst',
      task: 'Analyze {dataset} and provide insights on {metrics}',
      context: 'Dataset: {dataset}\nMetrics: {metrics}\nBusiness Context: {context}\nStakeholders: {stakeholders}',
      requirements: 'Include statistical analysis, key insights, visualization recommendations, actionable recommendations, and limitations',
      style: 'Analytical and objective',
      output: 'Comprehensive analysis report with insights and recommendations'
    }
  },
  {
    id: 'customer-support-response',
    title: 'Customer Support Response',
    description: 'Professional customer support response templates for various scenarios',
    category: 'support',
    tags: ['customer-support', 'customer-service', 'communication', 'B2B', 'B2C', 'SaaS', 'e-commerce'],
    usage: 334,
    rating: 4.5,
    tier: 'free',
    author: 'Support Team',
    lastUpdated: '2024-01-14',
    preview: 'Draft a professional response to customer {issue} with {tone} and {solution}...',
    template: {
      role: 'Customer Support Representative',
      task: 'Draft a professional response to customer {issue}',
      context: 'Issue: {issue}\nCustomer Type: {customer_type}\nPriority: {priority}\nPrevious Interactions: {history}',
      requirements: 'Show empathy, provide clear solution, set expectations, offer additional help, maintain brand voice',
      style: 'Professional and empathetic',
      output: 'Professional email response with next steps'
    }
  },
  {
    id: 'business-plan-generator',
    title: 'Business Plan Generator',
    description: 'Create comprehensive business plans and strategies for startups and SMEs',
    category: 'business',
    tags: ['business-plan', 'strategy', 'startups', 'SMEs', 'planning', 'investors', 'executives'],
    usage: 223,
    rating: 4.4,
    tier: 'pro',
    author: 'Business Team',
    lastUpdated: '2024-01-06',
    preview: 'Develop a business plan for {industry} startup with {funding} and {timeline}...',
    template: {
      role: 'Business Consultant',
      task: 'Develop a comprehensive business plan for {business_type} in {industry}',
      context: 'Business Type: {business_type}\nIndustry: {industry}\nFunding Required: {funding}\nTimeline: {timeline}',
      requirements: 'Include executive summary, market analysis, competitive analysis, financial projections, marketing strategy, and risk assessment',
      style: 'Professional and comprehensive',
      output: 'Structured business plan document'
    }
  },
  {
    id: 'social-media-post-creator',
    title: 'Social Media Post Creator',
    description: 'Create engaging social media posts for various platforms and audiences',
    category: 'marketing',
    tags: ['social-media', 'content-creation', 'engagement', 'B2B', 'B2C', 'branding', 'influencer-marketing'],
    usage: 189,
    rating: 4.3,
    tier: 'free',
    author: 'Social Media Team',
    lastUpdated: '2024-01-16',
    preview: 'Create a {platform} post about {topic} with {tone} and {call-to-action}...',
    template: {
      role: 'Social Media Manager',
      task: 'Create an engaging {platform} post about {topic}',
      context: 'Platform: {platform}\nTopic: {topic}\nTarget Audience: {audience}\nBrand Voice: {tone}',
      requirements: 'Include compelling hook, relevant hashtags, engaging visuals, clear call-to-action, and platform optimization',
      style: 'Engaging and platform-optimized',
      output: 'Social media post with hashtags and visual recommendations'
    }
  },
  {
    id: 'project-proposal-writer',
    title: 'Project Proposal Writer',
    description: 'Write compelling project proposals for clients and stakeholders',
    category: 'business',
    tags: ['proposal', 'project-management', 'B2B', 'clients', 'stakeholders', 'enterprise', 'SMEs'],
    usage: 156,
    rating: 4.2,
    tier: 'pro',
    author: 'Business Development Team',
    lastUpdated: '2024-01-09',
    preview: 'Write a project proposal for {project} with {budget} and {timeline}...',
    template: {
      role: 'Business Development Manager',
      task: 'Write a compelling project proposal for {project_type}',
      context: 'Project Type: {project_type}\nClient: {client}\nBudget: {budget}\nTimeline: {timeline}',
      requirements: 'Include problem statement, solution overview, methodology, timeline, budget breakdown, and success metrics',
      style: 'Professional and persuasive',
      output: 'Structured project proposal document'
    }
  },
  {
    id: 'onboarding-email-sequence',
    title: 'Onboarding Email Sequence',
    description: 'Create effective onboarding email sequences for new customers',
    category: 'marketing',
    tags: ['onboarding', 'email-marketing', 'customer-success', 'SaaS', 'B2B', 'B2C', 'conversion'],
    usage: 145,
    rating: 4.1,
    tier: 'pro',
    author: 'Customer Success Team',
    lastUpdated: '2024-01-11',
    preview: 'Create an onboarding email sequence for {product} with {steps}...',
    template: {
      role: 'Customer Success Manager',
      task: 'Create an onboarding email sequence for {product}',
      context: 'Product: {product}\nUser Type: {user_type}\nOnboarding Steps: {steps}\nSuccess Metrics: {metrics}',
      requirements: 'Include welcome email, feature introductions, best practices, support resources, and success milestones',
      style: 'Welcoming and helpful',
      output: 'Email sequence with timing and content for each email'
    }
  },
  {
    id: 'technical-writer-assistant',
    title: 'Technical Writer Assistant',
    description: 'Generate technical documentation and user guides',
    category: 'development',
    tags: ['technical-writing', 'documentation', 'user-guides', 'developers', 'end-users', 'SaaS', 'enterprise'],
    usage: 134,
    rating: 4.0,
    tier: 'free',
    author: 'Technical Writing Team',
    lastUpdated: '2024-01-13',
    preview: 'Write a technical guide for {feature} with {audience} in mind...',
    template: {
      role: 'Technical Writer',
      task: 'Write a technical guide for {feature}',
      context: 'Feature: {feature}\nTarget Audience: {audience}\nComplexity Level: {complexity}\nPlatform: {platform}',
      requirements: 'Include overview, prerequisites, step-by-step instructions, examples, troubleshooting, and related resources',
      style: 'Clear and technical',
      output: 'Structured technical guide with examples'
    }
  }
]

// Helper functions for template management
export const getTemplatesByCategory = (category) => {
  if (category === 'all') return templates
  return templates.filter(template => template.category === category)
}

export const getTemplatesByTag = (tag) => {
  return templates.filter(template => 
    template.tags.some(templateTag => 
      templateTag.toLowerCase().includes(tag.toLowerCase())
    )
  )
}

export const searchTemplates = (searchTerm) => {
  const term = searchTerm.toLowerCase()
  return templates.filter(template => 
    template.title.toLowerCase().includes(term) ||
    template.description.toLowerCase().includes(term) ||
    template.tags.some(tag => tag.toLowerCase().includes(term)) ||
    template.author.toLowerCase().includes(term)
  )
}

export const getPopularTags = (limit = 20) => {
  const tagCounts = {}
  
  templates.forEach(template => {
    template.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })
  
  return Object.entries(tagCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }))
}

export const getTemplateById = (id) => {
  return templates.find(template => template.id === id)
}

export const getTemplatesByTier = (tier) => {
  return templates.filter(template => template.tier === tier)
} 