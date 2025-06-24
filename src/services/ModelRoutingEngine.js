/**
 * Semantic Model Routing Engine
 * 
 * Intelligently routes user requests to optimal AI models based on:
 * - Role context and domain expertise requirements
 * - Task semantic analysis and capability matching
 * - Model performance profiles and constraints
 * - Confidence scoring and fallback mechanisms
 */

import { AI_MODELS, MODEL_RECOMMENDATIONS } from '../data/aiModels.js';

// Semantic capability vectors for each model (normalized 0-1)
const MODEL_CAPABILITY_VECTORS = {
  // Claude 4 Series - Flagship coding and reasoning
  'claude-4-opus': {
    reasoning: 1.0, coding: 1.0, analysis: 1.0, creative: 0.9, 
    multimodal: 0.8, speed: 0.3, cost: 0.1, context: 0.9,
    sustained_work: 1.0, complex_tasks: 1.0
  },
  'claude-4-sonnet': {
    reasoning: 0.95, coding: 0.95, analysis: 0.9, creative: 0.9,
    multimodal: 0.8, speed: 0.6, cost: 0.4, context: 0.9,
    steerability: 1.0, precision: 1.0
  },
  'claude-4-sonnet-thinking': {
    reasoning: 0.98, coding: 0.9, analysis: 0.95, creative: 0.8,
    multimodal: 0.7, speed: 0.4, cost: 0.4, context: 0.9,
    transparency: 1.0, step_by_step: 1.0
  },

  // OpenAI O-Series - Advanced reasoning
  'o3': {
    reasoning: 0.95, coding: 0.9, analysis: 0.9, creative: 0.7,
    multimodal: 0.8, speed: 0.3, cost: 0.2, context: 0.8,
    mathematics: 1.0, safety: 0.95
  },
  'o4-mini': {
    reasoning: 0.9, coding: 0.85, analysis: 0.8, creative: 0.7,
    multimodal: 0.8, speed: 0.7, cost: 0.8, context: 0.8,
    mathematics: 0.95, efficiency: 0.9
  },

  // Gemini 2.5 Series - Multimodal and context leaders
  'gemini-2.5-pro': {
    reasoning: 0.9, coding: 0.85, analysis: 0.95, creative: 0.8,
    multimodal: 1.0, speed: 0.7, cost: 0.6, context: 1.0,
    research: 1.0, benchmarks: 1.0
  },
  'gemini-2.5-pro-deep-think': {
    reasoning: 1.0, coding: 0.8, analysis: 0.95, creative: 0.8,
    multimodal: 0.9, speed: 0.2, cost: 0.3, context: 1.0,
    parallel_thinking: 1.0, frontier_research: 1.0
  },
  'gemini-2.5-flash': {
    reasoning: 0.85, coding: 0.8, analysis: 0.7, creative: 0.7,
    multimodal: 0.9, speed: 0.9, cost: 0.8, context: 0.8,
    efficiency: 1.0, high_volume: 1.0
  },

  // Specialized Creative Models
  'dall-e-3': {
    reasoning: 0.2, coding: 0.0, analysis: 0.2, creative: 1.0,
    multimodal: 1.0, speed: 0.8, cost: 0.8, context: 0.3,
    image_generation: 1.0, text_in_images: 1.0
  },
  'gpt-image-1': {
    reasoning: 0.2, coding: 0.0, analysis: 0.2, creative: 1.0,
    multimodal: 1.0, speed: 0.8, cost: 0.9, context: 0.3,
    image_generation: 1.0, text_in_images: 1.0, conversational_editing: 1.0
  },
  'veo-3': {
    reasoning: 0.2, coding: 0.0, analysis: 0.2, creative: 1.0,
    multimodal: 1.0, speed: 0.4, cost: 0.7, context: 0.3,
    video_generation: 1.0, cinematic: 1.0, synchronized_audio: 1.0
  },
  'lyria-2': {
    reasoning: 0.1, coding: 0.0, analysis: 0.1, creative: 1.0,
    multimodal: 0.8, speed: 0.8, cost: 0.9, context: 0.2,
    music_generation: 1.0, audio_quality: 1.0, instrumental: 1.0
  },

  // Legacy but solid performers
  'claude-3-5-sonnet': {
    reasoning: 0.9, coding: 0.9, analysis: 0.85, creative: 0.85,
    multimodal: 0.7, speed: 0.6, cost: 0.4, context: 0.8,
    xml_processing: 1.0, structured_output: 0.9
  },
  'gpt-4o': {
    reasoning: 0.85, coding: 0.8, analysis: 0.8, creative: 0.85,
    multimodal: 0.9, speed: 0.7, cost: 0.3, context: 0.7,
    versatility: 1.0, conversation: 0.9
  },
  'gemini-1.5-pro': {
    reasoning: 0.8, coding: 0.75, analysis: 0.85, creative: 0.7,
    multimodal: 0.85, speed: 0.8, cost: 0.7, context: 0.95,
    long_context: 1.0, document_analysis: 0.9
  }
};

