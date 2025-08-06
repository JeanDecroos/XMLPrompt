import React, { useState, useEffect } from 'react'
import { Search, User, ChevronRight, Check, Sparkles, Target, ArrowLeft, Grid, List, Info } from 'lucide-react'
import { roles, getRolesByCategory } from '../data/roles'
import { userGoals, getRolesForGoal, getGoalById } from '../data/userGoals'

// Tooltip component for enhanced UX
const Tooltip = ({ children, content, visible }) => (
  <div className="relative">
    {children}
    {visible && (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 max-w-xs text-center shadow-xl border border-gray-700">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    )}
  </div>
)

const ImprovedRoleSelector = ({ 
  selectedRole, 
  onRoleChange, 
  className = '',
  showDescription = true,
  compact = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('goals') // 'goals', 'categories', 'search'
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [hoveredTooltip, setHoveredTooltip] = useState(null)

  // Filter roles based on search and category
  const filteredRoles = React.useMemo(() => {
    let filtered = roles

    if (searchTerm) {
      filtered = filtered.filter(role => 
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(role => role.category === selectedCategory)
    }

    if (selectedGoal) {
      const goalRoleIds = getRolesForGoal(selectedGoal)
      filtered = filtered.filter(role => goalRoleIds.includes(role.id))
    }

    return filtered
  }, [searchTerm, selectedCategory, selectedGoal])

  // Get unique categories
  const categories = React.useMemo(() => {
    const cats = [...new Set(roles.map(role => role.category))]
    return cats.sort()
  }, [])

  // Handle search input
  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    if (term) {
      setViewMode('search')
      setSelectedGoal(null)
    } else if (selectedGoal) {
      setViewMode('goals')
    } else {
      setViewMode('categories')
    }
  }

  // Handle goal selection
  const handleGoalSelect = (goalId) => {
    setIsTransitioning(true)
    setSelectedGoal(goalId)
    setViewMode('goals')
    setSearchTerm('')
    setSelectedCategory('all')
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 200)
  }

  // Handle role selection with enhanced animation
  const handleRoleSelect = (role) => {
    setIsTransitioning(true)
    
    // Add role selection animation
    const selectedCard = document.querySelector(`[data-role-id="${role.id}"]`)
    if (selectedCard) {
      selectedCard.classList.add('role-selected')
      setTimeout(() => {
        selectedCard.classList.remove('role-selected')
      }, 600)
    }
    
    setTimeout(() => {
      onRoleChange(role.name)
      setIsTransitioning(false)
    }, 300) // Slightly longer delay to show the bounce animation
  }

  // Go back to goals view
  const handleBackToGoals = () => {
    setIsTransitioning(true)
    setSelectedGoal(null)
    setViewMode('goals')
    setSearchTerm('')
    setSelectedCategory('all')
    
    setTimeout(() => {
      setIsTransitioning(false)
    }, 200)
  }

  // Switch to categories view
  const handleShowAllRoles = () => {
    setViewMode('categories')
    setSelectedGoal(null)
    setSearchTerm('')
  }

  // Get current role object
  const currentRole = roles.find(r => r.name === selectedRole)

  if (compact) {
    return (
      <div className={`${className}`}>
        <div className="relative">
          <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-200">
            <User className="w-5 h-5 text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-gray-900"
            >
              <option value="">Select a role...</option>
              {categories.map(category => (
                <optgroup key={category} label={category}>
                  {roles.filter(role => role.category === category).map(role => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`improved-role-selector ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Choose Your Role</h3>
            <p className="text-sm text-gray-500">Select your professional context</p>
          </div>
        </div>
        
        {/* Show Popular Goals Button - Header Position */}
        {(viewMode === 'search' || viewMode === 'categories') && (
          <button
            onClick={() => {
              setSearchTerm('')
              setViewMode('goals')
              setSelectedCategory('all')
            }}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 bg-blue-50/50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Show Popular Goals</span>
          </button>
        )}

      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
      </div>

      {/* Content Area */}
      <div className={`transition-all duration-200 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
        
        {/* Goals View */}
        {viewMode === 'goals' && !selectedGoal && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">What's your goal?</h4>
              <p className="text-gray-600">Choose what you want to accomplish to see relevant roles</p>
            </div>
            
            {/* Popular Goals First - Progressive Disclosure */}
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Target className="w-4 h-4 mr-2 text-blue-500" />
                  Popular Goals
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {userGoals.slice(0, 4).map((goal, index) => (
                    <Tooltip
                      key={goal.id}
                      content={`Perfect for: ${goal.examples?.join(', ') || 'General professional tasks'}`}
                      visible={hoveredTooltip === `goal-${goal.id}`}
                    >
                      <button
                        onClick={() => handleGoalSelect(goal.id)}
                        onMouseEnter={() => setHoveredTooltip(`goal-${goal.id}`)}
                        onMouseLeave={() => setHoveredTooltip(null)}
                        className="w-full goal-card-improved group relative overflow-hidden"
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                        
                        <div className="relative flex flex-col items-center space-y-3 p-4">
                          <div className={`w-12 h-12 rounded-xl ${goal.color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 group-hover:animate-pulse`}>
                            {goal.icon}
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                {goal.title}
                              </h5>
                              <Info className="w-3 h-3 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 group-hover:text-gray-600 transition-colors duration-200">
                              {goal.description}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
              
              {/* More Goals - Progressive Disclosure */}
              {userGoals.length > 4 && (
                <div className="pt-4 border-t border-gray-100">
                  <details className="group">
                    <summary className="flex items-center justify-center cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors list-none">
                      <span>More goals</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {userGoals.slice(4).map((goal, index) => (
                        <Tooltip
                          key={goal.id}
                          content={`Perfect for: ${goal.examples?.join(', ') || 'General professional tasks'}`}
                          visible={hoveredTooltip === `goal-extended-${goal.id}`}
                        >
                          <button
                            onClick={() => handleGoalSelect(goal.id)}
                            onMouseEnter={() => setHoveredTooltip(`goal-extended-${goal.id}`)}
                            onMouseLeave={() => setHoveredTooltip(null)}
                            className="w-full goal-card-improved group relative overflow-hidden"
                            style={{ 
                              animationDelay: `${(index + 4) * 100}ms`,
                              animation: 'fadeInUp 0.6s ease-out forwards'
                            }}
                          >
                            {/* Hover glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                            
                            <div className="relative flex flex-col items-center space-y-3 p-4">
                              <div className={`w-12 h-12 rounded-xl ${goal.color} flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 group-hover:animate-pulse`}>
                                {goal.icon}
                              </div>
                              <div className="text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                    {goal.title}
                                  </h5>
                                  <Info className="w-3 h-3 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2 group-hover:text-gray-600 transition-colors duration-200">
                                  {goal.description}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
                            </div>
                          </button>
                        </Tooltip>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Selected Goal View */}
        {viewMode === 'goals' && selectedGoal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg ${getGoalById(selectedGoal)?.color} flex items-center justify-center text-white text-sm`}>
                  {getGoalById(selectedGoal)?.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{getGoalById(selectedGoal)?.title}</h4>
                  <p className="text-sm text-gray-500">Recommended roles</p>
                </div>
              </div>
              <button
                onClick={handleBackToGoals}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {filteredRoles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  isSelected={selectedRole === role.name}
                  onSelect={() => handleRoleSelect(role)}
                  showDescription={showDescription}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories/All Roles View */}
        {(viewMode === 'categories' || viewMode === 'search') && (
          <div className="space-y-6">
            {/* Search Results Count */}
            {viewMode === 'search' && searchTerm && (
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Showing {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''} for "{searchTerm}"
                </span>
              </div>
            )}

            {/* Category Filter */}
            {viewMode === 'categories' && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            <div className="space-y-1">
              {filteredRoles.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No roles found matching your criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedCategory('all')
                      setViewMode('goals')
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                filteredRoles.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    isSelected={selectedRole === role.name}
                    onSelect={() => handleRoleSelect(role)}
                    showDescription={showDescription}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Role Summary */}
      {currentRole && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-blue-600" />
            <div>
              <h5 className="font-medium text-blue-900">Selected: {currentRole.name}</h5>
              <p className="text-sm text-blue-700">{currentRole.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Individual Role Card Component
const RoleCard = ({ role, isSelected, onSelect, showDescription = true }) => {
  return (
    <button
      onClick={onSelect}
      data-role-id={role.id}
      className={`role-card-improved w-full text-left transition-all duration-200 ${
        isSelected ? 'selected' : ''
      }`}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium ${
              isSelected ? 'bg-blue-500' : 'bg-gray-400'
            }`}>
              {role.name.charAt(0)}
            </div>
            <div>
              <h5 className={`font-medium ${
                isSelected ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {role.name}
              </h5>
              {showDescription && (
                <p className={`text-sm ${
                  isSelected ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  {role.description}
                </p>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${
                isSelected 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {role.category}
              </span>
            </div>
          </div>
        </div>
        {isSelected && (
          <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
        )}
      </div>
    </button>
  )
}

export default ImprovedRoleSelector 