import React, { useState } from 'react'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Database, 
  Zap, 
  Target, 
  GitBranch, 
  Share2, 
  BarChart3, 
  Workflow,
  Bot,
  Layers,
  Rocket,
  CheckCircle,
  Circle,
  ArrowRight
} from 'lucide-react'

const FutureRoadmap = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const featureCategories = {
    all: 'All Features',
    templates: 'Templates & Library',
    collaboration: 'Collaboration',
    analytics: 'Analytics & Testing',
    automation: 'Automation'
  }

  const roadmapFeatures = [
    // Templates & Library Features
    {
      id: 'prompt-templates',
      title: 'Smart Prompt Templates',
      description: 'Pre-built, industry-specific prompt templates with customizable parameters and best practices built-in.',
      category: 'templates',
      priority: 'high',
      status: 'planned',
      timeline: 'Q2 2024',
      icon: BookOpen,
      benefits: [
        'Accelerate prompt creation with proven templates',
        'Industry-specific optimizations (marketing, development, analysis)',
        'Drag-and-drop template customization',
        'Community-contributed template marketplace'
      ],
      technicalDetails: 'Template engine with variable substitution, conditional logic, and validation rules',
      userStory: 'As a marketer, I want to quickly generate product description prompts using proven templates.'
    },
    {
      id: 'prompt-library',
      title: 'Personal Prompt Library',
      description: 'Organize, tag, and search your prompt collection with smart categorization and favorites.',
      category: 'templates',
      priority: 'high',
      status: 'in-development',
      timeline: 'Q1 2024',
      icon: Database,
      benefits: [
        'Never lose a good prompt again',
        'Smart search and filtering by tags, model, or content',
        'Performance tracking for each saved prompt',
        'Export/import functionality for team sharing'
      ],
      technicalDetails: 'Vector-based semantic search, automated tagging, and performance analytics integration',
      userStory: 'As a prompt engineer, I want to build and organize a library of my best-performing prompts.'
    },
    {
      id: 'version-history',
      title: 'Prompt Version Control',
      description: 'Track changes, compare versions, and maintain a complete history of your prompt evolution.',
      category: 'templates',
      priority: 'medium',
      status: 'planned',
      timeline: 'Q3 2024',
      icon: GitBranch,
      benefits: [
        'Never lose track of what worked',
        'A/B test different prompt versions',
        'Rollback to previous versions instantly',
        'Collaborative editing with merge conflicts resolution'
      ],
      technicalDetails: 'Git-like versioning system with diff visualization and branching support',
      userStory: 'As a team lead, I want to track how our prompts evolve and identify what changes improve performance.'
    },

    // Collaboration Features
    {
      id: 'team-collaboration',
      title: 'Team Workspaces',
      description: 'Shared workspaces for teams to collaborate on prompts with role-based permissions and real-time editing.',
      category: 'collaboration',
      priority: 'high',
      status: 'planned',
      timeline: 'Q2 2024',
      icon: Users,
      benefits: [
        'Real-time collaborative prompt editing',
        'Role-based access control (viewer, editor, admin)',
        'Team-wide prompt libraries and templates',
        'Activity feeds and notification system'
      ],
      technicalDetails: 'WebSocket-based real-time collaboration, RBAC system, and conflict resolution',
      userStory: 'As a team manager, I want my team to collaborate on prompt development with proper access controls.'
    },
    {
      id: 'sharing-publishing',
      title: 'Prompt Sharing & Publishing',
      description: 'Share prompts publicly or privately with custom permissions, comments, and community ratings.',
      category: 'collaboration',
      priority: 'medium',
      status: 'planned',
      timeline: 'Q3 2024',
      icon: Share2,
      benefits: [
        'Share successful prompts with the community',
        'Discover and learn from others\' prompts',
        'Build reputation through quality contributions',
        'Monetize premium prompt templates'
      ],
      technicalDetails: 'Public/private sharing system, community rating algorithm, and content moderation',
      userStory: 'As a prompt expert, I want to share my best prompts and learn from the community.'
    },

    // Analytics & Testing Features
    {
      id: 'prompt-analytics',
      title: 'Advanced Prompt Analytics',
      description: 'Comprehensive analytics dashboard tracking prompt performance, cost, and effectiveness across models.',
      category: 'analytics',
      priority: 'high',
      status: 'in-development',
      timeline: 'Q1 2024',
      icon: BarChart3,
      benefits: [
        'Track prompt performance across different AI models',
        'Cost analysis and optimization recommendations',
        'Success rate monitoring and trend analysis',
        'Custom KPI dashboards for business metrics'
      ],
      technicalDetails: 'Real-time analytics pipeline, ML-based performance prediction, and custom dashboard builder',
      userStory: 'As a data analyst, I want to measure and optimize the ROI of our AI prompt usage.'
    },
    {
      id: 'ab-testing',
      title: 'Prompt A/B Testing Suite',
      description: 'Built-in A/B testing framework to scientifically compare prompt variations and optimize performance.',
      category: 'analytics',
      priority: 'medium',
      status: 'planned',
      timeline: 'Q2 2024',
      icon: Target,
      benefits: [
        'Scientific approach to prompt optimization',
        'Statistical significance testing',
        'Automated winner selection',
        'Multi-variate testing support'
      ],
      technicalDetails: 'Statistical testing framework, automated traffic splitting, and results visualization',
      userStory: 'As a product manager, I want to A/B test different prompt approaches to maximize conversion rates.'
    },
    {
      id: 'cost-optimization',
      title: 'Intelligent Cost Optimization',
      description: 'AI-powered recommendations to reduce token usage and costs while maintaining prompt effectiveness.',
      category: 'analytics',
      priority: 'high',
      status: 'planned',
      timeline: 'Q2 2024',
      icon: Zap,
      benefits: [
        'Automatic prompt compression without quality loss',
        'Model recommendation based on cost/performance ratio',
        'Budget alerts and spending forecasts',
        'Cost allocation by team or project'
      ],
      technicalDetails: 'ML models for prompt optimization, cost prediction algorithms, and budget management',
      userStory: 'As a CTO, I want to optimize our AI costs while maintaining the quality of our outputs.'
    },

    // Automation Features
    {
      id: 'workflow-automation',
      title: 'Prompt Workflow Automation',
      description: 'Create automated workflows that chain prompts together with conditional logic and error handling.',
      category: 'automation',
      priority: 'medium',
      status: 'planned',
      timeline: 'Q3 2024',
      icon: Workflow,
      benefits: [
        'Automate complex multi-step AI processes',
        'Conditional branching based on AI responses',
        'Error handling and retry mechanisms',
        'Integration with external APIs and webhooks'
      ],
      technicalDetails: 'Visual workflow builder, execution engine with state management, and API integrations',
      userStory: 'As a process automation specialist, I want to create complex AI workflows without coding.'
    },
    {
      id: 'api-integrations',
      title: 'Enterprise API & Integrations',
      description: 'Comprehensive API suite and pre-built integrations with popular business tools and platforms.',
      category: 'automation',
      priority: 'high',
      status: 'planned',
      timeline: 'Q2 2024',
      icon: Layers,
      benefits: [
        'Integrate with existing business workflows',
        'Bulk prompt processing capabilities',
        'Webhook support for real-time updates',
        'Pre-built connectors for Slack, Teams, Zapier, etc.'
      ],
      technicalDetails: 'RESTful API with rate limiting, webhook system, and OAuth2 authentication',
      userStory: 'As a developer, I want to integrate prompt generation into our existing business applications.'
    },
    {
      id: 'ai-assistant',
      title: 'AI Prompt Engineering Assistant',
      description: 'An AI assistant that helps improve your prompts, suggests optimizations, and provides best practices.',
      category: 'automation',
      priority: 'medium',
      status: 'planned',
      timeline: 'Q4 2024',
      icon: Bot,
      benefits: [
        'Real-time prompt improvement suggestions',
        'Best practice recommendations',
        'Automated prompt debugging',
        'Learning from successful prompt patterns'
      ],
      technicalDetails: 'Fine-tuned AI model for prompt analysis, pattern recognition, and recommendation engine',
      userStory: 'As a beginner, I want an AI assistant to help me write better prompts and learn best practices.'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in-development':
        return <Circle className="w-4 h-4 text-blue-600 fill-current" />
      case 'planned':
        return <Circle className="w-4 h-4 text-gray-400" />
      default:
        return <Circle className="w-4 h-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredFeatures = selectedCategory === 'all' 
    ? roadmapFeatures 
    : roadmapFeatures.filter(feature => feature.category === selectedCategory)

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
            <Rocket className="w-4 h-4 mr-2" />
            Product Roadmap
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The Future of AI Prompt Engineering
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're building the most comprehensive prompt engineering platform. 
            Here's what's coming next to transform how you work with AI.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.entries(featureCategories).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedCategory === key
                  ? 'bg-primary-600 text-white shadow-md transform scale-105'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredFeatures.map((feature) => {
            const IconComponent = feature.icon
            return (
              <div
                key={feature.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <IconComponent className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {feature.title}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(feature.status)}
                        <span className="text-sm text-gray-500 capitalize">
                          {feature.status.replace('-', ' ')}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">
                          {feature.timeline}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(feature.priority)}`}>
                    {feature.priority} priority
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>

                {/* User Story */}
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 italic">
                    "{feature.userStory}"
                  </p>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Key Benefits</h4>
                  <ul className="space-y-1">
                    {feature.benefits.slice(0, 3).map((benefit, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <ArrowRight className="w-3 h-3 mt-0.5 mr-2 text-primary-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Details */}
                <div className="pt-4 border-t border-gray-100">
                  <details className="group">
                    <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-primary-600 transition-colors">
                      Technical Implementation
                      <span className="ml-2 group-open:rotate-90 transition-transform">▶</span>
                    </summary>
                    <p className="text-sm text-gray-600 mt-2 pl-4 border-l-2 border-gray-200">
                      {feature.technicalDetails}
                    </p>
                  </details>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Shape the Future with Us
            </h3>
            <p className="text-lg mb-6 text-primary-100">
              Join our community and help prioritize the features that matter most to you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Request a Feature
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors">
                Join Beta Program
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Development Timeline
          </h3>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-0.5 h-full w-0.5 bg-gray-300"></div>
            <div className="space-y-8">
              {['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'].map((quarter, index) => {
                const quarterFeatures = roadmapFeatures.filter(f => f.timeline === quarter)
                return (
                  <div key={quarter} className="relative">
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-md"></div>
                    <div className={`${index % 2 === 0 ? 'text-right pr-8 mr-auto w-1/2' : 'text-left pl-8 ml-auto w-1/2'}`}>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{quarter}</h4>
                      <div className="space-y-2">
                        {quarterFeatures.map(feature => (
                          <div key={feature.id} className="text-sm text-gray-600 flex items-center">
                            <feature.icon className="w-4 h-4 mr-2 text-primary-500" />
                            {feature.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FutureRoadmap 