// Role-based capability requirements (what each role typically needs)
const ROLE_CAPABILITY_PROFILES = {
  'Software Developer': {
    coding: 1.0, reasoning: 0.9, analysis: 0.8, creative: 0.3,
    speed: 0.7, cost: 0.6, sustained_work: 0.8
  },
  'Data Scientist': {
    reasoning: 0.9, analysis: 1.0, coding: 0.8, creative: 0.4,
    mathematics: 0.9, context: 0.8, research: 0.8
  },
  'Product Manager': {
    analysis: 0.8, creative: 0.7, reasoning: 0.7, coding: 0.2,
    speed: 0.8, cost: 0.7, versatility: 0.9
  },
  'Designer': {
    creative: 1.0, multimodal: 0.9, analysis: 0.6, reasoning: 0.5,
    image_generation: 0.8, speed: 0.7, cost: 0.6
  },
  'Content Creator': {
    creative: 1.0, multimodal: 0.8, analysis: 0.6, reasoning: 0.5,
    speed: 0.8, cost: 0.7, versatility: 0.8
  },
  'Researcher': {
    reasoning: 1.0, analysis: 1.0, creative: 0.6, coding: 0.5,
    context: 1.0, research: 1.0, benchmarks: 0.8
  },
  'Business Analyst': {
    analysis: 1.0, reasoning: 0.8, creative: 0.6, coding: 0.3,
    context: 0.8, speed: 0.7, cost: 0.8
  },
  'Marketing Manager': {
    creative: 0.9, analysis: 0.7, reasoning: 0.6, coding: 0.1,
    speed: 0.8, cost: 0.7, versatility: 0.8
  },
  'Technical Writer': {
    creative: 0.8, analysis: 0.7, reasoning: 0.7, coding: 0.4,
    context: 0.8, structured_output: 0.9, precision: 0.8
  }
};

// Task pattern semantic vectors (common task types and their capability needs)
const TASK_SEMANTIC_PATTERNS = {
  // Code-related tasks
  code_generation: { coding: 1.0, reasoning: 0.8, creative: 0.3 },
  code_review: { coding: 0.9, analysis: 1.0, reasoning: 0.8 },
  debugging: { coding: 1.0, analysis: 0.9, reasoning: 0.9, step_by_step: 0.8 },
  refactoring: { coding: 1.0, analysis: 0.8, reasoning: 0.7 },
  
  // Analysis tasks
  data_analysis: { analysis: 1.0, reasoning: 0.8, mathematics: 0.7 },
  document_analysis: { analysis: 1.0, context: 0.9, reasoning: 0.7 },
  research: { analysis: 0.9, reasoning: 0.9, research: 1.0, context: 0.8 },
  
  // Creative tasks
  content_creation: { creative: 1.0, analysis: 0.5, reasoning: 0.5 },
  image_generation: { creative: 1.0, image_generation: 1.0, multimodal: 1.0 },
  video_creation: { creative: 1.0, video_generation: 1.0, multimodal: 1.0, cinematic: 0.9, synchronized_audio: 0.8 },
  music_creation: { creative: 1.0, music_generation: 1.0, audio_quality: 1.0, instrumental: 0.8 },
  
  // Reasoning tasks
  problem_solving: { reasoning: 1.0, analysis: 0.8, step_by_step: 0.7 },
  strategic_planning: { reasoning: 0.9, analysis: 0.9, creative: 0.6 },
  decision_making: { reasoning: 0.9, analysis: 0.8, transparency: 0.7 },
  
  // Communication tasks
  writing: { creative: 0.8, reasoning: 0.6, precision: 0.7 },
  summarization: { analysis: 0.9, reasoning: 0.6, context: 0.8 },
  translation: { reasoning: 0.6, creative: 0.5, versatility: 0.8 },
  
  // Multimodal tasks
  image_analysis: { multimodal: 1.0, analysis: 0.8, reasoning: 0.6 },
  document_processing: { multimodal: 0.7, analysis: 1.0, context: 0.9 },
  
  // Performance-sensitive tasks
  real_time: { speed: 1.0, efficiency: 1.0, cost: 0.8 },
  batch_processing: { efficiency: 1.0, cost: 0.9, high_volume: 1.0 },
  
  // Complex tasks
  multi_step: { reasoning: 0.9, step_by_step: 1.0, sustained_work: 0.8 },
  long_form: { context: 1.0, sustained_work: 0.9, reasoning: 0.7 }
};

