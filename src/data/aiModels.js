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
      primary: 'claude-3-5-sonnet',
      alternatives: ['deepseek-r1', 'qwen-2.5-coder-32b', 'gpt-4o', 'llama-3.2-90b', 'mixtral-8x22b'],
      reasoning: 'Excellent at code generation, debugging, and complex programming tasks'
    },
    reasoning: {
      primary: 'deepseek-r1',
      alternatives: ['claude-3-opus', 'llama-3.1-405b', 'claude-3-5-sonnet', 'mistral-large-2'],
      reasoning: 'Superior performance on complex logical reasoning and mathematical problems'
    },
    writing: {
      primary: 'claude-3-5-sonnet',
      alternatives: ['claude-3-opus', 'gpt-4o', 'gemini-1.5-pro', 'mistral-large-2'],
      reasoning: 'Excellent prose quality, creativity, and nuanced understanding'
    },
    analysis: {
      primary: 'claude-3-opus',
      alternatives: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.0-flash', 'llama-3.2-90b'],
      reasoning: 'Strong analytical capabilities and structured thinking'
    },
    conversation: {
      primary: 'gpt-4o',
      alternatives: ['claude-3-5-sonnet', 'gemini-2.0-flash', 'command-r-plus', 'mistral-large-2'],
      reasoning: 'Natural conversational flow and contextual understanding'
    },
    'cost-effective': {
      primary: 'deepseek-v3',
      alternatives: ['gpt-4o-mini', 'gemini-1.5-flash', 'claude-3-haiku', 'qwen-2.5-72b'],
      reasoning: 'Best balance of performance and cost for most tasks'
    },
    speed: {
      primary: 'gemini-2.0-flash',
      alternatives: ['command-r-plus', 'gemini-1.5-flash', 'claude-3-haiku', 'deepseek-v3'],
      reasoning: 'Fastest inference times while maintaining quality'
    },
    'long-context': {
      primary: 'gemini-1.5-pro',
      alternatives: ['claude-3-5-sonnet', 'claude-3-opus', 'llama-3.2-90b', 'command-r-plus'],
      reasoning: 'Excellent handling of long documents and extended conversations'
    },
    multimodal: {
      primary: 'gpt-4o',
      alternatives: ['gemini-2.0-flash', 'claude-3-opus', 'llama-3.2-11b-vision', 'dall-e-3'],
      reasoning: 'Superior multimodal capabilities combining text, vision, and audio'
    },
    multilingual: {
      primary: 'qwen-2.5-72b',
      alternatives: ['velvet-14b', 'mistral-large-2', 'gemini-2.0-flash', 'llama-3.2-90b'],
      reasoning: 'Strong performance across multiple languages and cultural contexts'
    },
    'open-source': {
      primary: 'llama-3.2-90b',
      alternatives: ['deepseek-r1', 'mixtral-8x22b', 'qwen-2.5-72b', 'gemma-2-27b'],
      reasoning: 'Best open-source models for deployment flexibility and customization'
    },
    enterprise: {
      primary: 'amazon-titan-text-v2',
      alternatives: ['mistral-large-2', 'claude-3-5-sonnet', 'command-r-plus', 'velvet-14b'],
      reasoning: 'Enterprise-grade security, compliance, and reliability features'
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