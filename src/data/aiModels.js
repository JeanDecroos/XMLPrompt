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

// Enhanced Model Recommendation System
export const MODEL_RECOMMENDATIONS = {
  // Task-based recommendations with performance scores (1-10)
  TASK_RECOMMENDATIONS: {
    coding: {
      primary: 'claude-3-5-sonnet',
      alternatives: ['gpt-4o', 'llama-3.1-405b', 'gemini-1.5-pro'],
      reasoning: 'Excellent at code generation, debugging, and complex programming tasks'
    },
    reasoning: {
      primary: 'llama-3.1-405b',
      alternatives: ['claude-3-5-sonnet', 'gpt-4o', 'mistral-large'],
      reasoning: 'Superior performance on complex logical reasoning and mathematical problems'
    },
    writing: {
      primary: 'claude-3-5-sonnet',
      alternatives: ['gpt-4o', 'gemini-1.5-pro', 'command-r-plus'],
      reasoning: 'Excellent prose quality, creativity, and nuanced understanding'
    },
    analysis: {
      primary: 'gpt-4o',
      alternatives: ['claude-3-5-sonnet', 'gemini-1.5-pro', 'llama-3.1-405b'],
      reasoning: 'Strong analytical capabilities and structured thinking'
    },
    conversation: {
      primary: 'gpt-4o',
      alternatives: ['claude-3-5-sonnet', 'gemini-1.5-pro', 'command-r-plus'],
      reasoning: 'Natural conversational flow and contextual understanding'
    },
    'cost-effective': {
      primary: 'gpt-4o-mini',
      alternatives: ['gemini-1.5-flash', 'claude-3-haiku', 'mistral-7b-instruct'],
      reasoning: 'Best balance of performance and cost for most tasks'
    },
    speed: {
      primary: 'command-r-plus',
      alternatives: ['gemini-1.5-flash', 'claude-3-haiku', 'gpt-4o-mini'],
      reasoning: 'Fastest inference times while maintaining quality'
    },
    'long-context': {
      primary: 'gemini-1.5-pro',
      alternatives: ['claude-3-5-sonnet', 'llama-3.1-405b', 'command-r-plus'],
      reasoning: 'Excellent handling of long documents and extended conversations'
    }
  },

  // Performance tiers based on benchmark scores and real-world usage
  PERFORMANCE_TIERS: {
    flagship: {
      models: ['claude-3-5-sonnet', 'gpt-4o', 'gemini-1.5-pro', 'llama-3.1-405b'],
      description: 'Top-tier models for demanding tasks requiring highest quality',
      useCase: 'Complex reasoning, advanced coding, research, professional writing'
    },
    balanced: {
      models: ['gpt-4o-mini', 'gemini-1.5-flash', 'mistral-large', 'command-r-plus'],
      description: 'High-quality models with good performance-to-cost ratio',
      useCase: 'General tasks, business applications, content creation'
    },
    efficient: {
      models: ['claude-3-haiku', 'mistral-7b-instruct', 'llama-3-8b-instruct'],
      description: 'Fast and cost-effective for simpler tasks',
      useCase: 'Simple queries, chatbots, basic content generation'
    },
    specialized: {
      models: ['command-r', 'llama-3-70b-instruct'],
      description: 'Models optimized for specific use cases',
      useCase: 'RAG applications, domain-specific tasks'
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