class SemanticModelRouter {
  constructor() {
    this.models = AI_MODELS;
    this.capabilities = MODEL_CAPABILITY_VECTORS;
    this.roleProfiles = ROLE_CAPABILITY_PROFILES;
    this.taskPatterns = TASK_SEMANTIC_PATTERNS;
    this.usageHistory = new Map(); // For learning from user preferences
  }

  /**
   * Main routing function - finds best model for role + task combination
   */
  routeRequest(role, task, constraints = {}) {
    try {
      // 1. Extract semantic requirements from role and task
      const requirements = this.extractRequirements(role, task);
      
      // 2. Apply user constraints (budget, speed, etc.)
      const constrainedRequirements = this.applyConstraints(requirements, constraints);
      
      // 3. Calculate model scores using semantic similarity
      const modelScores = this.calculateModelScores(constrainedRequirements);
      
      // 4. Rank and return top candidates with confidence scores
      const recommendations = this.rankModels(modelScores, constrainedRequirements);
      
      // 5. Add explanation and fallback options
      return this.buildRecommendationResponse(recommendations, role, task, constraints);
      
    } catch (error) {
      console.error('Model routing error:', error);
      return this.getFallbackRecommendation(role, task);
    }
  }

  /**
   * Extract capability requirements from role and task description
   */
  extractRequirements(role, task) {
    // Start with role-based baseline requirements
    const roleRequirements = this.roleProfiles[role] || this.getGenericRoleProfile(role);
    
    // Analyze task for semantic patterns
    const taskRequirements = this.analyzeTaskSemantics(task);
    
    // Combine role and task requirements with weighted average
    const combined = this.combineRequirements(roleRequirements, taskRequirements, 0.4, 0.6);
    
    return combined;
  }

  /**
   * Analyze task text for semantic patterns and capability needs
   */
  analyzeTaskSemantics(task) {
    const taskLower = task.toLowerCase();
    const requirements = {};
    
    // Initialize all capabilities to 0
    const allCapabilities = new Set();
    Object.values(this.taskPatterns).forEach(pattern => {
      Object.keys(pattern).forEach(cap => allCapabilities.add(cap));
    });
    allCapabilities.forEach(cap => requirements[cap] = 0);
    
    // Pattern matching with weighted contributions
    for (const [patternName, patternVector] of Object.entries(this.taskPatterns)) {
      const matchScore = this.calculatePatternMatch(taskLower, patternName);
      if (matchScore > 0) {
        // Add weighted contribution of this pattern
        for (const [capability, weight] of Object.entries(patternVector)) {
          requirements[capability] += matchScore * weight;
        }
      }
    }
    
    // Keyword-based semantic analysis
    this.enhanceWithKeywordAnalysis(taskLower, requirements);
    
    // Normalize to 0-1 range
    const maxValue = Math.max(...Object.values(requirements));
    if (maxValue > 0) {
      for (const key of Object.keys(requirements)) {
        requirements[key] = Math.min(requirements[key] / maxValue, 1.0);
      }
    }
    
    return requirements;
  }

