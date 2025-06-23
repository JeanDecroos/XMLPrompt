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
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    category: AI_MODEL_CATEGORIES.GOOGLE,
    description: 'Google\'s fastest and most cost-effective multimodal model',
    preferredFormat: PROMPT_FORMATS.MARKDOWN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED, PROMPT_FORMATS.JSON],
    maxTokens: 1000000,
    contextWindow: 1000000,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: true
    },
    pricing: { input: 0.35, output: 1.05 },
    features: ['function_calling', 'vision', 'audio', 'video'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Focus on clear, concise instructions',
        'Optimized for speed and high-volume tasks',
        'Good for multi-modal input processing'
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
  'mistral-7b-instruct': {
    id: 'mistral-7b-instruct',
    name: 'Mistral 7B Instruct',
    provider: 'Mistral AI',
    category: AI_MODEL_CATEGORIES.MISTRAL,
    description: 'An efficient and powerful open-source model from Mistral AI, great for quick instruction following.',
    preferredFormat: PROMPT_FORMATS.MARKDOWN,
    alternativeFormats: [PROMPT_FORMATS.PLAIN],
    maxTokens: 32768,
    contextWindow: 32768,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.10, output: 0.30 },
    features: [],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Provide direct and concise instructions',
        'Suitable for simpler, straightforward tasks',
        'Avoid overly complex context'
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
  },
  'llama-3-8b-instruct': {
    id: 'llama-3-8b-instruct',
    name: 'Llama 3 8B Instruct',
    provider: 'Meta',
    category: AI_MODEL_CATEGORIES.META,
    description: 'Meta\'s efficient open-source model, tuned for instruction following.',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN],
    maxTokens: 8192,
    contextWindow: 8192,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.10, output: 0.30 },
    features: [],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Keep prompts concise and focused',
        'Suitable for quick, general-purpose tasks',
        'Prefer direct questions'
      ]
    }
  },
  'llama-3-70b-instruct': {
    id: 'llama-3-70b-instruct',
    name: 'Llama 3 70B Instruct',
    provider: 'Meta',
    category: AI_MODEL_CATEGORIES.META,
    description: 'Meta\'s larger open-source model, offering strong performance for complex tasks.',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.STRUCTURED],
    maxTokens: 8192,
    contextWindow: 8192,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'excellent',
      multimodal: false
    },
    pricing: { input: 0.50, output: 1.50 },
    features: [],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Provide detailed instructions for complex tasks',
        'Effective for in-depth analysis and content generation',
        'Leverage few-shot examples when possible'
      ]
    }
  },

  // Cohere Models
  'command-r-plus': {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    category: AI_MODEL_CATEGORIES.COHERE,
    description: 'Cohere\'s most powerful model, optimized for RAG and complex enterprise workloads.',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 128000,
    contextWindow: 128000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 3.00, output: 15.00 },
    features: ['RAG_optimized', 'tool_use'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Use clear instructions for RAG queries',
        'Provide relevant context for retrieval',
        'Clearly define tool usage for complex actions'
      ]
    }
  },
  'command-r': {
    id: 'command-r',
    name: 'Command R',
    provider: 'Cohere',
    category: AI_MODEL_CATEGORIES.COHERE,
    description: 'A scalable and efficient Cohere model, well-suited for RAG and general purpose tasks.',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 128000,
    contextWindow: 128000,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.50, output: 1.50 },
    features: ['RAG_optimized', 'tool_use'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Concise instructions for RAG tasks',
        'Focus on relevant information for retrieval',
        'Simpler tool use definitions'
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