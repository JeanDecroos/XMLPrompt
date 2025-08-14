/**
 * Prompt Enrichment Utility
 * 
 * This module handles the enrichment and optimization of user prompts
 * before they are converted to XML format. It provides extensible 
 * architecture for future AI-based enrichment APIs.
 */

// Enhancement patterns for different task types
const ENHANCEMENT_PATTERNS = {
  writing: {
    keywords: ['write', 'create', 'compose', 'draft'],
    enhancements: ['compelling', 'well-structured', 'engaging', 'clear']
  },
  analysis: {
    keywords: ['analyze', 'review', 'evaluate', 'assess'],
    enhancements: ['thorough', 'data-driven', 'systematic', 'objective']
  },
  development: {
    keywords: ['code', 'develop', 'build', 'implement'],
    enhancements: ['clean', 'maintainable', 'efficient', 'well-documented']
  },
  design: {
    keywords: ['design', 'create', 'layout', 'interface'],
    enhancements: ['user-centered', 'accessible', 'modern', 'intuitive']
  }
}

// Tone enhancements
const TONE_ENHANCEMENTS = {
  professional: 'in a professional and authoritative manner',
  friendly: 'in a warm, approachable tone',
  casual: 'in a relaxed and conversational style',
  formal: 'using formal language and structure',
  persuasive: 'with compelling and persuasive language',
  analytical: 'with analytical rigor and logical reasoning'
}

/**
 * Main enrichment function - enriches a basic prompt
 * @param {Object} promptData - Raw prompt data from form
 * @param {Object} enrichmentOptions - Additional enrichment options
 * @returns {Promise<Object>} Enriched prompt data
 */
export const enrichPrompt = async (promptData, enrichmentOptions = {}) => {
  const { tone, constraints = [], examples = '', goals = '' } = enrichmentOptions
  
  // TODO: Replace with actual AI API call (Claude, GPT, etc.)
  // For now, using mock enrichment logic
  const enrichedData = await mockEnrichment({
    ...promptData,
    tone,
    constraints,
    examples,
    goals
  })

  return enrichedData
}

/**
 * Mock enrichment function - simulates AI-based enhancement
 * This is where you would integrate with Claude API, GPT API, etc.
 */
async function mockEnrichment(data) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  const enriched = { ...data }

  // Enrich task description
  enriched.task = enrichTask(data.task, data.tone, data.role)
  
  // Enhance context
  if (data.context) {
    enriched.context = enrichContext(data.context, data.role)
  } else {
    enriched.context = generateContextFromTask(data.task, data.role)
  }

  // Optimize requirements
  enriched.requirements = enrichRequirements(data.requirements, data.role, data.constraints)

  // Enhance style guidelines
  enriched.style = enrichStyle(data.style, data.tone, data.role)

  // Improve output specifications
  enriched.output = enrichOutput(data.output, data.goals)

  return enriched
}

/**
 * Enriches task description by adding specificity and clarity
 */
function enrichTask(task, tone, role) {
  if (!task) return task

  let enrichedTask = task.trim()
  
  // Detect task type and add enhancements
  const taskType = detectTaskType(task)
  const pattern = ENHANCEMENT_PATTERNS[taskType]
  
  if (pattern && pattern.enhancements.length > 0) {
    const enhancement = pattern.enhancements[0]
    if (!hasQualityDescriptors(task)) {
      enrichedTask = enrichedTask.replace(/^(write|create|develop|build|design)/i, `$1 a ${enhancement}`)
    }
  }

  // Apply tone if specified
  if (tone && TONE_ENHANCEMENTS[tone]) {
    enrichedTask += ` ${TONE_ENHANCEMENTS[tone]}`
  }

  return enrichedTask
}

/**
 * Utility functions
 */
function detectTaskType(task) {
  const taskLower = task.toLowerCase()
  
  for (const [type, pattern] of Object.entries(ENHANCEMENT_PATTERNS)) {
    if (pattern.keywords.some(keyword => taskLower.includes(keyword))) {
      return type
    }
  }
  
  return 'writing'
}

function hasQualityDescriptors(task) {
  const qualityWords = ['high-quality', 'professional', 'excellent', 'comprehensive']
  return qualityWords.some(word => task.toLowerCase().includes(word))
}

function enrichContext(context, role) {
  const roleContexts = {
    'Software Developer': 'Consider technical constraints, scalability, and maintainability.',
    'Marketing Specialist': 'Focus on target audience, brand voice, and conversion goals.',
    'UX/UI Designer': 'Prioritize user experience, accessibility, and design principles.'
  }

  return context + (roleContexts[role] ? ` ${roleContexts[role]}` : '')
}

function enrichRequirements(requirements, role, constraints) {
  let enriched = requirements || ''
  
  // Add role-specific requirements
  const roleReqs = {
    'Software Developer': '- Follow coding best practices\n- Include proper error handling',
    'Marketing Specialist': '- Align with brand voice\n- Include clear calls-to-action',
    'UX/UI Designer': '- Ensure accessibility compliance\n- Maintain visual consistency'
  }

  if (roleReqs[role] && (!enriched || enriched.length < 50)) {
    enriched = enriched ? `${enriched}\n${roleReqs[role]}` : roleReqs[role]
  }

  return enriched
}

function enrichStyle(style, tone, role) {
  let enriched = style || ''
  
  if (tone && TONE_ENHANCEMENTS[tone] && !enriched.includes(tone)) {
    enriched = enriched ? `${enriched}. Use ${tone} tone` : `Use ${tone} tone`
  }

  return enriched
}

function enrichOutput(output, goals) {
  let enriched = output || 'Provide clear, organized output'
  
  if (goals && !enriched.includes('goal')) {
    enriched += ` that aligns with the goal: ${goals}`
  }

  return enriched
}

function generateContextFromTask(task, role) {
  const contexts = {
    'Software Developer': 'This involves creating technical solutions that are maintainable and scalable.',
    'Marketing Specialist': 'This requires understanding target audience and conversion optimization.',
    'UX/UI Designer': 'This involves creating user-centered designs that are accessible and intuitive.'
  }

  return contexts[role] || 'This task requires attention to detail and quality.'
}

/**
 * Gets available enrichment options for the UI
 */
export const getEnrichmentOptions = () => {
  return {
    tones: Object.keys(TONE_ENHANCEMENTS),
    taskTypes: Object.keys(ENHANCEMENT_PATTERNS)
  }
} 