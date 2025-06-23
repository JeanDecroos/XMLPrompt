import { supabase, isAuthEnabled } from '../lib/supabase'

export class PromptService {
  static async savePrompt(promptData, userToken = null) {
    if (!isAuthEnabled) {
      // In demo mode, save to localStorage
      return this.saveToLocalStorage(promptData)
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const promptToSave = {
        user_id: user.id,
        title: this.generateTitle(promptData),
        role: promptData.role || null,
        task: promptData.task || null,
        context: promptData.context || null,
        requirements: promptData.requirements || null,
        style: promptData.style || null,
        output: promptData.output || null,
        raw_prompt: promptData.rawPrompt || null,
        enriched_prompt: promptData.enrichedPrompt || null,
        selected_model: promptData.selectedModel || null,
        prompt_metadata: promptData.promptMetadata || null,
        enrichment_result: promptData.enrichmentResult || null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('prompts')
        .insert([promptToSave])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data: data,
        message: 'Prompt saved successfully!'
      }
    } catch (error) {
      console.error('Failed to save prompt:', error)
      return {
        success: false,
        error: error.message,
        message: 'Failed to save prompt'
      }
    }
  }

  static async getUserPrompts(limit = 20, offset = 0) {
    if (!isAuthEnabled) {
      // In demo mode, get from localStorage
      return this.getFromLocalStorage()
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return {
        success: true,
        data: data || [],
        total: data?.length || 0
      }
    } catch (error) {
      console.error('Failed to fetch prompts:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  static async deletePrompt(promptId) {
    if (!isAuthEnabled) {
      // In demo mode, remove from localStorage
      return this.deleteFromLocalStorage(promptId)
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user.id) // Ensure user can only delete their own prompts

      if (error) throw error

      return {
        success: true,
        message: 'Prompt deleted successfully!'
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error)
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete prompt'
      }
    }
  }

  // Demo mode methods using localStorage
  static saveToLocalStorage(promptData) {
    try {
      const existingPrompts = JSON.parse(localStorage.getItem('saved_prompts') || '[]')
      
      const newPrompt = {
        id: Date.now().toString(), // Simple ID for demo
        ...promptData,
        title: this.generateTitle(promptData),
        created_at: new Date().toISOString()
      }

      existingPrompts.unshift(newPrompt) // Add to beginning
      
      // Keep only last 50 prompts in demo mode
      const trimmedPrompts = existingPrompts.slice(0, 50)
      
      localStorage.setItem('saved_prompts', JSON.stringify(trimmedPrompts))

      return {
        success: true,
        data: newPrompt,
        message: 'Prompt saved locally! (Demo Mode)'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to save prompt locally'
      }
    }
  }

  static getFromLocalStorage() {
    try {
      const prompts = JSON.parse(localStorage.getItem('saved_prompts') || '[]')
      return {
        success: true,
        data: prompts,
        total: prompts.length
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: []
      }
    }
  }

  static deleteFromLocalStorage(promptId) {
    try {
      const existingPrompts = JSON.parse(localStorage.getItem('saved_prompts') || '[]')
      const filteredPrompts = existingPrompts.filter(p => p.id !== promptId)
      
      localStorage.setItem('saved_prompts', JSON.stringify(filteredPrompts))

      return {
        success: true,
        message: 'Prompt deleted from local storage!'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete prompt from local storage'
      }
    }
  }

  // Helper method to generate a title from prompt data
  static generateTitle(promptData) {
    if (promptData.title) return promptData.title

    // Generate title from role and task
    const role = promptData.role || 'Assistant'
    const task = promptData.task || 'General Task'
    
    // Truncate task if too long
    const truncatedTask = task.length > 50 ? task.substring(0, 47) + '...' : task
    
    return `${role}: ${truncatedTask}`
  }

  // Helper method to format prompt data for saving
  static formatPromptForSaving(formData, rawPrompt, enrichedPrompt, selectedModel, promptMetadata, enrichmentResult) {
    return {
      role: formData.role,
      task: formData.task,
      context: formData.context,
      requirements: formData.requirements,
      style: formData.style,
      output: formData.output,
      rawPrompt,
      enrichedPrompt,
      selectedModel,
      promptMetadata,
      enrichmentResult
    }
  }
} 