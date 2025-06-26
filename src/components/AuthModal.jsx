import React, { useState, useEffect, useRef } from 'react'
import { X, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode) // 'signin' or 'signup' or 'reset_password'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validationErrors, setValidationErrors] = useState({})
  
  const modalRef = useRef(null)
  const { signIn, signUp, resetPassword } = useAuth()

  useEffect(() => {
    setMode(initialMode)
    setError(null)
    setMessage(null)
    setValidationErrors({})
    // Reset form fields when modal opens/closes or mode changes
    if (isOpen) {
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setShowConfirmPassword(false)
    }
  }, [initialMode, isOpen])

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Password strength calculation
  useEffect(() => {
    if (mode === 'signup' && password) {
      let strength = 0
      if (password.length >= 8) strength += 25
      if (password.match(/[a-z]/)) strength += 25
      if (password.match(/[A-Z]/)) strength += 25
      if (password.match(/[0-9]/) || password.match(/[^a-zA-Z0-9]/)) strength += 25
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [password, mode])

  // Real-time validation
  useEffect(() => {
    const errors = {}
    
    if (mode === 'signup') {
      // Email validation
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address'
      }
      
      // Password validation
      if (password && password.length < 6) {
        errors.password = 'Password must be at least 6 characters long'
      }
      
      // Confirm password validation
      if (confirmPassword && password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setValidationErrors(errors)
  }, [email, password, confirmPassword, mode])
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // Final validation before submission
    if (mode === 'signup') {
      if (Object.keys(validationErrors).length > 0) {
        setError('Please fix the validation errors before submitting')
        setLoading(false)
        return
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }
    }

    try {
      let response
      if (mode === 'signup') {
        response = await signUp(email, password)
        if (!response.error) {
          setMessage('Account created successfully! Please check your email for the confirmation link.')
          // Clear form after successful signup
          setEmail('')
          setPassword('')
          setConfirmPassword('')
        }
      } else if (mode === 'signin') {
        response = await signIn(email, password)
        if (!response.error) {
          onClose() // Close modal on successful sign in
        }
      } else if (mode === 'reset_password') {
        response = await resetPassword(email)
        if (!response.error) {
          setMessage('Password reset instructions have been sent to your email.')
        }
      }

      if (response.error) {
        throw response.error
      }
    } catch (err) {
      console.error(`${mode} error:`, err)
      
      // Provide more specific error messages
      let errorMessage = err.message || `Failed to ${mode}.`
      
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.'
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.'
      } else if (err.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Try signing in instead.'
      } else if (err.message?.includes('Password should be at least')) {
        errorMessage = 'Password must be at least 6 characters long.'
      } else if (err.message?.includes('Unable to validate email address') || err.message?.includes('invalid')) {
        errorMessage = 'Please enter a valid email address.'
      } else if (err.message?.includes('Database error') || err.message?.includes('500')) {
        errorMessage = 'Server error occurred. Please try again in a few moments or contact support if the issue persists.'
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        errorMessage = 'Network connection error. Please check your internet connection and try again.'
      } else if (err.message?.includes('signup disabled')) {
        errorMessage = 'New user registration is temporarily disabled. Please try again later.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const renderContent = () => {
    switch (mode) {
      case 'signup':
        return {
          title: 'Create an Account',
          description: 'Unlock advanced features and save your prompts.',
          buttonText: 'Create Account',
          fields: ['email', 'password', 'confirmPassword'],
          footerLink: 'signin',
          footerText: 'Already have an account?',
          footerAction: 'Sign In'
        }
      case 'reset_password':
        return {
          title: 'Reset Password',
          description: 'Enter your email to receive reset instructions.',
          buttonText: 'Send Instructions',
          fields: ['email'],
          footerLink: 'signin',
          footerText: 'Remembered your password?',
          footerAction: 'Sign In'
        }
      case 'signin':
      default:
        return {
          title: 'Welcome Back',
          description: 'Sign in to access your saved prompts and settings.',
          buttonText: 'Sign In',
          fields: ['email', 'password'],
          footerLink: 'signup',
          footerText: "Don't have an account?",
          footerAction: 'Sign Up'
        }
    }
  }

  const { title, description, buttonText, fields, footerLink, footerText, footerAction } = renderContent()

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return 'bg-red-500'
    if (passwordStrength < 50) return 'bg-orange-500'
    if (passwordStrength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak'
    if (passwordStrength < 50) return 'Fair'
    if (passwordStrength < 75) return 'Good'
    return 'Strong'
  }
  
  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="relative w-full max-w-md m-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 mt-2">{description}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-600">{message}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.includes('email') && (
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={`input-field pl-12 ${validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>
          )}
          
          {fields.includes('password') && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                className={`input-field pl-12 pr-12 ${validationErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {validationErrors.password && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
              )}
              
              {/* Password strength indicator for signup */}
              {mode === 'signup' && password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Password strength</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength < 25 ? 'text-red-600' : 
                      passwordStrength < 50 ? 'text-orange-600' : 
                      passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {fields.includes('confirmPassword') && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={`input-field pl-12 pr-12 ${validationErrors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {validationErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
              )}
              {confirmPassword && password === confirmPassword && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Passwords match
                </p>
              )}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || (mode === 'signup' && Object.keys(validationErrors).length > 0)}
            className="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : buttonText}
          </button>

          {mode === 'signin' && (
            <div className="text-right">
              <button 
                type="button" 
                onClick={() => setMode('reset_password')}
                className="text-sm text-primary-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {footerText}{' '}
            <button onClick={() => setMode(footerLink)} className="font-medium text-primary-600 hover:underline">
              {footerAction}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthModal 