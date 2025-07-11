// Frontend service for communicating with backend API for prompt enrichment

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export class PromptEnrichmentService {
  static async enrichPrompt(promptData, userToken = null, userTier = 'free') {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/enrichment/enhance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken && { 'Authorization': `Bearer ${userToken}` })
        },
        body: JSON.stringify({
          task: promptData.task,
          context: promptData.context,
          requirements: promptData.requirements,
          role: promptData.role,
          style: promptData.style,
          output: promptData.output,
          userTier: userTier
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result
      }
    } catch (error) {
      console.error('Prompt enrichment failed:', error)
      return {
        success: false,
        error: error.message,
        fallback: this.generateBasicPrompt(promptData)
      }
    }
  }

  static generateBasicPrompt(promptData) {
    // Fallback XML generation for when API fails
    const { task, context, requirements, role } = promptData
    
    let xml = '<prompt>\n'
    
    if (role) {
      xml += `  <role>${role}</role>\n`
    }
    
    if (task) {
      xml += `  <task>\n    ${task}\n  </task>\n`
    }
    
    if (context) {
      xml += `  <context>\n    ${context}\n  </context>\n`
    }
    
    if (requirements) {
      xml += `  <requirements>\n    ${requirements}\n  </requirements>\n`
    }
    
    xml += '</prompt>'
    
    return {
      enrichedPrompt: xml,
      improvements: ['Basic XML structure applied'],
      qualityScore: 6,
      isEnriched: false
    }
  }

  static async getEnrichmentStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      return response.ok
    } catch (error) {
      return false
    }
  }
}

// Mock enrichment for development/demo purposes
export class MockPromptEnrichmentService {
  static async enrichPrompt(promptData, userToken = null) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const { task, context, requirements, role, style, output } = promptData
    const isPro = !!userToken
    
    // Generate enhanced XML
    let xml = '<prompt>\n'
    
    if (role) {
      xml += `  <role>${role}</role>\n`
    }
    
    if (task) {
      const enhancedTask = isPro ? this.enhanceTask(task) : task
      xml += `  <task>\n    ${enhancedTask}\n  </task>\n`
    }
    
    if (context) {
      const enhancedContext = isPro ? this.enhanceContext(context) : context
      xml += `  <context>\n    ${enhancedContext}\n  </context>\n`
    }
    
    if (requirements && isPro) {
      const enhancedReq = this.enhanceRequirements(requirements)
      xml += `  <requirements>\n    ${enhancedReq}\n  </requirements>\n`
    } else if (requirements) {
      xml += `  <requirements>\n    ${requirements}\n  </requirements>\n`
    }
    
    if (style && isPro) {
      xml += `  <style>\n    ${style}\n  </style>\n`
    }
    
    if (output && isPro) {
      xml += `  <output>\n    ${output}\n  </output>\n`
    }
    
    xml += '</prompt>'
    
    const improvements = []
    let qualityScore = 7
    
    if (isPro) {
      improvements.push(
        'Enhanced task clarity and specificity',
        'Improved context with relevant details',
        'Optimized requirements structure',
        'Added professional styling guidelines',
        'Structured output format specified'
      )
      qualityScore = 9.2
    } else {
      improvements.push(
        'Basic XML structure applied',
        'Essential elements organized'
      )
    }
    
    return {
      success: true,
      data: {
        enrichedPrompt: xml,
        improvements,
        qualityScore,
        isEnriched: isPro,
        processingTime: '1.2s',
        tokensUsed: isPro ? 145 : 45
      }
    }
  }
  
  static enhanceTask(task) {
    // Add more specific language and structure
    return task
      .replace(/create/gi, 'develop and implement')
      .replace(/make/gi, 'construct')
      .replace(/write/gi, 'compose and structure')
      + '\n\nEnsure the output is comprehensive, actionable, and aligned with best practices.'
  }
  
  static enhanceContext(context) {
    return context + '\n\nConsider the broader implications, potential edge cases, and stakeholder perspectives when addressing this task.'
  }
  
  static enhanceRequirements(requirements) {
    return requirements + '\n\nPrioritize requirements by importance and feasibility. Include success criteria and measurable outcomes.'
  }
  
  static async getEnrichmentStatus() {
    return true // Mock service is always available
  }
}

// Export the service to use (switch between real and mock)
// Use real service by default, fallback to mock only if API_URL is not set
export const promptEnrichmentService = import.meta.env.VITE_API_URL 
  ? PromptEnrichmentService 
  : MockPromptEnrichmentService 