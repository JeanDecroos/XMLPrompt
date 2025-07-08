import React, { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, User, Target, Check, ArrowRight } from 'lucide-react'
import { userGoals, getRolesForGoal, getGoalById } from '../data/userGoals'
import { roles } from '../data/roles'

const GoalFirstRoleSelector = ({ 
  selectedRole, 
  onRoleChange, 
  className = '',
  showRoleDescription = true 
}) => {
  const [currentStep, setCurrentStep] = useState(selectedRole ? 'role' : 'goal')
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [filteredRoles, setFilteredRoles] = useState([])
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Initialize goal based on current role
  useEffect(() => {
    if (selectedRole && !selectedGoal && currentStep !== 'goal') {
      // Find which goal contains this role
      const goalWithRole = userGoals.find(goal => 
        goal.relevantRoles.includes(roles.find(r => r.name === selectedRole)?.id)
      )
      if (goalWithRole) {
        setSelectedGoal(goalWithRole.id)
        setCurrentStep('role')
      }
    }
  }, [selectedRole, selectedGoal, currentStep])

  // Update filtered roles when goal changes
  useEffect(() => {
    if (selectedGoal) {
      const roleIds = getRolesForGoal(selectedGoal)
      const goalRoles = roles.filter(role => roleIds.includes(role.id))
      setFilteredRoles(goalRoles)
    }
  }, [selectedGoal])

  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId)
    setIsTransitioning(true)
    
    // Smooth transition to role selection
    setTimeout(() => {
      setCurrentStep('role')
      setIsTransitioning(false)
    }, 150)
  }

  const handleRoleSelect = (roleName) => {
    onRoleChange(roleName)
  }

  const handleBackToGoals = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentStep('goal')
      setSelectedGoal(null)
      setFilteredRoles([])
      // Clear the selected role when going back to goals
      onRoleChange('')
      setIsTransitioning(false)
    }, 150)
  }

  const getCurrentRole = () => {
    return roles.find(r => r.name === selectedRole)
  }

  if (currentStep === 'goal') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">What do you want to accomplish?</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Choose your primary goal to see relevant professional roles
        </p>

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 transition-step ${
          isTransitioning ? 'transitioning' : ''
        }`}>
          {userGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => handleGoalSelect(goal.id)}
              className="goal-card group text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 p-4"
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`goal-icon ${goal.color} flex-shrink-0`}>
                  {goal.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors text-center">
                    {goal.title}
                  </h4>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {/* Skip option */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              setIsTransitioning(true)
              setTimeout(() => {
                setCurrentStep('role')
                setSelectedGoal(null)
                setFilteredRoles([])
                setIsTransitioning(false)
              }, 150)
            }}
            className="text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
          >
            <span>Skip goal selection and see all roles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (currentStep === 'role') {
    const currentGoal = selectedGoal ? getGoalById(selectedGoal) : null
    const rolesToShow = selectedGoal && filteredRoles.length > 0 ? filteredRoles : roles

    return (
      <div className={`space-y-4 ${className}`}>
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {currentGoal ? `Roles for ${currentGoal.title}` : 'Choose Your Role'}
            </h3>
          </div>
          
          {selectedGoal && (
            <button
              onClick={handleBackToGoals}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to goals</span>
            </button>
          )}
        </div>

        {/* Goal context */}
        {currentGoal && (
          <div className="bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg ${currentGoal.color} flex items-center justify-center text-white text-sm`}>
                {currentGoal.icon}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{currentGoal.title}</h4>
                <p className="text-sm text-gray-600">{currentGoal.description}</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-6">
          {selectedGoal 
            ? `These roles are most relevant for ${currentGoal?.title.toLowerCase()}`
            : 'Select the professional role that best matches your expertise and context'
          }
        </p>

        {/* Role selection */}
        <div className={`role-list transition-step ${
          isTransitioning ? 'transitioning' : ''
        }`}>
          {rolesToShow.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.name)}
              className={`role-card w-full text-left focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                selectedRole === role.name ? 'selected' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-medium ${
                      selectedRole === role.name ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {role.name}
                    </h4>
                    {selectedRole === role.name && (
                      <Check className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  {showRoleDescription && (
                    <p className={`text-sm mt-1 ${
                      selectedRole === role.name ? 'text-primary-600' : 'text-gray-600'
                    }`}>
                      {role.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Show all roles option when filtered */}
        {selectedGoal && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setSelectedGoal(null)
                  setFilteredRoles([])
                  setIsTransitioning(false)
                }, 150)
              }}
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center space-x-1"
            >
              <span>Show all roles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selected role feedback */}
        {selectedRole && showRoleDescription && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Check className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-medium">
                  Selected: {selectedRole}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This role will help optimize your prompts and select the best AI model
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

export default GoalFirstRoleSelector 