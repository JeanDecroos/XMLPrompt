// Sample backend API for GPT-powered prompt enrichment
// This is an example implementation - you would need to set up a proper backend

const express = require('express')
const cors = require('cors')
const { OpenAI } = require('openai')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3001

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

// Middleware
app.use(cors())
app.use(express.json())

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    req.user = null
    return next()
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      req.user = null
    } else {
      req.user = user
    }
    next()
  })
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Main prompt enrichment endpoint
app.post('/api/prompts/enrich', authenticateToken, async (req, res) => {
  try {
    const { task, context, requirements, role, style, output, userTier, enrichmentLevel } = req.body
    const isAuthenticated = !!req.user
    
    // Enhanced Pro status checking with multiple fallbacks
    let isPro = false
    if (req.user) {
      // Check various indicators of Pro status
      isPro = userTier === 'pro' || 
              req.user.subscription === 'pro' ||
              req.user.user_metadata?.subscription_tier === 'pro' ||
              req.user.app_metadata?.subscription_tier === 'pro' ||
              req.user.subscription_tier === 'pro'
      
      // Known Pro users fallback
      const knownProUsers = ['bartjan.decroos@me.com']
      if (knownProUsers.includes(req.user.email?.toLowerCase())) {
        isPro = true
      }
    }

    // Validate required fields
    if (!task || !role) {
      return res.status(400).json({
        error: 'Missing required fields: task and role are required'
      })
    }

    // Build the enrichment prompt for GPT
    const enrichmentPrompt = buildEnrichmentPrompt({
      task,
      context,
      requirements,
      role,
      style,
      output,
      isPro,
      isAuthenticated,
      enrichmentLevel
    })

    const startTime = Date.now()

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert prompt engineer specializing in creating optimized XML prompts for Claude AI. Your job is to enhance and refine prompts for maximum effectiveness.'
        },
        {
          role: 'user',
          content: enrichmentPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: isPro ? 2000 : 800
    })

    const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`
    const tokensUsed = completion.usage.total_tokens

    // Parse the response
    const enrichedContent = completion.choices[0].message.content
    const { enrichedPrompt, improvements, qualityScore } = parseGPTResponse(enrichedContent, isPro)

    res.json({
      enrichedPrompt,
      improvements,
      qualityScore,
      isEnriched: true,
      processingTime,
      tokensUsed,
      tier: isPro ? 'pro' : isAuthenticated ? 'free' : 'anonymous'
    })

  } catch (error) {
    console.error('Enrichment error:', error)
    
    // Return fallback response
    const fallbackPrompt = generateFallbackPrompt(req.body)
    
    res.status(500).json({
      error: 'Enhancement service temporarily unavailable',
      fallback: {
        enrichedPrompt: fallbackPrompt,
        improvements: ['Basic XML structure applied'],
        qualityScore: 6,
        isEnriched: false
      }
    })
  }
})

// Generate enrichment instruction based on scale
function generateEnrichmentInstruction(level = 50) {
  const instructions = {
    0: "Only fix grammar, spelling, and basic clarity issues. Do not add any new meaning, concepts, or interpretations beyond what is explicitly provided.",
    5: "Make minimal language improvements for better readability. Correct grammar and improve sentence flow while preserving exact original meaning.",
    10: "Optimize language clarity and basic structure. Make minor word choices improvements without adding new concepts or interpretations.",
    15: "Enhance readability and flow with slightly better word choices. Maintain strict adherence to original intent with no conceptual additions.",
    20: "Improve language quality and sentence structure. Add minimal formatting improvements while staying completely faithful to original meaning.",
    25: "Enhance clarity and flow with improved structure. Make minor organizational improvements without introducing new concepts or context.",
    30: "Improve prompt structure and language quality. Add basic formatting and organization while maintaining original scope and intent.",
    35: "Enhance language and add minimal structural improvements. Introduce very light organizational changes without expanding meaning.",
    40: "Improve clarity, flow, and organization. Add slight structural enhancements and minor formatting improvements to original content.",
    45: "Enhance language quality and structure with light improvements. Begin introducing minimal contextual clarity without adding new concepts.",
    50: "Enhance for clarity, tone, and slight conceptual enrichment. Introduce minor inferred details if they improve the prompt while keeping close to original intent.",
    55: "Add moderate enhancements to clarity and structure. Introduce light contextual improvements and minor inferred details that support the original intent.",
    60: "Enhance with moderate conceptual improvements. Add relevant context and minor expansions that naturally extend the original request.",
    65: "Apply moderate creative enhancements. Add contextual details and light creative interpretations that align with the original purpose.",
    70: "Enhance with creative improvements and expanded context. Add relevant details and moderate creative interpretations while maintaining core intent.",
    75: "Significantly enhance with creative improvements, adding relevant context and inferred meaning. Expand concepts naturally while maintaining core intent.",
    80: "Apply substantial creative enhancements. Add significant context, creative interpretations, and expanded concepts that build upon the original request.",
    85: "Enhance creatively with substantial additions. Add extensive context, creative interpretations, and expanded scope while staying generally aligned with intent.",
    90: "Apply high levels of creative enhancement. Add substantial new context, creative interpretations, and expanded concepts. Some creative liberties may be taken.",
    95: "Enhance with extensive creative freedom. Add substantial new ideas, expanded context, and creative interpretations. Minor inaccuracies may be introduced for creative enhancement.",
    100: "Enhance with maximum creative freedom. Add extensive new ideas, substantial context, and creative interpretations. Note: At this level, some inaccuracies or assumptions may be introduced in favor of creative enhancement."
  }
  
  // Find the exact level or closest one
  const availableLevels = Object.keys(instructions).map(Number).sort((a, b) => a - b)
  const closestLevel = availableLevels.reduce((prev, curr) => 
    Math.abs(curr - level) < Math.abs(prev - level) ? curr : prev
  )
  
  return instructions[closestLevel]
}

// Build the enrichment prompt for GPT
function buildEnrichmentPrompt({ task, context, requirements, role, style, output, isPro, isAuthenticated, enrichmentLevel }) {
  let prompt = `Please enhance this prompt for Claude AI by creating an optimized XML structure:

ORIGINAL PROMPT DATA:
- Role: ${role}
- Task: ${task}`

  if (context) prompt += `\n- Context: ${context}`
  if (requirements) prompt += `\n- Requirements: ${requirements}`
  if (style && isPro) prompt += `\n- Style: ${style}`
  if (output && isPro) prompt += `\n- Output Format: ${output}`

  const enrichmentInstruction = generateEnrichmentInstruction(enrichmentLevel || 50)
  
  prompt += `\n\nPLEASE PROVIDE:
1. An enhanced XML prompt with proper structure and tags
2. A list of specific improvements made
3. A quality score from 1-10

ENRICHMENT INSTRUCTION: ${enrichmentInstruction}

ENHANCEMENT LEVEL: ${isPro ? 'PROFESSIONAL' : isAuthenticated ? 'STANDARD' : 'BASIC'}

${isPro ? `
PROFESSIONAL ENHANCEMENTS:
- Add comprehensive context and background
- Include detailed requirements and constraints
- Optimize for clarity and specificity
- Add professional styling guidelines
- Structure output format specifications
- Include edge case considerations
- Add success criteria and validation steps
` : isAuthenticated ? `
STANDARD ENHANCEMENTS:
- Improve clarity and structure
- Add relevant context
- Optimize XML formatting
- Include basic requirements
` : `
BASIC ENHANCEMENTS:
- Create proper XML structure
- Ensure essential elements are included
`}

Format your response as:
ENHANCED_PROMPT:
[Your enhanced XML prompt here]

IMPROVEMENTS:
- [List each improvement made]

QUALITY_SCORE: [1-10]`

  return prompt
}

// Parse GPT response
function parseGPTResponse(content, isPro) {
  try {
    const lines = content.split('\n')
    let enrichedPrompt = ''
    let improvements = []
    let qualityScore = isPro ? 8.5 : 7.0
    
    let currentSection = ''
    
    for (const line of lines) {
      if (line.includes('ENHANCED_PROMPT:')) {
        currentSection = 'prompt'
        continue
      } else if (line.includes('IMPROVEMENTS:')) {
        currentSection = 'improvements'
        continue
      } else if (line.includes('QUALITY_SCORE:')) {
        const scoreMatch = line.match(/(\d+(?:\.\d+)?)/)
        if (scoreMatch) {
          qualityScore = parseFloat(scoreMatch[1])
        }
        continue
      }
      
      if (currentSection === 'prompt' && line.trim()) {
        enrichedPrompt += line + '\n'
      } else if (currentSection === 'improvements' && line.trim().startsWith('-')) {
        improvements.push(line.trim().substring(1).trim())
      }
    }
    
    return {
      enrichedPrompt: enrichedPrompt.trim(),
      improvements,
      qualityScore
    }
  } catch (error) {
    console.error('Failed to parse GPT response:', error)
    return {
      enrichedPrompt: content,
      improvements: ['Enhanced with AI optimization'],
      qualityScore: isPro ? 8.0 : 7.0
    }
  }
}

// Generate fallback prompt when GPT fails
function generateFallbackPrompt({ task, context, requirements, role }) {
  let xml = '<prompt>\n'
  
  if (role) {
    xml += `  <role>${role}</role>\n`
  }
  
  if (task) {
    xml += `  <task>\n    ${task}\n  </task>\n`
  }
  
  if (context) {
    xml += `  <context>\n    ${context}\n  </context>\n`
  }
  
  if (requirements) {
    xml += `  <requirements>\n    ${requirements}\n  </requirements>\n`
  }
  
  xml += '</prompt>'
  
  return xml
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
  console.log('Required environment variables:')
  console.log('- OPENAI_API_KEY')
  console.log('- JWT_SECRET (optional)')
  console.log('- OPENAI_MODEL (optional, defaults to gpt-4o-mini)')
}) 