  /**
   * Calculate how well a task matches a semantic pattern
   */
  calculatePatternMatch(taskText, patternName) {
    const keywords = {
      code_generation: ['generate', 'create', 'write', 'build', 'code', 'function', 'class', 'script', 'component', 'typescript', 'javascript', 'python'],
      code_review: ['review', 'check', 'analyze', 'audit', 'examine', 'code', 'quality'],
      debugging: ['debug', 'fix', 'error', 'bug', 'issue', 'problem', 'troubleshoot'],
      refactoring: ['refactor', 'improve', 'optimize', 'restructure', 'clean'],
      
      data_analysis: ['analyze', 'data', 'statistics', 'trends', 'insights', 'patterns', 'statistical', 'mathematical'],
      document_analysis: ['document', 'text', 'analyze', 'summarize', 'extract'],
      research: ['research', 'investigate', 'study', 'explore', 'findings'],
      
      content_creation: ['create', 'write', 'content', 'article', 'blog', 'copy'],
      image_generation: ['image', 'picture', 'visual', 'generate', 'create', 'draw', 'logo', 'design', 'graphic', 'illustration', 'photo'],
      video_creation: ['video', 'film', 'movie', 'animation', 'create', 'promotional', 'cinematic'],
      music_creation: ['music', 'song', 'audio', 'sound', 'compose', 'instrumental', 'background'],
      
      problem_solving: ['solve', 'problem', 'solution', 'resolve', 'figure'],
      strategic_planning: ['strategy', 'plan', 'roadmap', 'vision', 'goals'],
      decision_making: ['decide', 'choose', 'decision', 'options', 'recommend'],
      
      writing: ['write', 'draft', 'compose', 'author', 'text'],
      summarization: ['summarize', 'summary', 'brief', 'overview', 'digest'],
      translation: ['translate', 'language', 'convert', 'localize'],
      
      image_analysis: ['analyze', 'image', 'photo', 'visual', 'picture'],
      document_processing: ['process', 'document', 'file', 'pdf', 'text'],
      
      real_time: ['real-time', 'live', 'instant', 'immediate', 'fast', 'quick'],
      batch_processing: ['batch', 'bulk', 'multiple', 'many', 'process'],
      
      multi_step: ['step', 'steps', 'process', 'workflow', 'sequence'],
      long_form: ['long', 'detailed', 'comprehensive', 'extensive', 'thorough']
    };
    
    const patternKeywords = keywords[patternName] || [];
    let matchScore = 0;
    
    for (const keyword of patternKeywords) {
      if (taskText.includes(keyword)) {
        matchScore += 1;
      }
    }
    
    // Boost score for exact matches of key terms
    if (patternName === 'image_generation' && (taskText.includes('logo') || taskText.includes('image') || taskText.includes('visual'))) {
      matchScore += 3;
    }
    if (patternName === 'video_creation' && (taskText.includes('video') || taskText.includes('promotional'))) {
      matchScore += 3;
    }
    if (patternName === 'music_creation' && (taskText.includes('music') || taskText.includes('audio'))) {
      matchScore += 3;
    }
    
    // Normalize by keyword count and add base relevance
    return Math.min(matchScore / Math.max(patternKeywords.length, 1), 1.0);
  }

  /**
   * Enhance requirements with additional keyword analysis
   */
  enhanceWithKeywordAnalysis(taskText, requirements) {
    // Speed indicators
    if (taskText.match(/\b(fast|quick|rapid|immediate|urgent|asap)\b/)) {
      requirements.speed = Math.max(requirements.speed || 0, 0.8);
    }
    
    // Cost sensitivity
    if (taskText.match(/\b(cheap|budget|cost-effective|affordable|economical)\b/)) {
      requirements.cost = Math.max(requirements.cost || 0, 0.9);
    }
    
    // Quality indicators
    if (taskText.match(/\b(high-quality|professional|premium|best|excellent)\b/)) {
      requirements.reasoning = Math.max(requirements.reasoning || 0, 0.8);
      requirements.analysis = Math.max(requirements.analysis || 0, 0.8);
    }
    
    // Complexity indicators
    if (taskText.match(/\b(complex|complicated|sophisticated|advanced|detailed)\b/)) {
      requirements.reasoning = Math.max(requirements.reasoning || 0, 0.9);
      requirements.complex_tasks = Math.max(requirements.complex_tasks || 0, 0.9);
    }
    
    // Creative indicators
    if (taskText.match(/\b(creative|innovative|original|artistic|design)\b/)) {
      requirements.creative = Math.max(requirements.creative || 0, 0.8);
    }
    
    // Multimodal indicators
    if (taskText.match(/\b(image|video|audio|visual|multimodal|media)\b/)) {
      requirements.multimodal = Math.max(requirements.multimodal || 0, 0.8);
    }
  }

