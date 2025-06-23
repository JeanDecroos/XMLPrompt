# AI Integration Guide

This document explains how to integrate real AI APIs (Claude, GPT, Gemini, etc.) to replace the current mock enhancement system.

## Current Architecture

The application uses a mock enhancement system located in `src/utils/promptEnricher.js`. The main function `enrichPrompt()` calls `mockEnrichment()` which simulates AI-based prompt enhancement with a 1-second delay.

## Integration Points

### 1. Replace Mock Enhancement Function

In `src/utils/promptEnricher.js`, replace the `mockEnrichment()` function:

```javascript
// Current mock implementation
async function mockEnrichment(data) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  // ... mock logic
}

// Replace with real AI API call
async function realEnrichment(data) {
  // Example: Claude API integration
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.REACT_APP_CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: createEnhancementPrompt(data)
      }]
    })
  })
  
  const result = await response.json()
  return parseEnhancedResponse(result.content[0].text)
}
```

### 2. API-Specific Implementations

#### Claude API Integration
```javascript
const enrichWithClaude = async (promptData, enrichmentOptions) => {
  const enhancementPrompt = `
    Please enhance this prompt for optimal results with Claude Sonnet:
    
    Original prompt data:
    ${JSON.stringify(promptData, null, 2)}
    
    Enhancement preferences:
    ${JSON.stringify(enrichmentOptions, null, 2)}
    
    Please return enhanced prompt data in the same JSON structure, improving:
    - Task clarity and specificity
    - Context relevance and completeness  
    - Requirements comprehensiveness
    - Style consistency with tone
    - Output format optimization
  `
  
  // Make API call to Claude
  // Parse and return enhanced data
}
```

#### OpenAI GPT Integration
```javascript
const enrichWithGPT = async (promptData, enrichmentOptions) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are a prompt engineering expert. Enhance prompts for optimal AI performance.'
      }, {
        role: 'user', 
        content: createEnhancementPrompt(promptData, enrichmentOptions)
      }],
      max_tokens: 1000
    })
  })
  
  const result = await response.json()
  return parseEnhancedResponse(result.choices[0].message.content)
}
```

#### Google Gemini Integration
```javascript
const enrichWithGemini = async (promptData, enrichmentOptions) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: createEnhancementPrompt(promptData, enrichmentOptions)
        }]
      }]
    })
  })
  
  const result = await response.json()
  return parseEnhancedResponse(result.candidates[0].content.parts[0].text)
}
```

### 3. Multi-Model Support

Add model selection to the UI and routing logic:

```javascript
// In promptEnricher.js
export const enrichPrompt = async (promptData, enrichmentOptions = {}) => {
  const { model = 'claude' } = enrichmentOptions
  
  switch (model) {
    case 'claude':
      return await enrichWithClaude(promptData, enrichmentOptions)
    case 'gpt':
      return await enrichWithGPT(promptData, enrichmentOptions)
    case 'gemini':
      return await enrichWithGemini(promptData, enrichmentOptions)
    default:
      return await mockEnrichment(promptData) // Fallback
  }
}
```

### 4. Environment Variables

Add API keys to your environment:

```bash
# .env.local
REACT_APP_CLAUDE_API_KEY=your_claude_api_key
REACT_APP_OPENAI_API_KEY=your_openai_api_key  
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

### 5. Error Handling

Implement robust error handling:

```javascript
const enrichPrompt = async (promptData, enrichmentOptions = {}) => {
  try {
    return await realEnrichment(promptData, enrichmentOptions)
  } catch (error) {
    console.error('Enhancement failed:', error)
    
    // Fallback strategies:
    // 1. Try alternative model
    // 2. Use mock enhancement
    // 3. Return original prompt with basic improvements
    
    return await mockEnrichment(promptData) // Graceful fallback
  }
}
```

### 6. Rate Limiting & Caching

Implement rate limiting and caching for production:

```javascript
// Simple rate limiting
const rateLimiter = new Map()

const isRateLimited = (userId) => {
  const now = Date.now()
  const userRequests = rateLimiter.get(userId) || []
  const recentRequests = userRequests.filter(time => now - time < 60000) // 1 minute
  
  if (recentRequests.length >= 10) { // Max 10 requests per minute
    return true
  }
  
  rateLimiter.set(userId, [...recentRequests, now])
  return false
}

// Simple caching
const enhancementCache = new Map()

const getCachedEnhancement = (promptHash) => {
  return enhancementCache.get(promptHash)
}

const setCachedEnhancement = (promptHash, enhancement) => {
  enhancementCache.set(promptHash, enhancement)
  // Implement cache expiration logic
}
```

## Testing Strategy

1. **Unit Tests**: Test individual enhancement functions
2. **Integration Tests**: Test API connectivity and response parsing
3. **Fallback Tests**: Ensure graceful degradation when APIs fail
4. **Performance Tests**: Measure response times and rate limits

## Deployment Considerations

1. **API Key Security**: Use environment variables, never commit keys
2. **Rate Limiting**: Implement client-side and server-side limits
3. **Error Monitoring**: Track API failures and fallback usage
4. **Cost Monitoring**: Monitor API usage and costs
5. **Caching Strategy**: Implement Redis or similar for production caching

## Future Enhancements

1. **Model Comparison**: Allow users to compare enhancements from different models
2. **Custom Enhancement Prompts**: Let users customize the enhancement instructions
3. **Batch Processing**: Support multiple prompt enhancements simultaneously
4. **Analytics**: Track enhancement effectiveness and user preferences
5. **Fine-tuning**: Train custom models on user feedback for better enhancements 