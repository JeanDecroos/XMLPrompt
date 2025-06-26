// AI Model Registry - Defines capabilities, format preferences, and characteristics for each supported model

export const AI_MODEL_CATEGORIES = {
  CLAUDE: 'claude',
  OPENAI: 'openai', 
  GOOGLE: 'google',
  ANTHROPIC: 'anthropic',
  MISTRAL: 'mistral',
  META: 'meta',
  COHERE: 'cohere',
  AMAZON: 'amazon',
  DEEPSEEK: 'deepseek',
  QWEN: 'qwen',
  VELVET: 'velvet',
  BAIDU: 'baidu',
  BYTEDANCE: 'bytedance',
  TENCENT: 'tencent',
  FALCON: 'falcon',
  INTERNLM: 'internlm'
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
  },

  // === EXPANDED MODEL ECOSYSTEM ===

  // OpenAI Extended Models
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    category: AI_MODEL_CATEGORIES.OPENAI,
    description: 'Latest GPT-4 with improved efficiency and updated knowledge',
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
    pricing: { input: 1.00, output: 3.00 },
    features: ['function_calling', 'json_mode', 'vision', 'updated_knowledge'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Leverage updated knowledge cutoff',
        'Use structured prompts for complex tasks',
        'Combine text and vision capabilities'
      ]
    }
  },

  'dall-e-3': {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    category: AI_MODEL_CATEGORIES.OPENAI,
    description: 'Advanced image generation model with improved prompt adherence',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED],
    maxTokens: 4000,
    contextWindow: 4000,
    capabilities: {
      reasoning: 'limited',
      coding: 'none',
      analysis: 'limited',
      creative: 'excellent',
      multimodal: true
    },
    pricing: { input: 0.04, output: 0.08 }, // per image
    features: ['image_generation', 'prompt_enhancement'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Be specific about visual elements',
        'Include style and composition details',
        'Use descriptive language for better results'
      ]
    }
  },

  // Anthropic Extended Models
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    category: AI_MODEL_CATEGORIES.CLAUDE,
    description: 'Most powerful Claude model for complex reasoning and analysis',
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
    pricing: { input: 15.00, output: 75.00 },
    features: ['xml_tags', 'thinking_tags', 'vision', 'complex_reasoning'],
    promptGuidelines: {
      useXMLTags: true,
      preferStructured: true,
      supportsThinking: true,
      maxComplexity: 'very_high',
      bestPractices: [
        'Use for most complex reasoning tasks',
        'Leverage advanced thinking capabilities',
        'Ideal for research and analysis'
      ]
    }
  },

  // Google Extended Models
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    category: AI_MODEL_CATEGORIES.GOOGLE,
    description: 'Latest Gemini with enhanced multimodal capabilities and speed',
    preferredFormat: PROMPT_FORMATS.MARKDOWN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED, PROMPT_FORMATS.JSON],
    maxTokens: 1000000,
    contextWindow: 1000000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'good',
      multimodal: true
    },
    pricing: { input: 0.30, output: 1.20 },
    features: ['function_calling', 'code_execution', 'vision', 'audio', 'video', 'live_api'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Excellent for real-time applications',
        'Strong multimodal integration',
        'Fast inference with quality results'
      ]
    }
  },

  'gemma-2-27b': {
    id: 'gemma-2-27b',
    name: 'Gemma 2 27B',
    provider: 'Google',
    category: AI_MODEL_CATEGORIES.GOOGLE,
    description: 'Open-source model from Google with strong performance',
    preferredFormat: PROMPT_FORMATS.MARKDOWN,
    alternativeFormats: [PROMPT_FORMATS.PLAIN, PROMPT_FORMATS.STRUCTURED],
    maxTokens: 8192,
    contextWindow: 8192,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.27, output: 0.27 },
    features: ['open_source', 'efficient_inference'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Good for cost-effective deployment',
        'Strong general-purpose capabilities',
        'Open-source flexibility'
      ]
    }
  },

  // Meta Extended Models
  'llama-3.2-90b': {
    id: 'llama-3.2-90b',
    name: 'Llama 3.2 90B',
    provider: 'Meta',
    category: AI_MODEL_CATEGORIES.META,
    description: 'Latest Llama model with enhanced capabilities and efficiency',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.STRUCTURED],
    maxTokens: 128000,
    contextWindow: 128000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.90, output: 0.90 },
    features: ['open_source', 'multilingual', 'tool_use'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Excellent for reasoning tasks',
        'Strong multilingual support',
        'Cost-effective for large deployments'
      ]
    }
  },

  'llama-3.2-11b-vision': {
    id: 'llama-3.2-11b-vision',
    name: 'Llama 3.2 11B Vision',
    provider: 'Meta',
    category: AI_MODEL_CATEGORIES.META,
    description: 'Multimodal Llama model with vision capabilities',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN],
    maxTokens: 128000,
    contextWindow: 128000,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: true
    },
    pricing: { input: 0.35, output: 0.35 },
    features: ['open_source', 'vision', 'multilingual'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Combine text and image understanding',
        'Cost-effective vision model',
        'Good for multimodal applications'
      ]
    }
  },

  // Amazon Models
  'amazon-titan-text-v2': {
    id: 'amazon-titan-text-v2',
    name: 'Amazon Titan Text v2',
    provider: 'Amazon',
    category: AI_MODEL_CATEGORIES.AMAZON,
    description: 'Enterprise-focused model with strong safety and reliability',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.JSON],
    maxTokens: 32000,
    contextWindow: 32000,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.50, output: 1.50 },
    features: ['enterprise_safety', 'content_filtering', 'RAG_optimized'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Ideal for enterprise applications',
        'Strong content safety features',
        'Good for RAG implementations'
      ]
    }
  },

  // DeepSeek Models
  'deepseek-r1': {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    category: AI_MODEL_CATEGORIES.DEEPSEEK,
    description: 'Advanced reasoning model with strong mathematical capabilities',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 64000,
    contextWindow: 64000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.14, output: 0.28 },
    features: ['advanced_reasoning', 'mathematics', 'open_source'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: true,
      maxComplexity: 'high',
      bestPractices: [
        'Excellent for complex reasoning',
        'Strong mathematical problem solving',
        'Cost-effective reasoning model'
      ]
    }
  },

  'deepseek-v3': {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    category: AI_MODEL_CATEGORIES.DEEPSEEK,
    description: 'Latest general-purpose model with balanced capabilities',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 64000,
    contextWindow: 64000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.07, output: 0.28 },
    features: ['general_purpose', 'efficient', 'open_source'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Balanced performance across tasks',
        'Very cost-effective',
        'Good for general applications'
      ]
    }
  },

  // Mistral Extended Models
  'mistral-large-2': {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    category: AI_MODEL_CATEGORIES.MISTRAL,
    description: 'Latest flagship model from Mistral with enhanced capabilities',
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
    features: ['function_calling', 'json_mode', 'multilingual'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Strong European alternative',
        'Excellent multilingual support',
        'Good for complex reasoning'
      ]
    }
  },

  'mixtral-8x22b': {
    id: 'mixtral-8x22b',
    name: 'Mixtral 8x22B',
    provider: 'Mistral AI',
    category: AI_MODEL_CATEGORIES.MISTRAL,
    description: 'Mixture of experts model with excellent efficiency',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 64000,
    contextWindow: 64000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.90, output: 0.90 },
    features: ['mixture_of_experts', 'efficient', 'open_source'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Efficient for complex tasks',
        'Good cost-performance ratio',
        'Strong coding capabilities'
      ]
    }
  },

  // Qwen Models (Alibaba)
  'qwen-2.5-72b': {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    provider: 'Alibaba',
    category: AI_MODEL_CATEGORIES.QWEN,
    description: 'Advanced Chinese-English bilingual model with strong capabilities',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 32768,
    contextWindow: 32768,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.70, output: 0.70 },
    features: ['chinese_english', 'multilingual', 'open_source'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Excellent for Chinese-English tasks',
        'Strong reasoning in multiple languages',
        'Good for cross-cultural applications'
      ]
    }
  },

  'qwen-2.5-coder-32b': {
    id: 'qwen-2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Alibaba',
    category: AI_MODEL_CATEGORIES.QWEN,
    description: 'Specialized coding model with strong programming capabilities',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 32768,
    contextWindow: 32768,
    capabilities: {
      reasoning: 'good',
      coding: 'excellent',
      analysis: 'good',
      creative: 'limited',
      multimodal: false
    },
    pricing: { input: 0.50, output: 0.50 },
    features: ['code_specialized', 'multilingual_code', 'open_source'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'high',
      bestPractices: [
        'Specialized for coding tasks',
        'Strong in multiple programming languages',
        'Good for code generation and debugging'
      ]
    }
  },

  // Velvet AI Models (European)
  'velvet-14b': {
    id: 'velvet-14b',
    name: 'Velvet 14B',
    provider: 'Velvet AI',
    category: AI_MODEL_CATEGORIES.VELVET,
    description: 'European multilingual model with strong EU language support',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.PLAIN],
    maxTokens: 32768,
    contextWindow: 32768,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 0.40, output: 0.40 },
    features: ['eu_languages', 'gdpr_compliant', 'multilingual'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Excellent for European languages',
        'GDPR compliant processing',
        'Good for EU-specific applications'
      ]
    }
  },

  // Falcon Models
  'falcon-180b': {
    id: 'falcon-180b',
    name: 'Falcon 180B',
    provider: 'TII',
    category: AI_MODEL_CATEGORIES.FALCON,
    description: 'Large open-source model with strong general capabilities',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED, PROMPT_FORMATS.MARKDOWN],
    maxTokens: 2048,
    contextWindow: 2048,
    capabilities: {
      reasoning: 'good',
      coding: 'good',
      analysis: 'good',
      creative: 'good',
      multimodal: false
    },
    pricing: { input: 1.80, output: 1.80 },
    features: ['open_source', 'large_scale', 'multilingual'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Good for research applications',
        'Strong open-source alternative',
        'Suitable for fine-tuning'
      ]
    }
  },

  // === LATEST HIGH-IMPACT MODELS (2025) ===

  // Anthropic Claude 4 Series (Latest Flagship Models)
  'claude-4-opus': {
    id: 'claude-4-opus',
    name: 'Claude 4 Opus',
    provider: 'Anthropic',
    category: AI_MODEL_CATEGORIES.CLAUDE,
    description: 'Most powerful Claude model yet, world\'s best coding model with sustained performance',
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
    pricing: { input: 15.00, output: 75.00 },
    features: ['xml_tags', 'thinking_tags', 'artifacts', 'vision', 'extended_thinking', 'tool_use', 'memory_files'],
    promptGuidelines: {
      useXMLTags: true,
      preferStructured: true,
      supportsThinking: true,
      maxComplexity: 'very_high',
      bestPractices: [
        'Leading SWE-bench performance (72.5%)',
        'Sustained performance for hours-long tasks',
        'Excels at complex codebase understanding',
        'Can work continuously for several hours'
      ]
    }
  },

  'claude-4-sonnet': {
    id: 'claude-4-sonnet',
    name: 'Claude 4 Sonnet',
    provider: 'Anthropic',
    category: AI_MODEL_CATEGORIES.CLAUDE,
    description: 'Significant upgrade to Claude 3.7 Sonnet with superior coding and reasoning',
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
    pricing: { input: 3.00, output: 15.00 },
    features: ['xml_tags', 'thinking_tags', 'artifacts', 'vision', 'extended_thinking', 'tool_use', 'parallel_tools'],
    promptGuidelines: {
      useXMLTags: true,
      preferStructured: true,
      supportsThinking: true,
      maxComplexity: 'high',
      bestPractices: [
        'Superior coding and reasoning vs 3.7 Sonnet',
        'Enhanced steerability for precise control',
        'Excellent for agentic scenarios',
        'Powering GitHub Copilot coding agent'
      ]
    }
  },

  'claude-4-sonnet-thinking': {
    id: 'claude-4-sonnet-thinking',
    name: 'Claude 4 Sonnet (Thinking Mode)',
    provider: 'Anthropic',
    category: AI_MODEL_CATEGORIES.CLAUDE,
    description: 'Claude 4 Sonnet with extended thinking capabilities for complex reasoning',
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
    pricing: { input: 3.00, output: 15.00 },
    features: ['xml_tags', 'thinking_tags', 'extended_thinking', 'tool_use', 'vision', 'thinking_with_tools'],
    promptGuidelines: {
      useXMLTags: true,
      preferStructured: true,
      supportsThinking: true,
      maxComplexity: 'very_high',
      bestPractices: [
        'Extended thinking with tool use',
        'Can alternate between reasoning and tool use',
        'Visible thinking process to users',
        'Ideal for complex multi-step problems'
      ]
    }
  },

  // OpenAI O-Series (Latest Reasoning Models)
  'o3': {
    id: 'o3',
    name: 'OpenAI o3',
    provider: 'OpenAI',
    category: AI_MODEL_CATEGORIES.OPENAI,
    description: 'Advanced reasoning model with simulated reasoning capabilities',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.JSON],
    maxTokens: 200000,
    contextWindow: 200000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'good',
      multimodal: true
    },
    pricing: { input: 10.00, output: 40.00 },
    features: ['simulated_reasoning', 'visual_reasoning', 'tool_use', 'self_fact_checking'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: true,
      maxComplexity: 'very_high',
      bestPractices: [
        'Excels at complex reasoning tasks',
        'Strong performance on SWE-bench (69.1%)',
        'Advanced mathematical capabilities (88.9% AIME)',
        'Deliberative alignment for safety'
      ]
    }
  },

  'o4-mini': {
    id: 'o4-mini',
    name: 'OpenAI o4-mini',
    provider: 'OpenAI',
    category: AI_MODEL_CATEGORIES.OPENAI,
    description: 'Cost-efficient reasoning model with excellent math performance',
    preferredFormat: PROMPT_FORMATS.STRUCTURED,
    alternativeFormats: [PROMPT_FORMATS.MARKDOWN, PROMPT_FORMATS.JSON],
    maxTokens: 200000,
    contextWindow: 200000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'good',
      multimodal: true
    },
    pricing: { input: 1.10, output: 4.40 },
    features: ['simulated_reasoning', 'visual_reasoning', 'tool_use', 'high_reasoning_variant'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: true,
      supportsThinking: true,
      maxComplexity: 'high',
      bestPractices: [
        'Outstanding math performance (92.7% AIME 2025)',
        'Cost-effective reasoning model',
        'Strong coding capabilities (68.1% SWE-bench)',
        'Available in standard and high-reasoning variants'
      ]
    }
  },

  // Google Gemini 2.5 Series (Latest Thinking Models)
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    category: AI_MODEL_CATEGORIES.GOOGLE,
    description: 'Most intelligent AI model with thinking capabilities and massive context',
    preferredFormat: PROMPT_FORMATS.MARKDOWN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED, PROMPT_FORMATS.JSON],
    maxTokens: 2000000,
    contextWindow: 2000000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'excellent',
      multimodal: true
    },
    pricing: { input: 1.25, output: 10.00 },
    features: ['thinking_capabilities', 'massive_context', 'multimodal_native', 'web_access', 'thinking_budgets'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: true,
      maxComplexity: 'very_high',
      bestPractices: [
        'Leading performance on advanced reasoning benchmarks',
        'Tops LMArena leaderboard by significant margin',
        '18.8% on Humanity\'s Last Exam (no tools)',
        'Excellent for complex coding and web development'
      ]
    }
  },

  'gemini-2.5-pro-deep-think': {
    id: 'gemini-2.5-pro-deep-think',
    name: 'Gemini 2.5 Pro Deep Think',
    provider: 'Google',
    category: AI_MODEL_CATEGORIES.GOOGLE,
    description: 'Enhanced reasoning mode with parallel thinking techniques',
    preferredFormat: PROMPT_FORMATS.MARKDOWN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED, PROMPT_FORMATS.JSON],
    maxTokens: 2000000,
    contextWindow: 2000000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'excellent',
      creative: 'excellent',
      multimodal: true
    },
    pricing: { input: 2.50, output: 15.00 },
    features: ['parallel_thinking', 'enhanced_reasoning', 'multiple_hypotheses', 'frontier_safety'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: true,
      maxComplexity: 'very_high',
      bestPractices: [
        'Cutting-edge research in reasoning',
        'Considers multiple hypotheses before responding',
        'Impressive performance on hardest math benchmarks',
        'Currently available to trusted testers'
      ]
    }
  },

  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    category: AI_MODEL_CATEGORIES.GOOGLE,
    description: 'Efficient workhorse model with controllable reasoning and thinking budgets',
    preferredFormat: PROMPT_FORMATS.MARKDOWN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED, PROMPT_FORMATS.JSON],
    maxTokens: 1000000,
    contextWindow: 1000000,
    capabilities: {
      reasoning: 'excellent',
      coding: 'excellent',
      analysis: 'good',
      creative: 'good',
      multimodal: true
    },
    pricing: { input: 0.30, output: 2.50 },
    features: ['thinking_budgets', 'controllable_reasoning', 'moe_architecture', 'high_efficiency'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: true,
      maxComplexity: 'high',
      bestPractices: [
        'Adjustable thinking time based on query complexity',
        'Developers can control thinking budget',
        'Balance response quality, speed, and cost',
        'Ideal for high-volume applications'
      ]
    }
  },

  // Latest Specialized Models
  'gpt-image-1': {
    id: 'gpt-image-1',
    name: 'GPT Image 1',
    provider: 'OpenAI',
    category: AI_MODEL_CATEGORIES.OPENAI,
    description: 'Advanced image generation with precise prompt adherence and text rendering',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED],
    maxTokens: 4000,
    contextWindow: 4000,
    capabilities: {
      reasoning: 'limited',
      coding: 'none',
      analysis: 'limited',
      creative: 'excellent',
      multimodal: true
    },
    pricing: { input: 0.04, output: 0.08 },
    features: ['advanced_image_generation', 'text_rendering', 'conversational_editing', 'safe_generation'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Exceptional text rendering in images',
        'Conversational image editing capabilities',
        'Safe and responsible image generation',
        'Ideal for advertisements and social posts'
      ]
    }
  },

  'veo-3': {
    id: 'veo-3',
    name: 'Veo 3',
    provider: 'Google',
    category: AI_MODEL_CATEGORIES.GOOGLE,
    description: 'Advanced AI video generation with synchronized audio and cinematic quality',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED],
    maxTokens: 4000,
    contextWindow: 4000,
    capabilities: {
      reasoning: 'limited',
      coding: 'none',
      analysis: 'limited',
      creative: 'excellent',
      multimodal: true
    },
    pricing: { input: 0.10, output: 0.20 },
    features: ['video_generation', 'synchronized_audio', 'high_resolution', 'cinematic_control'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'High-resolution video with synchronized audio',
        'Precise camera control and cinematic elements',
        'Advanced understanding of physics and movement',
        'Ideal for professional content creation'
      ]
    }
  },

  'lyria-2': {
    id: 'lyria-2',
    name: 'Lyria 2',
    provider: 'Google',
    category: AI_MODEL_CATEGORIES.GOOGLE,
    description: 'AI model for high-quality instrumental music generation with precise controls',
    preferredFormat: PROMPT_FORMATS.PLAIN,
    alternativeFormats: [PROMPT_FORMATS.STRUCTURED],
    maxTokens: 2000,
    contextWindow: 2000,
    capabilities: {
      reasoning: 'limited',
      coding: 'none',
      analysis: 'limited',
      creative: 'excellent',
      multimodal: true
    },
    pricing: { input: 0.05, output: 0.10 },
    features: ['music_generation', 'instrumental_focus', 'precise_controls', 'high_quality_audio'],
    promptGuidelines: {
      useXMLTags: false,
      preferStructured: false,
      supportsThinking: false,
      maxComplexity: 'medium',
      bestPractices: [
        'Creates high-quality instrumental music',
        'Precise controls for creators',
        'Professional audio quality',
        'Ideal for content creators and musicians'
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

// Enhanced Model Recommendation System
export const MODEL_RECOMMENDATIONS = {
  // Task-based recommendations with performance scores (1-10)
  TASK_RECOMMENDATIONS: {
    coding: {
      primary: 'claude-4-opus',
      alternatives: ['claude-4-sonnet', 'gemini-2.5-pro', 'o3', 'claude-3-5-sonnet', 'o4-mini'],
      reasoning: 'Claude 4 Opus leads SWE-bench with sustained performance for hours-long coding tasks'
    },
    reasoning: {
      primary: 'gemini-2.5-pro-deep-think',
      alternatives: ['o3', 'claude-4-opus', 'gemini-2.5-pro', 'claude-4-sonnet-thinking', 'o4-mini'],
      reasoning: 'Gemini 2.5 Pro Deep Think uses cutting-edge parallel thinking techniques for complex reasoning'
    },
    writing: {
      primary: 'claude-4-sonnet',
      alternatives: ['claude-4-opus', 'gemini-2.5-pro', 'claude-3-5-sonnet', 'gpt-4o'],
      reasoning: 'Claude 4 Sonnet offers superior writing quality with enhanced steerability and precise control'
    },
    analysis: {
      primary: 'gemini-2.5-pro',
      alternatives: ['claude-4-opus', 'o3', 'claude-4-sonnet', 'gemini-2.5-pro-deep-think'],
      reasoning: 'Gemini 2.5 Pro excels with massive 2M token context for analyzing vast datasets and documents'
    },
    multimodal: {
      primary: 'gemini-2.5-pro',
      alternatives: ['claude-4-opus', 'claude-4-sonnet', 'gpt-4o', 'o3'],
      reasoning: 'Gemini 2.5 Pro built natively multimodal from ground up with superior vision and audio capabilities'
    },
    'cost-effective': {
      primary: 'o4-mini',
      alternatives: ['gemini-2.5-flash', 'claude-3-haiku', 'gpt-4o-mini', 'claude-4-sonnet'],
      reasoning: 'o4-mini delivers exceptional reasoning and math performance at cost-effective pricing'
    },
    'image-generation': {
      primary: 'gpt-image-1',
      alternatives: ['dall-e-3', 'midjourney-v6'],
      reasoning: 'GPT Image 1 offers exceptional text rendering and conversational editing capabilities'
    },
    'video-generation': {
      primary: 'veo-3',
      alternatives: ['sora', 'runway-gen3'],
      reasoning: 'Veo 3 provides high-resolution video with synchronized audio and cinematic control'
    },
    'music-generation': {
      primary: 'lyria-2',
      alternatives: ['suno-v3', 'udio-v2'],
      reasoning: 'Lyria 2 creates high-quality instrumental music with precise controls for creators'
    },
    'thinking-tasks': {
      primary: 'claude-4-sonnet-thinking',
      alternatives: ['gemini-2.5-pro-deep-think', 'o3', 'claude-4-opus', 'gemini-2.5-flash'],
      reasoning: 'Claude 4 Sonnet Thinking Mode provides visible thinking process with tool use capabilities'
    },
    enterprise: {
      primary: 'claude-4-opus',
      alternatives: ['gemini-2.5-pro', 'claude-4-sonnet', 'o3', 'gpt-4o'],
      reasoning: 'Claude 4 Opus offers sustained performance for complex enterprise workflows with excellent reliability'
    },
    research: {
      primary: 'gemini-2.5-pro',
      alternatives: ['claude-4-opus', 'gemini-2.5-pro-deep-think', 'o3', 'claude-4-sonnet-thinking'],
      reasoning: 'Gemini 2.5 Pro leads on advanced benchmarks like Humanity\'s Last Exam and GPQA Diamond'
    }
  },

  // Performance tiers based on benchmark scores and real-world usage
  PERFORMANCE_TIERS: {
    flagship: {
      models: ['claude-3-opus', 'claude-3-5-sonnet', 'gpt-4o', 'deepseek-r1', 'gemini-2.0-flash', 'llama-3.2-90b'],
      description: 'Top-tier models for demanding tasks requiring highest quality',
      useCase: 'Complex reasoning, advanced coding, research, professional writing'
    },
    balanced: {
      models: ['gpt-4-turbo', 'mistral-large-2', 'gemini-1.5-pro', 'qwen-2.5-72b', 'mixtral-8x22b', 'command-r-plus'],
      description: 'High-quality models with good performance-to-cost ratio',
      useCase: 'General tasks, business applications, content creation'
    },
    efficient: {
      models: ['deepseek-v3', 'gpt-4o-mini', 'gemini-1.5-flash', 'claude-3-haiku', 'gemma-2-27b', 'velvet-14b'],
      description: 'Fast and cost-effective for simpler tasks',
      useCase: 'Simple queries, chatbots, basic content generation'
    },
    specialized: {
      models: ['qwen-2.5-coder-32b', 'dall-e-3', 'amazon-titan-text-v2', 'llama-3.2-11b-vision', 'falcon-180b'],
      description: 'Models optimized for specific use cases',
      useCase: 'Domain-specific tasks, specialized applications'
    }
  },

  // Model strengths and weaknesses
  MODEL_PROFILES: {
    'claude-3-5-sonnet': {
      strengths: ['Coding', 'Reasoning', 'Writing', 'Analysis'],
      weaknesses: ['Cost', 'Speed'],
      bestFor: 'Complex technical tasks requiring high accuracy',
      score: 9.5
    },
    'gpt-4o': {
      strengths: ['Versatility', 'Conversation', 'Analysis', 'Multimodal'],
      weaknesses: ['Cost', 'Reasoning complexity'],
      bestFor: 'General-purpose applications with multimodal needs',
      score: 9.2
    },
    'gemini-1.5-pro': {
      strengths: ['Long context', 'Multimodal', 'Speed', 'Analysis'],
      weaknesses: ['Reasoning', 'Code generation'],
      bestFor: 'Document analysis and multimodal tasks',
      score: 8.8
    },
    'llama-3.1-405b': {
      strengths: ['Reasoning', 'Math', 'Open source', 'Coding'],
      weaknesses: ['Speed', 'Cost', 'Conversation'],
      bestFor: 'Complex reasoning and mathematical problems',
      score: 9.0
    },
    'gpt-4o-mini': {
      strengths: ['Cost-effective', 'Speed', 'Versatility'],
      weaknesses: ['Complex reasoning', 'Advanced coding'],
      bestFor: 'General tasks requiring good performance at low cost',
      score: 8.2
    },
    'mistral-large': {
      strengths: ['Reasoning', 'Cost-effective', 'Multilingual'],
      weaknesses: ['Conversation', 'Creative writing'],
      bestFor: 'Analytical tasks and multilingual applications',
      score: 8.0
    },
    'command-r-plus': {
      strengths: ['Speed', 'RAG', 'Cost-effective', 'Long context'],
      weaknesses: ['Complex reasoning', 'Creative tasks'],
      bestFor: 'RAG applications and fast inference needs',
      score: 7.8
    },
    'gemini-1.5-flash': {
      strengths: ['Speed', 'Cost-effective', 'Multimodal'],
      weaknesses: ['Complex reasoning', 'Advanced coding'],
      bestFor: 'Fast multimodal applications',
      score: 7.5
    },
    'claude-3-haiku': {
      strengths: ['Speed', 'Cost-effective', 'Conversation'],
      weaknesses: ['Complex reasoning', 'Advanced analysis'],
      bestFor: 'Simple conversational applications',
      score: 7.2
    },
    'mistral-7b-instruct': {
      strengths: ['Cost-effective', 'Open source', 'Efficiency'],
      weaknesses: ['Complex tasks', 'Reasoning', 'Context length'],
      bestFor: 'Simple tasks requiring minimal resources',
      score: 6.8
    },
    'claude-3-opus': {
      strengths: ['Complex reasoning', 'Deep analysis', 'Research', 'Multimodal'],
      weaknesses: ['Very high cost', 'Speed'],
      bestFor: 'Most complex analytical and reasoning tasks',
      score: 9.8
    },
    'gpt-4-turbo': {
      strengths: ['Updated knowledge', 'Efficiency', 'Multimodal', 'Balance'],
      weaknesses: ['Cost', 'Complex reasoning vs Opus'],
      bestFor: 'General high-performance applications with recent knowledge',
      score: 9.0
    },
    'gemini-2.0-flash': {
      strengths: ['Speed', 'Multimodal', 'Real-time', 'Cost-effective'],
      weaknesses: ['Complex reasoning', 'Depth vs slower models'],
      bestFor: 'Fast multimodal applications and real-time use cases',
      score: 8.5
    },
    'deepseek-r1': {
      strengths: ['Advanced reasoning', 'Mathematics', 'Cost-effective', 'Open source'],
      weaknesses: ['Limited multimodal', 'Conversation'],
      bestFor: 'Complex reasoning and mathematical problem solving',
      score: 9.3
    },
    'deepseek-v3': {
      strengths: ['Very cost-effective', 'General purpose', 'Efficient', 'Open source'],
      weaknesses: ['Specialized tasks', 'Multimodal'],
      bestFor: 'Cost-conscious general applications',
      score: 8.0
    },
    'mistral-large-2': {
      strengths: ['European', 'Multilingual', 'Privacy', 'Reasoning'],
      weaknesses: ['Cost', 'Ecosystem vs OpenAI'],
      bestFor: 'European applications requiring data sovereignty',
      score: 8.7
    },
    'mixtral-8x22b': {
      strengths: ['Mixture of experts', 'Efficiency', 'Open source', 'Coding'],
      weaknesses: ['Complexity', 'Deployment'],
      bestFor: 'Efficient large-scale deployments',
      score: 8.4
    },
    'qwen-2.5-72b': {
      strengths: ['Chinese-English', 'Multilingual', 'Open source', 'Cultural context'],
      weaknesses: ['Western cultural nuances', 'Specialized domains'],
      bestFor: 'Chinese-English and Asian market applications',
      score: 8.6
    },
    'qwen-2.5-coder-32b': {
      strengths: ['Code specialization', 'Multilingual code', 'Cost-effective', 'Open source'],
      weaknesses: ['General tasks', 'Conversation'],
      bestFor: 'Specialized coding and development tasks',
      score: 8.3
    },
    'llama-3.2-90b': {
      strengths: ['Latest Meta', 'Open source', 'Reasoning', 'Multilingual'],
      weaknesses: ['Deployment complexity', 'Speed'],
      bestFor: 'Open-source deployments requiring strong reasoning',
      score: 8.9
    },
    'llama-3.2-11b-vision': {
      strengths: ['Multimodal', 'Cost-effective', 'Open source', 'Vision'],
      weaknesses: ['Performance vs larger models', 'Complex reasoning'],
      bestFor: 'Cost-effective multimodal applications',
      score: 7.8
    },
    'amazon-titan-text-v2': {
      strengths: ['Enterprise security', 'AWS integration', 'Compliance', 'Reliability'],
      weaknesses: ['Performance vs flagship models', 'Cost'],
      bestFor: 'Enterprise applications requiring high security',
      score: 7.5
    },
    'velvet-14b': {
      strengths: ['European languages', 'GDPR compliance', 'Regional focus', 'Privacy'],
      weaknesses: ['Performance vs global models', 'Limited scale'],
      bestFor: 'European applications with strict privacy requirements',
      score: 7.2
    },
    'gemma-2-27b': {
      strengths: ['Google backing', 'Open source', 'Efficient', 'Research friendly'],
      weaknesses: ['Performance vs larger models', 'Limited features'],
      bestFor: 'Research and cost-effective Google ecosystem integration',
      score: 7.6
    },
    'dall-e-3': {
      strengths: ['Image generation', 'Prompt adherence', 'Creative', 'Quality'],
      weaknesses: ['Text-only tasks', 'Cost per image'],
      bestFor: 'High-quality image generation and creative visual content',
      score: 9.1
    },
    'falcon-180b': {
      strengths: ['Large scale', 'Open source', 'Research', 'Multilingual'],
      weaknesses: ['Deployment complexity', 'Speed', 'Context length'],
      bestFor: 'Research applications and large-scale open-source deployments',
      score: 7.4
    },
    'claude-4-opus': {
      strengths: ['World-class coding', 'Sustained performance', 'Complex reasoning', 'Hours-long tasks'],
      weaknesses: ['Very high cost', 'Slower responses'],
      bestFor: 'Most complex coding projects and enterprise workflows requiring sustained performance',
      score: 9.9
    },
    'claude-4-sonnet': {
      strengths: ['Superior coding', 'Enhanced steerability', 'Precise control', 'Agentic scenarios'],
      weaknesses: ['Higher cost than 3.5 Sonnet', 'Speed vs Deep Think'],
      bestFor: 'Professional coding, writing, and business applications requiring precision',
      score: 9.6
    },
    'claude-4-sonnet-thinking': {
      strengths: ['Visible thinking', 'Tool use reasoning', 'Complex problem solving', 'Transparency'],
      weaknesses: ['Higher latency', 'Cost for thinking time'],
      bestFor: 'Complex multi-step problems where understanding the reasoning process is crucial',
      score: 9.5
    },
    'o3': {
      strengths: ['Advanced reasoning', 'Strong coding', 'Mathematical excellence', 'Safety alignment'],
      weaknesses: ['High cost', 'Slower than standard models'],
      bestFor: 'Complex reasoning tasks, advanced mathematics, and sophisticated coding challenges',
      score: 9.4
    },
    'o4-mini': {
      strengths: ['Exceptional math', 'Cost-effective reasoning', 'Strong coding', 'Efficient'],
      weaknesses: ['Limited context vs Pro models', 'Less creative than larger models'],
      bestFor: 'Mathematical problem solving and coding tasks with budget constraints',
      score: 9.2
    },
    'gemini-2.5-pro': {
      strengths: ['Massive 2M context', 'Native multimodality', 'LMArena leader', 'Advanced benchmarks'],
      weaknesses: ['Newer model', 'Limited availability'],
      bestFor: 'Complex analysis of vast datasets, research, and advanced multimodal tasks',
      score: 9.7
    },
    'gemini-2.5-pro-deep-think': {
      strengths: ['Parallel thinking', 'Multiple hypotheses', 'Cutting-edge reasoning', 'Frontier research'],
      weaknesses: ['Limited availability', 'Experimental status', 'Higher cost'],
      bestFor: 'Most complex reasoning challenges requiring frontier AI capabilities',
      score: 9.8
    },
    'gemini-2.5-flash': {
      strengths: ['Thinking budgets', 'Controllable reasoning', 'High efficiency', 'Cost-performance'],
      weaknesses: ['Less capable than Pro', 'Newer architecture'],
      bestFor: 'High-volume applications requiring balanced performance and cost optimization',
      score: 9.0
    },
    'gpt-image-1': {
      strengths: ['Text rendering', 'Conversational editing', 'Safe generation', 'Precise prompts'],
      weaknesses: ['Image-only', 'Limited reasoning', 'Specialized use'],
      bestFor: 'Professional image generation requiring text rendering and iterative editing',
      score: 8.8
    },
    'veo-3': {
      strengths: ['Synchronized audio', 'High resolution', 'Cinematic control', 'Physics understanding'],
      weaknesses: ['Video-only', 'High computational cost', 'Limited availability'],
      bestFor: 'Professional video content creation requiring cinematic quality and audio sync',
      score: 8.9
    },
    'lyria-2': {
      strengths: ['High-quality audio', 'Instrumental focus', 'Precise controls', 'Professional output'],
      weaknesses: ['Music-only', 'Limited to instrumental', 'Specialized use'],
      bestFor: 'Professional music creation and content requiring high-quality instrumental tracks',
      score: 8.7
    }
  }
};

// Smart recommendation function
export function getModelRecommendation(criteria = {}) {
  const {
    task = 'general',
    priority = 'balanced', // 'quality', 'speed', 'cost', 'balanced'
    complexity = 'medium', // 'simple', 'medium', 'complex'
    budget = 'medium' // 'low', 'medium', 'high'
  } = criteria;

  // Task-based recommendations
  if (MODEL_RECOMMENDATIONS.TASK_RECOMMENDATIONS[task]) {
    const taskRec = MODEL_RECOMMENDATIONS.TASK_RECOMMENDATIONS[task];
    
    // Adjust based on priority and budget
    if (priority === 'cost' || budget === 'low') {
      return {
        recommended: taskRec.alternatives[taskRec.alternatives.length - 1],
        alternatives: taskRec.alternatives.slice(0, -1),
        reasoning: `Cost-optimized choice for ${task}: ${taskRec.reasoning}`
      };
    }
    
    if (priority === 'speed') {
      const speedModels = ['command-r-plus', 'gemini-1.5-flash', 'claude-3-haiku'];
      const speedChoice = speedModels.find(model => 
        [taskRec.primary, ...taskRec.alternatives].includes(model)
      ) || taskRec.alternatives[1];
      
      return {
        recommended: speedChoice,
        alternatives: [taskRec.primary, ...taskRec.alternatives.filter(m => m !== speedChoice)],
        reasoning: `Speed-optimized choice for ${task}`
      };
    }
    
    return {
      recommended: taskRec.primary,
      alternatives: taskRec.alternatives,
      reasoning: taskRec.reasoning
    };
  }

  // Fallback to tier-based recommendations
  const tier = complexity === 'complex' ? 'flagship' : 
               complexity === 'simple' ? 'efficient' : 'balanced';
  
  const tierModels = MODEL_RECOMMENDATIONS.PERFORMANCE_TIERS[tier];
  
  return {
    recommended: tierModels.models[0],
    alternatives: tierModels.models.slice(1),
    reasoning: tierModels.description
  };
}

// Get model comparison
export function compareModels(modelIds) {
  return modelIds.map(id => {
    const model = AI_MODELS[id];
    const profile = MODEL_RECOMMENDATIONS.MODEL_PROFILES[id];
    
    return {
      id,
      name: model?.name || id,
      score: profile?.score || 0,
      strengths: profile?.strengths || [],
      weaknesses: profile?.weaknesses || [],
      bestFor: profile?.bestFor || 'General use',
      pricing: model?.pricing || 'Unknown'
    };
  }).sort((a, b) => b.score - a.score);
}

// Get best model for specific requirements
export function getBestModelFor(requirements) {
  const {
    maxCost = Infinity,
    minSpeed = 0,
    requiredCapabilities = [],
    excludeModels = []
  } = requirements;

  const availableModels = Object.entries(MODEL_RECOMMENDATIONS.MODEL_PROFILES)
    .filter(([id]) => !excludeModels.includes(id))
    .map(([id, profile]) => ({
      id,
      ...profile,
      model: AI_MODELS[id]
    }))
    .filter(model => {
      // Filter by cost if specified
      if (maxCost < Infinity && model.model?.pricing?.inputCost > maxCost) {
        return false;
      }
      
      // Filter by required capabilities
      if (requiredCapabilities.length > 0) {
        return requiredCapabilities.some(cap => 
          model.strengths.some(strength => 
            strength.toLowerCase().includes(cap.toLowerCase())
          )
        );
      }
      
      return true;
    })
    .sort((a, b) => b.score - a.score);

  return availableModels.length > 0 ? availableModels[0] : null;
} 