// AI Model Registry - Defines capabilities, format preferences, and characteristics for each supported model

export const AI_MODEL_CATEGORIES = {
  CLAUDE: 'claude',
  OPENAI: 'openai', 
  GOOGLE: 'google',
  ANTHROPIC: 'anthropic',
  MISTRAL: 'mistral',
  META: 'meta',
  COHERE: 'cohere'
}

export const PROMPT_FORMATS = {
  XML: 'xml',
  JSON: 'json',
  MARKDOWN: 'markdown',
  PLAIN: 'plain',
  YAML: 'yaml',
  STRUCTURED: 'structured'
}

export const AI_MODELS = {
  // Claude Models (Anthropic)
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: AI_MODEL_CATEGORIES.CLAUDE,
    description: 'Most capable Claude model for complex reasoning and analysis',
    preferredFormat: PROMPT_FORMATS.XML,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.STRUCTURED],
    maxTokens: 200000,
    contextWindow: 200000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'excellent',
      multimodal: true
    },
    pricing: { input: 3.00, output: 15.00 }, // per 1M tokens
    features: ['xml_tags', 'thinking_tags', 'artifacts', 'vision'],
    promptGuidelines: {
      useXMLTags: true,
      preferStructured: true,
      supportsThinking: true,
      maxComplexity: 'high',
      bestPractices: [
        'Use clear XML structure with semantic tags',
        'Leverage thinking tags for complex reasoning',
        'Be explicit about desired output format',
        'Use examples when helpful'
      ]
    }
  },
  
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    category: AI_MODEL_CATEGORIES.CLAUDE,
    description: 'Fast and efficient Claude model for quick tasks',
    preferredFormat: PROMPT_FORMATS.XML,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 200000,
    contextWindow: 200000,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: true
    },
    pricing: { input: 0.25, output: 1.25 },
    features: ['xml_tags', 'vision'],
    promptGuidelines: {
      useXMLTags: true,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Keep prompts concise and focused',
        'Use simple XML structure',
        'Avoid overly complex instructions'
      ]
    }
  },

  // OpenAI Models
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    category: AI_MODEL_CATEGORIES.OPENAI,
    description: 'OpenAI\'s most advanced multimodal model',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.JSON],
    maxTokens: 128000,
    contextWindow: 128000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'excellent',
      multimodal: true
    },
    pricing: { input: 2.50, output: 10.00 },
    features: ['function_calling', 'json_mode', 'vision', 'audio'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Use clear section headers and bullet points',
        'Leverage system/user message separation',
        'Be specific about output format requirements',
        'Use examples and few-shot learning'
      ]
    }
  },

  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    category: AI_MODEL_CATEGORIES.OPENAI,
    description: 'Efficient and cost-effective GPT-4 model',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 128000,
    contextWindow: 128000,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: true
    },
    pricing: { input: 0.15, output: 0.60 },
    features: ['function_calling', 'json_mode', 'vision'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Keep instructions clear and concise',
        'Use structured format with headers',
        'Avoid overly complex reasoning chains'
      ]
    }
  },

  // Google Models
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    category: AI_MODEL_CATEGORIES.GOOGLE,
    description: 'Google\'s most capable multimodal model',
    preferredFormat: PROMPT_FORMATS.MARKDOWN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED, PROMPT_FORMATS.JSON],
    maxTokens: 2000000,
    contextWindow: 2000000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'good',
      multimodal: true
    },
    pricing: { input: 1.25, output: 5.00 },
    features: ['function_calling', 'code_execution', 'vision', 'audio', 'video'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Use markdown formatting for structure',
        'Leverage large context window for examples',
        'Be explicit about reasoning steps',
        'Use clear headings and organization'
      ]
    }
  },

  // Mistral Models
  'mistral-large': {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    category: AI_MODEL_CATEGORIES.MISTRAL,
    description: 'Mistral\'s most capable model for complex tasks',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.JSON],
    maxTokens: 128000,
    contextWindow: 128000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 2.00, output: 6.00 },
    features: ['function_calling', 'json_mode'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Use clear instruction structure',
        'Provide context before the task',
        'Be explicit about expected output',
        'Use examples when beneficial'
      ]
    }
  },

  // Meta Models  
  'llama-3.1-405b': {
    id: 'llama-3.1-405b',
    name: 'Llama 3.1 405B',
    provider: 'Meta',
    category: AI_MODEL_CATEGORIES.META,
    description: 'Meta\'s largest open-source model',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.STRUCTURED],
    maxTokens: 128000,
    contextWindow: 128000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 1.00, output: 3.00 },
    features: ['function_calling'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Use natural language instructions',
        'Be direct and specific',
        'Avoid overly complex formatting',
        'Focus on clear task description'
      ]
    }
  }
}

// Helper functions for model management
export const getModelsByProvider = (provider) => {
  return Object.values(AI_MODELS).filter(model => model.provider === provider)
}

export const getModelsByCategory = (category) => {
  return Object.values(AI_MODELS).filter(model => model.category === category)
}

export const getModelById = (id) => {
  return AI_MODELS[id] || null
}

export const getAllProviders = () => {
  return [...new Set(Object.values(AI_MODELS).map(model => model.provider))]
}

export const getModelCapabilities = (modelId) => {
  const model = getModelById(modelId)
  return model ? model.capabilities : null
}

export const getOptimalFormat = (modelId) => {
  const model = getModelById(modelId)
  return model ? model.preferredFormat : PROMPT_FORMATS.PLAIN
}

export const getModelPricing = (modelId) => {
  const model = getModelById(modelId)
  return model ? model.pricing : null
}

export const estimateTokenCost = (modelId, inputTokens, outputTokens) => {
  const pricing = getModelPricing(modelId)
  if (!pricing) return null
  
  const inputCost = (inputTokens / 1000000) * pricing.input
  const outputCost = (outputTokens / 1000000) * pricing.output
  
  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost
  }
}

// Default model selection
export const DEFAULT_MODEL = 'claude-3-5-sonnet' 