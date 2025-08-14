import { supabase } from '../lib/supabase'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export class SharingService {
  /**
   * Create a new share for a prompt
   */
  static async createShare(shareData) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/sharing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(shareData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to create share'
        }
      }
    } catch (error) {
      console.error('Error creating share:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Get a shared prompt by share ID
   */
  static async getSharedPrompt(shareId, password = null) {
    try {
      const headers = {
        'Content-Type': 'application/json'
      }

      if (password) {
        headers['X-Share-Password'] = password
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/sharing/${shareId}`, {
        method: 'GET',
        headers
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to fetch shared prompt',
          status: response.status
        }
      }
    } catch (error) {
      console.error('Error fetching shared prompt:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Get user's shared prompts
   */
  static async getUserShares() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/sharing/my-shares`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to fetch user shares'
        }
      }
    } catch (error) {
      console.error('Error fetching user shares:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Update share settings
   */
  static async updateShare(shareId, updateData) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/sharing/${shareId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to update share'
        }
      }
    } catch (error) {
      console.error('Error updating share:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Delete a share
   */
  static async deleteShare(shareId) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/sharing/${shareId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to delete share'
        }
      }
    } catch (error) {
      console.error('Error deleting share:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Get public prompts for discovery
   */
  static async getPublicPrompts(page = 1, limit = 20, category = null, search = null) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })

      if (category) {
        params.append('category', category)
      }

      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/sharing/public?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to fetch public prompts'
        }
      }
    } catch (error) {
      console.error('Error fetching public prompts:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Get share analytics for a specific share
   */
  static async getShareAnalytics(shareId) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/sharing/${shareId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to fetch share analytics'
        }
      }
    } catch (error) {
      console.error('Error fetching share analytics:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Generate a short URL for sharing
   */
  static async generateShortUrl(shareId) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/sharing/${shareId}/short-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to generate short URL'
        }
      }
    } catch (error) {
      console.error('Error generating short URL:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Report a shared prompt for inappropriate content
   */
  static async reportPrompt(shareId, reason, description = '') {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/sharing/${shareId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason,
          description
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to report prompt'
        }
      }
    } catch (error) {
      console.error('Error reporting prompt:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }

  /**
   * Get sharing statistics for user
   */
  static async getSharingStats() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return {
          success: false,
          error: 'Authentication required'
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/v1/sharing/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to fetch sharing stats'
        }
      }
    } catch (error) {
      console.error('Error fetching sharing stats:', error)
      return {
        success: false,
        error: 'Network error occurred'
      }
    }
  }
}

export default SharingService 