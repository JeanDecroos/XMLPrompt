export const userGoals = [
  {
    id: 'write_content',
    title: 'Write Content',
    description: 'Create written content like articles, posts, or documentation',
    icon: '✍️',
    color: 'bg-blue-500',
    relevantRoles: [
      'content_writer',
      'copywriter',
      'technical_writer',
      'journalist',
      'social_media_manager',
      'email_marketer',
      'marketing_specialist'
    ]
  },
  {
    id: 'build_software',
    title: 'Build Software',
    description: 'Develop applications, websites, or technical solutions',
    icon: '💻',
    color: 'bg-green-500',
    relevantRoles: [
      'software_developer',
      'mobile_developer',
      'devops_engineer',
      'systems_architect',
      'ai_researcher'
    ]
  },
  {
    id: 'analyze_data',
    title: 'Analyze Data',
    description: 'Process, interpret, and extract insights from data',
    icon: '📊',
    color: 'bg-purple-500',
    relevantRoles: [
      'data_scientist',
      'business_analyst',
      'financial_analyst',
      'market_researcher',
      'research_specialist'
    ]
  },
  {
    id: 'design_visuals',
    title: 'Design Visuals',
    description: 'Create visual content, interfaces, or brand materials',
    icon: '🎨',
    color: 'bg-pink-500',
    relevantRoles: [
      'ux_ui_designer',
      'graphic_designer',
      'brand_strategist',
      'video_producer'
    ]
  },
  {
    id: 'manage_business',
    title: 'Manage Business',
    description: 'Lead projects, teams, or strategic initiatives',
    icon: '🏢',
    color: 'bg-orange-500',
    relevantRoles: [
      'business_consultant',
      'product_manager',
      'project_manager',
      'operations_manager',
      'strategy_consultant',
      'startup_advisor'
    ]
  },
  {
    id: 'market_promote',
    title: 'Market & Promote',
    description: 'Promote products, services, or build brand awareness',
    icon: '📢',
    color: 'bg-red-500',
    relevantRoles: [
      'marketing_specialist',
      'seo_specialist',
      'growth_hacker',
      'sales_manager',
      'email_marketer',
      'social_media_manager'
    ]
  },
  {
    id: 'research_learn',
    title: 'Research & Learn',
    description: 'Investigate topics, gather information, or conduct studies',
    icon: '🔍',
    color: 'bg-indigo-500',
    relevantRoles: [
      'research_specialist',
      'market_researcher',
      'ai_researcher',
      'educator',
      'academic_researcher'
    ]
  },
  {
    id: 'solve_problems',
    title: 'Solve Problems',
    description: 'Address challenges, troubleshoot issues, or optimize processes',
    icon: '🧩',
    color: 'bg-yellow-500',
    relevantRoles: [
      'business_consultant',
      'systems_architect',
      'cybersecurity_analyst',
      'operations_manager',
      'technical_support'
    ]
  },
  {
    id: 'handle_finances',
    title: 'Handle Finances',
    description: 'Manage money, investments, or financial planning',
    icon: '💰',
    color: 'bg-emerald-500',
    relevantRoles: [
      'financial_analyst',
      'accountant',
      'investment_advisor',
      'business_consultant'
    ]
  },
  {
    id: 'legal_compliance',
    title: 'Legal & Compliance',
    description: 'Handle legal matters, contracts, or regulatory compliance',
    icon: '⚖️',
    color: 'bg-slate-500',
    relevantRoles: [
      'legal_counsel',
      'contract_lawyer',
      'compliance_officer'
    ]
  },
  {
    id: 'support_customers',
    title: 'Support Customers',
    description: 'Help users, provide support, or manage relationships',
    icon: '🤝',
    color: 'bg-teal-500',
    relevantRoles: [
      'customer_success_manager',
      'technical_support',
      'customer_service_rep'
    ]
  },
  {
    id: 'manage_people',
    title: 'Manage People',
    description: 'Lead teams, hire talent, or develop organizational culture',
    icon: '👥',
    color: 'bg-cyan-500',
    relevantRoles: [
      'hr_manager',
      'project_manager',
      'operations_manager',
      'business_consultant'
    ]
  }
]

// Helper function to get roles for a specific goal
export const getRolesForGoal = (goalId) => {
  const goal = userGoals.find(g => g.id === goalId)
  return goal ? goal.relevantRoles : []
}

// Helper function to get goal by ID
export const getGoalById = (goalId) => {
  return userGoals.find(g => g.id === goalId)
}

// Helper function to get all goals
export const getAllGoals = () => {
  return userGoals
} 