  /**
   * Combine role and task requirements with weighted average
   */
  combineRequirements(roleReq, taskReq, roleWeight = 0.4, taskWeight = 0.6) {
    const combined = {};
    const allKeys = new Set([...Object.keys(roleReq), ...Object.keys(taskReq)]);
    
    for (const key of allKeys) {
      const roleValue = roleReq[key] || 0;
      const taskValue = taskReq[key] || 0;
      combined[key] = (roleValue * roleWeight) + (taskValue * taskWeight);
    }
    
    return combined;
  }

  /**
   * Apply user constraints to requirements
   */
  applyConstraints(requirements, constraints) {
    const constrained = { ...requirements };
    
    if (constraints.maxCost) {
      constrained.cost = Math.max(constrained.cost || 0, 0.8);
    }
    
    if (constraints.prioritizeSpeed) {
      constrained.speed = Math.max(constrained.speed || 0, 0.9);
    }
    
    if (constraints.requireMultimodal) {
      constrained.multimodal = Math.max(constrained.multimodal || 0, 0.8);
    }
    
    if (constraints.preferOpenSource) {
      // This would be handled in scoring phase
    }
    
    return constrained;
  }

  /**
   * Calculate semantic similarity scores for all models
   */
  calculateModelScores(requirements) {
    const scores = {};
    
    for (const [modelId, capabilities] of Object.entries(this.capabilities)) {
      scores[modelId] = this.calculateSemanticSimilarity(requirements, capabilities);
    }
    
    return scores;
  }

