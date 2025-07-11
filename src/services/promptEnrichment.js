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
          userTier: userTier,
          enrichmentLevel: promptData.enrichmentLevel || 50
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

  static async enhancePrompt(enrichmentRequest) {
    // Handle the different calling pattern used by some components
    const { formData, userContext } = enrichmentRequest
    const userToken = userContext?.token || null
    const userTier = userContext?.tier || 'free'
    
    return this.enrichPrompt(formData, userToken, userTier)
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
    
    const { task, context, requirements, role, style, output, enrichmentLevel } = promptData
    const isPro = !!userToken
    const level = enrichmentLevel || 50
    
    // Generate enhanced XML
    let xml = '<prompt>\n'
    
    if (role) {
      xml += `  <role>${role}</role>\n`
    }
    
    if (task) {
      const enhancedTask = level > 25 ? this.enhanceTask(task, level) : task
      xml += `  <task>\n    ${enhancedTask}\n  </task>\n`
    }
    
    if (context) {
      const enhancedContext = level > 25 ? this.enhanceContext(context, level) : context
      xml += `  <context>\n    ${enhancedContext}\n  </context>\n`
    }
    
    if (requirements) {
      const enhancedReq = level > 35 ? this.enhanceRequirements(requirements, level) : requirements
      xml += `  <requirements>\n    ${enhancedReq}\n  </requirements>\n`
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
    
    // Base improvements
    improvements.push('Basic XML structure applied', 'Essential elements organized')
    
    if (level >= 5) {
      improvements.push('Grammar and spelling corrections')
      qualityScore = 7.2
    }
    
    if (level >= 15) {
      improvements.push('Enhanced language clarity')
      qualityScore = 7.4
    }
    
    if (level >= 25) {
      improvements.push('Improved sentence structure and flow')
      qualityScore = 7.6
    }
    
    if (level >= 35) {
      improvements.push('Better organization and formatting')
      qualityScore = 7.8
    }
    
    if (level >= 45) {
      improvements.push('Enhanced clarity with minimal context')
      qualityScore = 8.0
    }
    
    if (level >= 55) {
      improvements.push('Added contextual improvements')
      qualityScore = 8.2
    }
    
    if (level >= 65) {
      improvements.push('Creative enhancements applied')
      qualityScore = 8.4
    }
    
    if (level >= 75) {
      improvements.push('Significant creative improvements')
      qualityScore = 8.6
    }
    
    if (level >= 85) {
      improvements.push('Substantial creative additions')
      qualityScore = 8.8
    }
    
    if (level >= 95) {
      improvements.push('Maximum creative freedom applied')
      qualityScore = 9.0
    }
    
    if (level === 100) {
      improvements.push('Full creative enhancement (may include inaccuracies)')
      qualityScore = 9.2
    }
    
    if (isPro) {
      improvements.push('Pro-tier optimizations applied')
      qualityScore = Math.min(qualityScore + 0.3, 10)
    }
    
          return {
        success: true,
        data: {
          enrichedPrompt: xml,
          improvements,
          qualityScore,
          isEnriched: level > 0,
          processingTime: `${(0.8 + (level * 0.01)).toFixed(1)}s`,
          tokensUsed: Math.ceil(45 + (level * 2.5)),
          enrichmentLevel: level,
          riskLevel: level <= 15 ? 'Safe' : level <= 50 ? 'Low' : level <= 85 ? 'Medium' : 'High'
        }
      }
  }
  
  static enhanceTask(task, level = 50) {
    let enhanced = task
    
    if (level >= 15) {
      // Basic language improvements
      enhanced = enhanced
        .replace(/\b(create|make|write|do|get)\b/gi, (match) => {
          const replacements = {
            'create': 'develop',
            'make': 'build', 
            'write': 'compose',
            'do': 'execute',
            'get': 'obtain'
          }
          return replacements[match.toLowerCase()] || match
        })
    }
    
    if (level >= 35) {
      // Better structure and clarity
      enhanced = enhanced
        .replace(/\b(create|develop)\b/gi, 'develop and implement')
        .replace(/\b(make|build)\b/gi, 'construct')
        .replace(/\b(write|compose)\b/gi, 'compose and structure')
    }
    
    if (level >= 55) {
      // Add contextual improvements
      enhanced += '\n\nConsider relevant context and current best practices.'
    }
    
    if (level >= 75) {
      // Creative enhancement - add comprehensive guidance
      enhanced += '\n\nEnsure the output is comprehensive, actionable, and aligned with industry standards.'
    }
    
    if (level >= 90) {
      // High creativity - may add assumptions
      enhanced += '\n\nFeel free to make reasonable assumptions about requirements and add creative enhancements that improve the overall quality.'
    }
    
    return enhanced
  }
  
  static enhanceContext(context, level = 50) {
    let enhanced = context
    
    if (level >= 35) {
      enhanced += '\n\nConsider the current environment and requirements.'
    }
    
    if (level >= 55) {
      enhanced += '\n\nConsider relevant background information and current best practices.'
    }
    
    if (level >= 75) {
      enhanced += '\n\nConsider the broader implications, potential edge cases, and stakeholder perspectives when addressing this task.'
    }
    
    if (level >= 90) {
      enhanced += '\n\nFeel free to infer additional context that would be helpful for completing this task effectively.'
    }
    
    return enhanced
  }
  
  static enhanceRequirements(requirements, level = 50) {
    let enhanced = requirements
    
    if (level >= 45) {
      enhanced += '\n\nOrganize requirements by priority and feasibility.'
    }
    
    if (level >= 65) {
      enhanced += '\n\nInclude success criteria and measurable outcomes.'
    }
    
    if (level >= 85) {
      enhanced += '\n\nConsider potential constraints, dependencies, and alternative approaches.'
    }
    
    return enhanced
  }
  
  static async enhancePrompt(enrichmentRequest) {
    // Handle the different calling pattern used by some components
    const { formData, userContext } = enrichmentRequest
    const userToken = userContext?.token || null
    
    return this.enrichPrompt(formData, userToken)
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