/**
 * Generates XML prompt for Claude Sonnet based on user input
 * @param {Object} config - Configuration object
 * @param {string} config.role - Selected role
 * @param {string} config.task - Task description
 * @param {string} config.context - Additional context (optional)
 * @param {string} config.requirements - Specific requirements (optional)
 * @param {string} config.style - Style guidelines (optional)
 * @param {string} config.output - Output format requirements (optional)
 * @returns {string} Generated XML prompt
 */
export const generateClaudePrompt = (config) => {
  const { role, task, context, requirements, style, output } = config
  
  let prompt = '<prompt>\n'
  
  // Add role section
  if (role) {
    prompt += `  <role>${role}</role>\n`
  }
  
  // Add task section
  if (task) {
    prompt += `  <task>\n    ${task}\n  </task>\n`
  }
  
  // Add context section if provided
  if (context && context.trim()) {
    prompt += `  <context>\n    ${context}\n  </context>\n`
  }
  
  // Add requirements section if provided
  if (requirements && requirements.trim()) {
    prompt += `  <requirements>\n    ${requirements}\n  </requirements>\n`
  }
  
  // Add style section if provided
  if (style && style.trim()) {
    prompt += `  <style>\n    ${style}\n  </style>\n`
  }
  
  // Add output section if provided
  if (output && output.trim()) {
    prompt += `  <output>\n    ${output}\n  </output>\n`
  }
  
  prompt += '</prompt>'
  
  return prompt
}

/**
 * Validates the prompt configuration
 * @param {Object} config - Configuration object
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validatePromptConfig = (config) => {
  const errors = []
  
  if (!config.role || config.role.trim() === '') {
    errors.push('Role is required')
  }
  
  if (!config.task || config.task.trim() === '') {
    errors.push('Task description is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Formats the prompt for better readability
 * @param {string} prompt - Raw XML prompt
 * @returns {string} Formatted prompt
 */
export const formatPrompt = (prompt) => {
  // Basic XML formatting - could be enhanced with a proper XML formatter
  return prompt
    .replace(/></g, '>\n<')
    .replace(/\n\s*\n/g, '\n')
    .trim()
} 