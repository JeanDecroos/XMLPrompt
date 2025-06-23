import React, { useState, useEffect, useRef } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, Github, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const AuthModal = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState(initialMode) // 'signin' or 'signup' or 'reset_password'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  
  const modalRef = useRef(null)
  const { signIn, signUp, resetPassword } = useAuth()

  useEffect(() => {
    setMode(initialMode)
    setError(null)
    setMessage(null)
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

  const handleOAuthSignIn = async (provider) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider })
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Failed to sign in with OAuth provider.')
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      let response
      if (mode === 'signup') {
        response = await signUp(email, password)
        if (!response.error) {
          setMessage('Check your email for the confirmation link!')
        }
      } else if (mode === 'signin') {
        response = await signIn(email, password)
        if (!response.error) {
          onClose() // Close modal on successful sign in
        }
      } else if (mode === 'reset_password') {
        response = await resetPassword(email)
        if (!response.error) {
          setMessage('Check your email for password reset instructions.')
        }
      }

      if (response.error) {
        throw response.error
      }
    } catch (err) {
      setError(err.message || `Failed to ${mode}.`)
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
          fields: ['email', 'password'],
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

        {error && <p className="mb-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
        {message && <p className="mb-4 text-center text-sm text-green-600 bg-green-50 p-3 rounded-lg">{message}</p>}

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
                className="input-field pl-12"
              />
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
                className="input-field pl-12 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary btn-lg"
          >
            {loading ? 'Processing...' : buttonText}
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

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or continue with</span>
          </div>
        </div>

        <div>
          <button 
            type="button" 
            onClick={() => handleOAuthSignIn('github')}
            disabled={loading}
            className="w-full btn btn-secondary"
          >
            <Github className="w-5 h-5 mr-3" />
            GitHub
          </button>
        </div>

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