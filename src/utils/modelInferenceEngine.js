import { AI_MODELS } from '../data/aiModels';

const CAPABILITY_WEIGHTS = {
  excellent: 3,
  good: 2,
  average: 1,
};

const KEYWORD_TRIGGERS = {
  coding: ['code', 'python', 'javascript', 'typescript', 'function', 'script', 'algorithm', 'debug'],
  analysis: ['analyze', 'summarize', 'report', 'extract', 'data', 'sentiment', 'classify'],
  creative: ['poem', 'story', 'write', 'song', 'dialogue', 'screenplay', 'creative'],
  reasoning: ['solve', 'puzzle', 'logic', 'reasoning', 'step-by-step', 'deduce', 'problem'],
  multimodal: ['image', 'visual', 'see', 'diagram', 'chart', 'graph', 'picture'],
};

const FORMAT_KEYWORDS = {
  JSON: ['json'],
  XML: ['xml'],
  MARKDOWN: ['markdown', 'md'],
};

function scoreModel(model, combinedText, formData) {
  let score = 0;

  // 1. Score based on capabilities and keyword triggers
  for (const capability in KEYWORD_TRIGGERS) {
    if (model.capabilities[capability]) {
      const keywords = KEYWORD_TRIGGERS[capability];
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        const capabilityLevel = model.capabilities[capability];
        score += CAPABILITY_WEIGHTS[capabilityLevel] || 1;
      }
    } else if (capability === 'multimodal' && model.features.includes('vision')) {
        const keywords = KEYWORD_TRIGGERS[capability];
        if (keywords.some(keyword => combinedText.includes(keyword))) {
          score += CAPABILITY_WEIGHTS.excellent; 
        }
    }
  }

  // 2. Score based on output format preference
  const outputText = formData.output.toLowerCase();
  for (const format in FORMAT_KEYWORDS) {
    if (FORMAT_KEYWORDS[format].some(keyword => outputText.includes(keyword))) {
      if (model.preferredFormat === format) {
        score += 5; // Strong boost for preferred format
      } else if (model.alternativeFormats?.includes(format)) {
        score += 2; // Smaller boost for alternative formats
      }
    }
  }
  
  // 3. Boost for specific features like function calling
  if (combinedText.includes('function call') || combinedText.includes('tool use')) {
      if (model.features.includes('function_calling') || model.features.includes('tool_use')) {
          score += 4;
      }
  }

  // 4. Give a slight bonus to more capable models in general
  score += (CAPABILITY_WEIGHTS[model.capabilities.reasoning] || 0) * 0.5;
  score += (CAPABILITY_WEIGHTS[model.capabilities.coding] || 0) * 0.5;


  return score;
}

export function suggestModelForPrompt(formData, enrichmentData) {
  if (!formData || !formData.task) {
    return null;
  }

  const combinedText = [
    formData.role,
    formData.task,
    formData.context,
    formData.requirements,
    formData.style,
    formData.output,
    enrichmentData.goals,
    enrichmentData.examples,
  ].join(' ').toLowerCase();

  let bestModel = null;
  let maxScore = -1;

  for (const modelId in AI_MODELS) {
    const model = AI_MODELS[modelId];
    const score = scoreModel(model, combinedText, formData);

    if (score > maxScore) {
      maxScore = score;
      bestModel = modelId;
    }
  }

  return bestModel;
} 