  /**
   * Calculate cosine similarity between requirement and capability vectors
   */
  calculateSemanticSimilarity(requirements, capabilities) {
    const commonKeys = Object.keys(requirements).filter(key => 
      capabilities.hasOwnProperty(key)
    );
    
    if (commonKeys.length === 0) return 0;
    
    let dotProduct = 0;
    let reqMagnitude = 0;
    let capMagnitude = 0;
    
    for (const key of commonKeys) {
      const reqValue = requirements[key] || 0;
      const capValue = capabilities[key] || 0;
      
      dotProduct += reqValue * capValue;
      reqMagnitude += reqValue * reqValue;
      capMagnitude += capValue * capValue;
    }
    
    const magnitude = Math.sqrt(reqMagnitude) * Math.sqrt(capMagnitude);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Rank models by score and add confidence metrics
   */
  rankModels(modelScores, requirements) {
    const ranked = Object.entries(modelScores)
      .map(([modelId, score]) => ({
        modelId,
        score,
        confidence: this.calculateConfidence(score, modelScores),
        model: this.models[modelId]
      }))
      .filter(item => item.model) // Only include available models
      .sort((a, b) => b.score - a.score);
    
    return ranked.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Calculate confidence based on score distribution
   */
  calculateConfidence(score, allScores) {
    const scores = Object.values(allScores);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const std = Math.sqrt(scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length);
    
    // Confidence is higher when score is significantly above mean
    const zScore = std > 0 ? (score - mean) / std : 0;
    return Math.max(0, Math.min(1, (zScore + 2) / 4)); // Normalize to 0-1
  }

  /**
   * Build comprehensive recommendation response
   */
  buildRecommendationResponse(recommendations, role, task, constraints) {
    const primary = recommendations[0];
    const alternatives = recommendations.slice(1, 4);
    
    return {
      primary: {
        modelId: primary.modelId,
        model: primary.model,
        score: primary.score,
        confidence: primary.confidence,
        reasoning: this.generateReasoning(primary, role, task)
      },
      alternatives: alternatives.map(rec => ({
        modelId: rec.modelId,
        model: rec.model,
        score: rec.score,
        confidence: rec.confidence,
        reasoning: this.generateReasoning(rec, role, task)
      })),
      metadata: {
        role,
        task: task.substring(0, 100) + (task.length > 100 ? '...' : ''),
        constraints,
        totalCandidates: recommendations.length,
        routingConfidence: primary.confidence
      }
    };
  }

  /**
   * Generate human-readable reasoning for model selection
   */
  generateReasoning(recommendation, role, task) {
    const model = recommendation.model;
    const capabilities = this.capabilities[recommendation.modelId];
    
    // Find top capabilities for this model
    const topCapabilities = Object.entries(capabilities)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([cap]) => cap);
    
    const reasons = [];
    
    // Role-specific reasoning
    if (role.includes('Developer') && topCapabilities.includes('coding')) {
      reasons.push(`Excellent coding capabilities for ${role} tasks`);
    }
    if (role.includes('Designer') && topCapabilities.includes('creative')) {
      reasons.push(`Strong creative abilities suited for ${role} work`);
    }
    
    // Task-specific reasoning
    if (task.toLowerCase().includes('complex') && capabilities.reasoning > 0.8) {
      reasons.push('Advanced reasoning for complex problem solving');
    }
    if (task.toLowerCase().includes('fast') && capabilities.speed > 0.7) {
      reasons.push('Optimized for speed and quick responses');
    }
    
    // Model-specific strengths
    if (model.name.includes('Claude 4')) {
      reasons.push('Latest flagship model with sustained performance');
    }
    if (model.name.includes('Gemini 2.5')) {
      reasons.push('Advanced multimodal capabilities and large context');
    }
    
    return reasons.length > 0 ? reasons.join('; ') : 
           `Score: ${(recommendation.score * 100).toFixed(1)}% match for your requirements`;
  }

  /**
   * Get fallback recommendation when routing fails
   */
  getFallbackRecommendation(role, task) {
    return {
      primary: {
        modelId: 'claude-3-5-sonnet',
        model: this.models['claude-3-5-sonnet'],
        score: 0.8,
        confidence: 0.6,
        reasoning: 'Reliable general-purpose model (fallback recommendation)'
      },
      alternatives: [
        {
          modelId: 'gpt-4o',
          model: this.models['gpt-4o'],
          score: 0.75,
          confidence: 0.6,
          reasoning: 'Versatile multimodal alternative'
        }
      ],
      metadata: {
        role,
        task: task.substring(0, 100) + (task.length > 100 ? '...' : ''),
        constraints: {},
        totalCandidates: 2,
        routingConfidence: 0.6,
        fallback: true
      }
    };
  }

  /**
   * Get generic role profile for unknown roles
   */
  getGenericRoleProfile(role) {
    return {
      reasoning: 0.7,
      analysis: 0.6,
      creative: 0.5,
      coding: 0.3,
      speed: 0.6,
      cost: 0.7,
      versatility: 0.8
    };
  }

  /**
   * Learn from user feedback to improve recommendations
   */
  recordUserFeedback(role, task, selectedModel, satisfaction) {
    const key = `${role}:${task.substring(0, 50)}`;
    if (!this.usageHistory.has(key)) {
      this.usageHistory.set(key, []);
    }
    
    this.usageHistory.get(key).push({
      selectedModel,
      satisfaction,
      timestamp: Date.now()
    });
    
    // TODO: Use this data to adjust model scoring over time
  }
}

// Export singleton instance
export const modelRouter = new SemanticModelRouter();

// Convenience function for direct usage
export function routeToOptimalModel(role, task, constraints = {}) {
  return modelRouter.routeRequest(role, task, constraints);
}

// Export for testing and extension
export { SemanticModelRouter, MODEL_CAPABILITY_VECTORS, ROLE_CAPABILITY_PROFILES, TASK_SEMANTIC_PATTERNS }; 