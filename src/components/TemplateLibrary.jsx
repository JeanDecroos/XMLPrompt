import React, { useState } from 'react'
import { 
  BookOpen, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Clock, 
  TrendingUp,
  Crown,
  Sparkles,
  ArrowLeft,
  Plus,
  Tag,
  Users,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'

const TemplateLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('popular') // 'popular', 'recent', 'rating'

  // Mock template data for WIP
  const mockTemplates = [
    {
      id: 'marketing-email',
      title: 'Marketing Email Generator',
      description: 'Create compelling marketing emails for product launches and campaigns',
      category: 'marketing',
      tags: ['email', 'marketing', 'sales'],
      usage: 1247,
      rating: 4.8,
      tier: 'free',
      author: 'PromptCraft Team',
      lastUpdated: '2024-01-15',
      preview: 'Generate a marketing email for {product} targeting {audience} with {goal}...'
    },
    {
      id: 'code-documentation',
      title: 'Code Documentation Assistant',
      description: 'Generate comprehensive documentation for code functions and APIs',
      category: 'development',
      tags: ['code', 'documentation', 'api'],
      usage: 892,
      rating: 4.9,
      tier: 'pro',
      author: 'Dev Team',
      lastUpdated: '2024-01-10',
      preview: 'Document this {language} function with parameters, return values, and examples...'
    },
    {
      id: 'content-strategy',
      title: 'Content Strategy Planner',
      description: 'Plan content strategy for social media campaigns and content marketing',
      category: 'content',
      tags: ['content', 'strategy', 'social-media'],
      usage: 567,
      rating: 4.7,
      tier: 'free',
      author: 'Content Team',
      lastUpdated: '2024-01-12',
      preview: 'Create a {duration} content calendar for {platform} focusing on {theme}...'
    },
    {
      id: 'data-analysis',
      title: 'Data Analysis Framework',
      description: 'Comprehensive data analysis and insights generation',
      category: 'analytics',
      tags: ['data', 'analysis', 'insights'],
      usage: 445,
      rating: 4.6,
      tier: 'pro',
      author: 'Analytics Team',
      lastUpdated: '2024-01-08',
      preview: 'Analyze this dataset and provide insights on {metrics} with {visualization}...'
    },
    {
      id: 'customer-support',
      title: 'Customer Support Response',
      description: 'Professional customer support response templates',
      category: 'support',
      tags: ['support', 'customer-service', 'communication'],
      usage: 334,
      rating: 4.5,
      tier: 'free',
      author: 'Support Team',
      lastUpdated: '2024-01-14',
      preview: 'Draft a professional response to customer {issue} with {tone} and {solution}...'
    },
    {
      id: 'business-plan',
      title: 'Business Plan Generator',
      description: 'Create comprehensive business plans and strategies',
      category: 'business',
      tags: ['business', 'planning', 'strategy'],
      usage: 223,
      rating: 4.4,
      tier: 'pro',
      author: 'Business Team',
      lastUpdated: '2024-01-06',
      preview: 'Develop a business plan for {industry} startup with {funding} and {timeline}...'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Templates', icon: Grid, count: mockTemplates.length },
    { id: 'marketing', name: 'Marketing', icon: TrendingUp, count: mockTemplates.filter(t => t.category === 'marketing').length },
    { id: 'development', name: 'Development', icon: Zap, count: mockTemplates.filter(t => t.category === 'development').length },
    { id: 'content', name: 'Content', icon: BookOpen, count: mockTemplates.filter(t => t.category === 'content').length },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, count: mockTemplates.filter(t => t.category === 'analytics').length },
    { id: 'support', name: 'Support', icon: Users, count: mockTemplates.filter(t => t.category === 'support').length },
    { id: 'business', name: 'Business', icon: Crown, count: mockTemplates.filter(t => t.category === 'business').length }
  ]

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.usage - a.usage
      case 'recent':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated)
      case 'rating':
        return b.rating - a.rating
      default:
        return 0
    }
  })

  const TemplateCard = ({ template }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
          </div>
          {template.tier === 'pro' && (
            <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              <Crown className="w-3 h-3" />
              <span>Pro</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.map(tag => (
            <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
              {tag}
            </span>
          ))}
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-700 font-mono">{template.preview}</p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {template.usage} uses
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              {template.rating}
            </span>
          </div>
          <span className="text-xs">by {template.author}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Use Template
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center mb-4">
            <Link to="/" className="flex items-center text-white hover:text-blue-200 transition-colors mr-4">
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to App
            </Link>
          </div>
          
          {/* WIP Badge */}
          <div className="inline-flex items-center bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-1" />
            Work in Progress
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Template Library</h1>
          <p className="text-xl text-blue-100">
            Professional prompt templates for every use case. Find the perfect starting point for your AI interactions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Recently Updated</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </h2>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTemplates.map(template => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTemplates.map(template => (
              <div key={template.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
                      {template.tier === 'pro' && (
                        <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          <span>Pro</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {template.usage} uses
                      </span>
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {template.rating}
                      </span>
                      <span>by {template.author}</span>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium ml-4">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or category filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateLibrary 