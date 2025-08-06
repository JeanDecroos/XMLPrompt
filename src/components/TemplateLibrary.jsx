import React, { useState, useEffect } from 'react'
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
  Zap,
  BarChart3,
  GraduationCap,
  Palette,
  X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const TemplateLibrary = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTags, setSelectedTags] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('popular') // 'popular', 'recent', 'rating'
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  const [popularTags, setPopularTags] = useState([])
  const [templates, setTemplates] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  // Load data from database
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('template_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      
      if (categoriesError) {
        console.error('Error loading categories:', categoriesError)
      } else {
        setCategories(categoriesData)
      }
      
      // Load tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('template_tags')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false })
        .limit(20)
      
      if (tagsError) {
        console.error('Error loading tags:', tagsError)
      } else {
        setTags(tagsData)
        setPopularTags(tagsData.slice(0, 15))
      }
      
      // Load templates
      await loadTemplates()
      
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      let query = supabase
        .from('templates')
        .select(`
          *,
          category:template_categories(name, icon, color),
          tags:template_tags_junction(
            tag:template_tags(name, description, category)
          )
        `)
        .eq('status', 'active')

      // Apply search
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,preview_text.ilike.%${searchTerm}%`)
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory)
      }

      // Apply sorting
      switch (sortBy) {
        case 'popular':
          query = query.order('usage_count', { ascending: false })
          break
        case 'recent':
          query = query.order('created_at', { ascending: false })
          break
        case 'rating':
          query = query.order('rating_average', { ascending: false })
          break
        default:
          query = query.order('usage_count', { ascending: false })
      }

      const { data: templatesData, error: templatesError } = await query

      if (templatesError) {
        console.error('Error loading templates:', templatesError)
      } else {
        // Filter by selected tags in application layer
        let filteredTemplates = templatesData
        if (selectedTags.length > 0) {
          filteredTemplates = templatesData.filter(template => 
            selectedTags.every(selectedTag => 
              template.tags.some(tagRef => 
                tagRef.tag.name.toLowerCase().includes(selectedTag.toLowerCase())
              )
            )
          )
        }
        setTemplates(filteredTemplates)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  // Reload templates when filters change
  useEffect(() => {
    if (!loading) {
      loadTemplates()
    }
  }, [searchTerm, selectedCategory, sortBy, selectedTags])

  // Templates are already sorted by the database query
  const sortedTemplates = templates

  // Helper function to get icon component
  const getIconComponent = (iconName) => {
    const iconMap = {
      'Grid': Grid,
      'TrendingUp': TrendingUp,
      'Zap': Zap,
      'BookOpen': BookOpen,
      'BarChart3': BarChart3,
      'Users': Users,
      'Crown': Crown,
      'GraduationCap': GraduationCap,
      'Palette': Palette
    }
    return iconMap[iconName] || Grid
  }

  // Enhanced search with tag suggestions
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    
    // Auto-suggest tags based on search
    if (value.length > 2) {
      const matchingTags = tags.filter(tag => 
        tag.name.toLowerCase().includes(value.toLowerCase())
      )
      if (matchingTags.length > 0 && !selectedTags.includes(matchingTags[0].name)) {
        // Could show tag suggestions here
      }
    }
  }

  // Handle template usage
  const handleUseTemplate = (template) => {
    // Store template data in localStorage for the main prompt generator to pick up
    const templateData = {
      id: template.id,
      title: template.title,
      template: template.template_data,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('selectedTemplate', JSON.stringify(templateData))
    
    // Track template usage
    trackTemplateUsage(template.id, 'use')
    
    // Navigate to main page
    window.location.href = '/'
  }

  // Track template usage
  const trackTemplateUsage = async (templateId, actionType) => {
    try {
      await supabase
        .from('template_usage')
        .insert({
          template_id: templateId,
          action_type: actionType,
          source_page: 'template-library'
        })
    } catch (error) {
      console.error('Error tracking template usage:', error)
    }
  }

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
          {template.tags?.slice(0, 4).map(tagRef => (
            <span key={tagRef.tag.id} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">
              {tagRef.tag.name}
            </span>
          ))}
          {template.tags?.length > 4 && (
            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs">
              +{template.tags.length - 4} more
            </span>
          )}
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
                   {template.usage_count} uses
                 </span>
                 <span className="flex items-center">
                   <Star className="w-4 h-4 mr-1 text-yellow-500" />
                   {template.rating_average}
                 </span>
               </div>
               <span className="text-xs">by {template.author_name}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <button 
          onClick={() => handleUseTemplate(template)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
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
                placeholder="Search templates, tags, or authors..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
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
              {categories.map(category => {
                const IconComponent = getIconComponent(category.icon)
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{category.name}</span>
                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                      {category.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Selected Tags:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <div
                    key={tag}
                    className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSelectedTags([])}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Popular Tags */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Popular Tags:</span>
              </div>
              <button
                onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showTagSuggestions ? 'Hide' : 'Show all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularTags.slice(0, showTagSuggestions ? popularTags.length : 8).map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (!selectedTags.includes(tag)) {
                      setSelectedTags([...selectedTags, tag])
                    }
                  }}
                  disabled={selectedTags.includes(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-700 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
                  }`}
                >
                  {tag} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

                     {/* Results */}
             <div className="mb-6">
               <div className="flex items-center justify-between">
                 <h2 className="text-xl font-semibold text-gray-900">
                   {loading ? 'Loading...' : `${sortedTemplates.length} template${sortedTemplates.length !== 1 ? 's' : ''} found`}
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
               {!loading && sortedTemplates.length === 0 && (
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
                       setSelectedTags([])
                     }}
                     className="text-blue-600 hover:text-blue-700 font-medium"
                   >
                     Clear filters
                   </button>
                 </div>
               )}

               {/* Loading State */}
               {loading && (
                 <div className="text-center py-12">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">Loading templates...</h3>
                   <p className="text-gray-500">
                     Fetching the latest templates from the database
                   </p>
                 </div>
               )}
      </div>
    </div>
  )
}

export default TemplateLibrary 