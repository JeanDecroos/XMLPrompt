import React, { useState, useEffect, useRef } from 'react'
import { 
  Target, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles,
  User,
  Briefcase,
  Code,
  Palette,
  TrendingUp,
  Users,
  BookOpen,
  Heart,
  Zap,
  Settings,
  ArrowRight,
  Search
} from 'lucide-react'
import { roles } from '../data/roles'

const ProgressiveContextWizard = ({ 
  formData, 
  onFormChange, 
  showAdvanced, 
  setShowAdvanced,
  onWorkflowComplete 
}) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRoleCategory, setSelectedRoleCategory] = useState(null)
  const [showTaskTemplates, setShowTaskTemplates] = useState(false)
  const [roleSearchTerm, setRoleSearchTerm] = useState('')
  
  // Ref for auto-scrolling to specific roles section
  const specificRolesRef = useRef(null)

  // Handle role category selection with auto-scroll
  const handleCategorySelect = (categoryId) => {
    setSelectedRoleCategory(categoryId)
    
    // Auto-scroll to specific roles section after a short delay
    setTimeout(() => {
      if (specificRolesRef.current) {
        specificRolesRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 300) // Small delay to allow the animation to start
  }

  // Role categories with visual icons and colors
  const roleCategories = [
    {
      id: 'business',
      name: 'Business & Strategy',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      description: 'Leadership, management, and business strategy',
      roles: roles.filter(r => r.category === 'Business')
    },
    {
      id: 'technology',
      name: 'Technology & Development',
      icon: <Code className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      description: 'Software development, engineering, and IT',
      roles: roles.filter(r => r.category === 'Technology' || r.category === 'Technical')
    },
    {
      id: 'creative',
      name: 'Creative & Design',
      icon: <Palette className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      description: 'Design, content creation, and artistic work',
      roles: roles.filter(r => r.category === 'Creative' || r.category === 'Media')
    },
    {
      id: 'marketing',
      name: 'Marketing & Sales',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
      description: 'Marketing, sales, and customer engagement',
      roles: roles.filter(r => r.category === 'Marketing' || r.category === 'Customer')
    },
    {
      id: 'education',
      name: 'Education & Research',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Teaching, training, and research',
      roles: roles.filter(r => r.category === 'Education' || r.category === 'Research')
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Wellness',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-red-500 to-red-600',
      description: 'Medical, healthcare, and wellness services',
      roles: roles.filter(r => r.category === 'Healthcare')
    },
    {
      id: 'other',
      name: 'Other Professions',
      icon: <Users className="w-6 h-6" />,
      color: 'from-gray-500 to-gray-600',
      description: 'Finance, legal, operations, and consulting',
      roles: roles.filter(r => ['Finance', 'Legal', 'Operations', 'Consulting', 'Nonprofit'].includes(r.category))
    }
  ]

  // Task templates based on common use cases
  const taskTemplates = {
    'Software Developer': [
      'Write clean, maintainable code for a new feature',
      'Debug and fix a complex technical issue',
      'Review code and provide constructive feedback',
      'Design system architecture for scalability',
      'Create technical documentation'
    ],
    'Marketing Specialist': [
      'Create a compelling marketing campaign',
      'Analyze customer behavior and trends',
      'Write engaging copy for social media',
      'Develop a brand messaging strategy',
      'Plan and execute a product launch'
    ],
    'UX/UI Designer': [
      'Design an intuitive user interface',
      'Conduct user research and analysis',
      'Create a seamless user experience flow',
      'Design a responsive web application',
      'Improve accessibility and usability'
    ],
    'Project Manager': [
      'Plan and organize a complex project',
      'Coordinate team members and resources',
      'Manage project timeline and deliverables',
      'Communicate with stakeholders effectively',
      'Identify and mitigate project risks'
    ]
  }

  // Handle role selection
  const handleRoleSelect = (roleName) => {
    onFormChange('role', roleName)
    setShowTaskTemplates(true)
    // Auto-advance to step 2 after a short delay
    setTimeout(() => {
      setCurrentStep(2)
    }, 500)
  }

  // Handle task template selection
  const handleTaskTemplateSelect = (template) => {
    onFormChange('task', template)
    // Auto-advance to step 3 after a short delay
    setTimeout(() => {
      setCurrentStep(3)
    }, 500)
    // Trigger workflow completion check
    if (formData.role && template) {
      setTimeout(() => {
        onWorkflowComplete && onWorkflowComplete()
      }, 800)
    }
  }

  // Get current role's category
  const getCurrentRoleCategory = () => {
    if (!formData.role) return null
    const role = roles.find(r => r.name === formData.role)
    return role ? roleCategories.find(cat => 
      cat.roles.some(r => r.name === formData.role)
    ) : null
  }

  // Filter roles based on search
  const filteredRoles = React.useMemo(() => {
    if (!roleSearchTerm) return roles
    
    return roles.filter(role => 
      role.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
      role.category.toLowerCase().includes(roleSearchTerm.toLowerCase())
    )
  }, [roleSearchTerm])

  // Progress calculation
  const progress = formData.role && formData.task ? 100 : formData.role ? 60 : 20

  return (
    <div className="progressive-context-wizard bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="text-center px-8 py-8 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Define Your Context</h2>
        <p className="text-gray-600 text-lg">Build your perfect prompt in 3 simple steps</p>
      </div>

      {/* Step Navigation */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-center space-x-4 max-w-md mx-auto">
          {/* Step 1 */}
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentStep === 1 
                ? 'bg-blue-500 text-white shadow-lg' 
                : formData.role
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 1 ? 'bg-white text-blue-500' : formData.role ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {formData.role ? <Check className="w-3 h-3" /> : '1'}
            </div>
            <span className="text-sm font-medium">
              {formData.role ? formData.role : 'Choose Role'}
            </span>
          </button>

          <ChevronRight className="w-4 h-4 text-gray-400" />

          {/* Step 2 */}
          <button
            onClick={() => formData.role && setCurrentStep(2)}
            disabled={!formData.role}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentStep === 2 
                ? 'bg-blue-500 text-white shadow-lg' 
                : formData.task
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : formData.role
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 2 ? 'bg-white text-blue-500' : formData.task ? 'bg-green-500 text-white' : formData.role ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-400'
            }`}>
              {formData.task ? <Check className="w-3 h-3" /> : '2'}
            </div>
            <span className="text-sm font-medium">
              {formData.task ? (formData.task.length > 30 ? formData.task.substring(0, 30) + '...' : formData.task) : 'Describe Task'}
            </span>
          </button>

          <ChevronRight className="w-4 h-4 text-gray-400" />

          {/* Step 3 */}
          <button
            onClick={() => formData.role && formData.task && setCurrentStep(3)}
            disabled={!formData.role || !formData.task}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              currentStep === 3 
                ? 'bg-blue-500 text-white shadow-lg' 
                : formData.role && formData.task
                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 3 ? 'bg-white text-blue-500' : formData.role && formData.task ? 'bg-gray-300 text-gray-600' : 'bg-gray-200 text-gray-400'
            }`}>
              3
            </div>
            <span className="text-sm font-medium">Add Details</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mt-4">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Getting started</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        
        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-6">
              <User className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-1">What's your role?</h3>
              <p className="text-gray-600 text-sm">Choose the category that best describes your professional context</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`group relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    selectedRoleCategory === category.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-white mb-3 mx-auto group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1 text-center text-sm">{category.name}</h4>
                  <p className="text-xs text-gray-600 text-center">{category.description}</p>
                  
                  {selectedRoleCategory === category.id && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Specific Roles */}
            {selectedRoleCategory && (
              <div ref={specificRolesRef} className="mt-6 animate-in slide-in-from-bottom duration-300">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Choose your specific role</h4>
                  <p className="text-gray-600 text-sm">Select the role that best matches your expertise</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {roleCategories
                    .find(cat => cat.id === selectedRoleCategory)
                    ?.roles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => handleRoleSelect(role.name)}
                      className={`group p-3 rounded-lg border transition-all duration-200 text-left hover:shadow-md hover:scale-105 ${
                        formData.role === role.name
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                          {role.name}
                        </h5>
                        {formData.role === role.name ? (
                          <Check className="w-3 h-3 text-blue-500" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Task Templates */}
        {currentStep === 2 && formData.role && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                <FileText className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">What do you want to accomplish?</h3>
              <p className="text-gray-600 text-sm">Choose a template or describe your own task</p>
            </div>

            {/* Task Templates */}
            {taskTemplates[formData.role] && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 text-center">
                  Popular tasks for {formData.role}s
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {taskTemplates[formData.role].map((template, index) => (
                    <button
                      key={index}
                      onClick={() => handleTaskTemplateSelect(template)}
                      className="group p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left hover:scale-105"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 group-hover:text-blue-600 transition-colors font-medium text-sm">
                            {template}
                          </p>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors ml-2 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Task Input */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <h4 className="text-base font-semibold text-gray-900 mb-3">Or describe your own task</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.task}
                    onChange={(e) => {
                      onFormChange('task', e.target.value)
                      // Check if both role and task are complete for workflow advancement
                      if (formData.role && e.target.value.trim().length > 10) {
                        setTimeout(() => {
                          onWorkflowComplete && onWorkflowComplete()
                        }, 1000)
                      }
                    }}
                    placeholder="Describe what you want to accomplish..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.task.length}/500 characters
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Change role</span>
              </button>
              
              {formData.task && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm"
                >
                  <span>Add details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Additional Details */}
        {currentStep === 3 && formData.role && formData.task && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mr-2">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                <Sparkles className="w-12 h-12 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Perfect! Let's add some details</h3>
              <p className="text-gray-600 text-sm">These optional details will make your prompt even better</p>
            </div>

            {/* Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Your context so far:</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <User className="w-3 h-3 text-blue-500" />
                  <span className="text-gray-700 text-sm"><strong>Role:</strong> {formData.role}</span>
                </div>
                <div className="flex items-start space-x-2">
                  <FileText className="w-3 h-3 text-blue-500 mt-0.5" />
                  <span className="text-gray-700 text-sm"><strong>Task:</strong> {formData.task.length > 100 ? formData.task.substring(0, 100) + '...' : formData.task}</span>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <h4 className="text-base font-semibold text-gray-900">Additional Details</h4>
                </div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAdvanced ? 'Hide details' : 'Show all details'}
                </button>
              </div>

              <div className="space-y-3">
                {/* Context Field - Always Visible */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Context & Background
                  </label>
                  <textarea
                    value={formData.context}
                    onChange={(e) => onFormChange('context', e.target.value)}
                    placeholder="Any additional context or background information..."
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Help the AI understand your specific situation</p>
                </div>

                {/* Advanced Fields */}
                {showAdvanced && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requirements & Constraints
                      </label>
                      <textarea
                        value={formData.requirements}
                        onChange={(e) => onFormChange('requirements', e.target.value)}
                        placeholder="Specific requirements, constraints, or limitations..."
                        className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Style & Tone
                        </label>
                        <input
                          type="text"
                          value={formData.style}
                          onChange={(e) => onFormChange('style', e.target.value)}
                          placeholder="e.g., formal, casual, technical"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Output Format
                        </label>
                        <input
                          type="text"
                          value={formData.output}
                          onChange={(e) => onFormChange('output', e.target.value)}
                          placeholder="e.g., bullet points, paragraph, code"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Change task</span>
              </button>
              
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                <span>Context defined! Ready for next step.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressiveContextWizard 