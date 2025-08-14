// Universal Prompt Generator - Adapts prompt format based on selected AI model

import { getModelById, PROMPT_FORMATS } from '../data/aiModels'

export class UniversalPromptGenerator {
  static generatePrompt(formData, modelId, options = {}) {
    const model = getModelById(modelId)
    if (!model) {
      throw new Error(`Unknown model: ${modelId}`)
    }

    const format = options.format || model.preferredFormat
    const guidelines = model.promptGuidelines

    switch (format) {
      case PROMPT_FORMATS.XML:
        return this.generateXMLPrompt(formData, guidelines, model)
      case PROMPT_FORMATS.JSON:
        return this.generateJSONPrompt(formData, guidelines, model)
      case PROMPT_FORMATS.MARKDOWN:
        return this.generateMarkdownPrompt(formData, guidelines, model)
      case PROMPT_FORMATS.STRUCTURED:
        return this.generateStructuredPrompt(formData, guidelines, model)
      case PROMPT_FORMATS.YAML:
        return this.generateYAMLPrompt(formData, guidelines, model)
      case PROMPT_FORMATS.PLAIN:
        return this.generatePlainPrompt(formData, guidelines, model)
      default:
        return this.generateStructuredPrompt(formData, guidelines, model)
    }
  }

  // XML Format (Claude preferred)
  static generateXMLPrompt(formData, guidelines, model) {
    const { role, task, context, requirements, style, output } = formData
    let prompt = ''

    // Add thinking tags for models that support it
    if (guidelines.supportsThinking && model.features.includes('thinking_tags')) {
      prompt += '<thinking>\nI need to approach this task systematically, considering the role, context, and requirements.\n</thinking>\n\n'
    }

    prompt += '<prompt>\n'
    
    if (role) {
      prompt += `  <role>${role}</role>\n`
    }
    
    if (task) {
      prompt += `  <task>\n    ${this.formatMultilineContent(task, '    ')}\n  </task>\n`
    }
    
    if (context) {
      prompt += `  <context>\n    ${this.formatMultilineContent(context, '    ')}\n  </context>\n`
    }
    
    if (requirements) {
      prompt += `  <requirements>\n    ${this.formatMultilineContent(requirements, '    ')}\n  </requirements>\n`
    }
    
    if (style && model.features.includes('xml_tags')) {
      prompt += `  <style>\n    ${this.formatMultilineContent(style, '    ')}\n  </style>\n`
    }
    
    if (output) {
      prompt += `  <output>\n    ${this.formatMultilineContent(output, '    ')}\n  </output>\n`
    }

    prompt += '</prompt>'
    
    return {
      prompt,
      format: PROMPT_FORMATS.XML,
      metadata: {
        modelOptimized: true,
        supportsThinking: guidelines.supportsThinking,
        estimatedTokens: this.estimateTokens(prompt)
      }
    }
  }

  // JSON Format
  static generateJSONPrompt(formData, guidelines, model) {
    const { role, task, context, requirements, style, output } = formData
    
    const promptObject = {
      role: role || null,
      task: task || null,
      context: context || null,
      requirements: requirements || null,
      ...(style && { style }),
      ...(output && { output_format: output }),
      instructions: guidelines.bestPractices,
      model_info: {
        name: model.name,
        capabilities: Object.keys(model.capabilities).filter(cap => 
          model.capabilities[cap] === 'excellent'
        )
      }
    }

    // Remove null values
    Object.keys(promptObject).forEach(key => {
      if (promptObject[key] === null) {
        delete promptObject[key]
      }
    })

    const prompt = JSON.stringify(promptObject, null, 2)
    
    return {
      prompt,
      format: PROMPT_FORMATS.JSON,
      metadata: {
        modelOptimized: true,
        structured: true,
        estimatedTokens: this.estimateTokens(prompt)
      }
    }
  }

  // Markdown Format (Gemini preferred)
  static generateMarkdownPrompt(formData, guidelines, model) {
    const { role, task, context, requirements, style, output } = formData
    let prompt = ''

    prompt += `# ${model.name} Prompt\n\n`

    if (role) {
      prompt += `## Role\n${role}\n\n`
    }

    if (task) {
      prompt += `## Task\n${task}\n\n`
    }

    if (context) {
      prompt += `## Context\n${context}\n\n`
    }

    if (requirements) {
      prompt += `## Requirements\n${requirements}\n\n`
    }

    if (style) {
      prompt += `## Style Guidelines\n${style}\n\n`
    }

    if (output) {
      prompt += `## Output Format\n${output}\n\n`
    }

    // Add model-specific best practices
    prompt += `## Best Practices for ${model.name}\n`
    guidelines.bestPractices.forEach((practice, index) => {
      prompt += `${index + 1}. ${practice}\n`
    })

    return {
      prompt,
      format: PROMPT_FORMATS.MARKDOWN,
      metadata: {
        modelOptimized: true,
        readable: true,
        estimatedTokens: this.estimateTokens(prompt)
      }
    }
  }

  // Structured Format (GPT preferred)
  static generateStructuredPrompt(formData, guidelines, model) {
    const { role, task, context, requirements, style, output } = formData
    let prompt = ''

    prompt += `ROLE:\n${role || 'Assistant'}\n\n`

    if (task) {
      prompt += `TASK:\n${task}\n\n`
    }

    if (context) {
      prompt += `CONTEXT:\n${context}\n\n`
    }

    if (requirements) {
      prompt += `REQUIREMENTS:\n${this.formatAsBulletPoints(requirements)}\n\n`
    }

    if (style) {
      prompt += `STYLE:\n${style}\n\n`
    }

    if (output) {
      prompt += `OUTPUT FORMAT:\n${output}\n\n`
    }

    // Add model-specific guidance
    prompt += `OPTIMIZATION FOR ${model.name.toUpperCase()}:\n`
    guidelines.bestPractices.forEach(practice => {
      prompt += `• ${practice}\n`
    })

    return {
      prompt,
      format: PROMPT_FORMATS.STRUCTURED,
      metadata: {
        modelOptimized: true,
        clear: true,
        estimatedTokens: this.estimateTokens(prompt)
      }
    }
  }

  // YAML Format
  static generateYAMLPrompt(formData, guidelines, model) {
    const { role, task, context, requirements, style, output } = formData
    
    let prompt = `# ${model.name} Prompt Configuration\n\n`
    prompt += `model: ${model.id}\n`
    prompt += `provider: ${model.provider}\n\n`
    
    prompt += `prompt:\n`
    if (role) prompt += `  role: "${this.escapeYAML(role)}"\n`
    if (task) prompt += `  task: |\n    ${this.formatMultilineContent(task, '    ')}\n`
    if (context) prompt += `  context: |\n    ${this.formatMultilineContent(context, '    ')}\n`
    if (requirements) prompt += `  requirements: |\n    ${this.formatMultilineContent(requirements, '    ')}\n`
    if (style) prompt += `  style: "${this.escapeYAML(style)}"\n`
    if (output) prompt += `  output_format: "${this.escapeYAML(output)}"\n`
    
    prompt += `\noptimization:\n`
    prompt += `  best_practices:\n`
    guidelines.bestPractices.forEach(practice => {
      prompt += `    - "${this.escapeYAML(practice)}"\n`
    })

    return {
      prompt,
      format: PROMPT_FORMATS.YAML,
      metadata: {
        modelOptimized: true,
        configurable: true,
        estimatedTokens: this.estimateTokens(prompt)
      }
    }
  }

  // Plain Text Format (Llama preferred)
  static generatePlainPrompt(formData, guidelines, model) {
    const { role, task, context, requirements, style, output } = formData
    let prompt = ''

    if (role) {
      prompt += `You are a ${role}. `
    }

    if (task) {
      prompt += `Your task is: ${task}\n\n`
    }

    if (context) {
      prompt += `Context: ${context}\n\n`
    }

    if (requirements) {
      prompt += `Please ensure you: ${requirements}\n\n`
    }

    if (style) {
      prompt += `Style: ${style}\n\n`
    }

    if (output) {
      prompt += `Output format: ${output}\n\n`
    }

    // Add simple guidance for plain text models
    prompt += `Please follow these guidelines: ${guidelines.bestPractices.join(', ')}.`

    return {
      prompt,
      format: PROMPT_FORMATS.PLAIN,
      metadata: {
        modelOptimized: true,
        natural: true,
        estimatedTokens: this.estimateTokens(prompt)
      }
    }
  }

  // Utility methods
  static formatMultilineContent(content, indent = '') {
    return content.split('\n').map(line => indent + line.trim()).join('\n').trim()
  }

  static formatAsBulletPoints(content) {
    const lines = content.split('\n').filter(line => line.trim())
    return lines.map(line => {
      const trimmed = line.trim()
      return trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*') 
        ? trimmed 
        : `• ${trimmed}`
    }).join('\n')
  }

  static escapeYAML(str) {
    return str.replace(/"/g, '\\"').replace(/\n/g, '\\n')
  }

  static estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  // Validation and optimization
  static validatePrompt(formData, modelId) {
    const model = getModelById(modelId)
    if (!model) return { isValid: false, errors: ['Invalid model selected'] }

    const errors = []
    const warnings = []

    // Check required fields
    if (!formData.role) errors.push('Role is required')
    if (!formData.task) errors.push('Task description is required')

    // Model-specific validations
    if (model.maxTokens && formData.task && formData.task.length > model.maxTokens * 3) {
      warnings.push(`Task description might be too long for ${model.name}`)
    }

    // Check complexity vs model capabilities
    const complexity = this.assessComplexity(formData)
    if (complexity === 'high' && model.promptGuidelines.maxComplexity === 'medium') {
      warnings.push(`This prompt might be too complex for ${model.name}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      complexity,
      recommendedFormat: model.preferredFormat
    }
  }

  static assessComplexity(formData) {
    const factors = [
      formData.requirements?.length > 200,
      formData.context?.length > 300,
      formData.style?.length > 100,
      formData.output?.length > 100,
      (formData.requirements || '').includes('multiple') || (formData.requirements || '').includes('complex')
    ].filter(Boolean).length

    if (factors >= 3) return 'high'
    if (factors >= 1) return 'medium'
    return 'low'
  }

  // Get format-specific preview
  static getFormatPreview(format) {
    const previews = {
      [PROMPT_FORMATS.XML]: 'Uses semantic XML tags like <role>, <task>, <context>',
      [PROMPT_FORMATS.JSON]: 'Structured JSON object with clear key-value pairs',
      [PROMPT_FORMATS.MARKDOWN]: 'Clean markdown with headers and bullet points',
      [PROMPT_FORMATS.STRUCTURED]: 'Clear sections with uppercase headers',
      [PROMPT_FORMATS.YAML]: 'YAML configuration format with nested structure',
      [PROMPT_FORMATS.PLAIN]: 'Natural language without special formatting'
    }
    return previews[format] || 'Standard prompt format'
  }
} 