import express from 'express'
import { OpenAI } from 'openai'
import { logger } from '../utils/logger.js'
import { config } from '../config/index.js'
import { rateLimitMiddleware } from '../middleware/rateLimit.js'
import { validationMiddleware } from '../middleware/validation.js'
import { database } from '../config/database.js'

const router = express.Router()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.ai.openai.apiKey
})

// Validation schemas
const enhancePromptSchema = {
  type: 'object',
  properties: {
    task: { type: 'string', minLength: 10, maxLength: 2000 },
    context: { type: 'string', maxLength: 1000 },
    requirements: { type: 'string', maxLength: 1000 },
    role: { type: 'string', minLength: 1, maxLength: 100 },
    style: { type: 'string', maxLength: 200 },
    output: { type: 'string', maxLength: 500 },
    userTier: { type: 'string', enum: ['free', 'pro', 'enterprise'] }
  },
  required: ['task', 'role'],
  additionalProperties: false
}

// POST /api/v1/enrichment/enhance
router.post('/enhance', 
  validationMiddleware(enhancePromptSchema),
  rateLimitMiddleware,
  async (req, res) => {
  try {
      const { task, context, requirements, role, style, output, userTier } = req.body
      const userId = req.user?.id
      const isAuthenticated = !!req.user
      
      // Determine user tier
      let tier = 'free'
      if (req.user) {
        tier = req.user.subscription_tier || userTier || 'free'
        
        // Pro user override for specific emails
        const knownProUsers = ['bartjan.decroos@me.com']
        if (knownProUsers.includes(req.user.email?.toLowerCase())) {
          tier = 'pro'
        }
      }
      
      const isPro = tier === 'pro' || tier === 'enterprise'
      
      logger.info('Prompt enhancement request', {
        userId,
        tier,
        taskLength: task.length,
        hasContext: !!context,
        hasRequirements: !!requirements
      })

      // Build the enrichment prompt for GPT
      const enrichmentPrompt = buildEnrichmentPrompt({
        task,
        context,
        requirements,
        role,
        style,
        output,
        isPro,
        isAuthenticated
      })

      const startTime = Date.now()

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: config.ai.openai.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert prompt engineer specializing in creating optimized XML prompts for Claude AI. Your job is to enhance and refine prompts for maximum effectiveness while maintaining clarity and structure.'
          },
          {
            role: 'user',
            content: enrichmentPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: isPro ? 2000 : 800,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })

      const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`
      const tokensUsed = completion.usage.total_tokens

      // Parse the response
      const enrichedContent = completion.choices[0].message.content
      const { enrichedPrompt, improvements, qualityScore } = parseGPTResponse(enrichedContent, isPro)

      // Log usage for analytics
      await logUsage({
        userId,
        action: 'prompt_enhancement',
        tier,
        tokensUsed,
        processingTime: Date.now() - startTime,
        success: true
      })

      // Response in format expected by frontend
      res.json({
        enrichedPrompt,
        improvements,
        qualityScore,
        isEnriched: true,
        processingTime,
        tokensUsed,
        tier,
        success: true
      })

    } catch (error) {
      logger.error('Prompt enhancement failed:', error)
      
      // Log failed usage
      await logUsage({
        userId: req.user?.id,
        action: 'prompt_enhancement',
        tier: req.user?.subscription_tier || 'free',
        success: false,
        error: error.message
      })
      
      // Return fallback response
      const fallbackPrompt = generateFallbackPrompt(req.body)
      
      res.status(500).json({
        error: 'Enhancement service temporarily unavailable',
        message: 'Falling back to basic prompt generation',
        fallback: {
          enrichedPrompt: fallbackPrompt,
          improvements: ['Basic XML structure applied'],
          qualityScore: 6,
          isEnriched: false,
          tier: req.user?.subscription_tier || 'free'
        }
      })
    }
  }
)

// Build the enrichment prompt for GPT
function buildEnrichmentPrompt({ task, context, requirements, role, style, output, isPro, isAuthenticated }) {
  let prompt = `Please enhance this prompt for Claude AI by creating an optimized XML structure:

ORIGINAL PROMPT DATA:
- Role: ${role}
- Task: ${task}`

  if (context) prompt += `\n- Context: ${context}`
  if (requirements) prompt += `\n- Requirements: ${requirements}`
  if (style && isPro) prompt += `\n- Style: ${style}`
  if (output && isPro) prompt += `\n- Output Format: ${output}`

  prompt += `\n\nPLEASE PROVIDE:
1. An enhanced XML prompt with proper structure and tags
2. A list of specific improvements made
3. A quality score from 1-10

ENHANCEMENT LEVEL: ${isPro ? 'PROFESSIONAL' : isAuthenticated ? 'STANDARD' : 'BASIC'}

${isPro ? `
PROFESSIONAL ENHANCEMENTS:
- Add comprehensive context and background information
- Include detailed requirements and constraints
- Optimize for clarity, specificity, and actionability
- Add professional styling guidelines and tone
- Structure clear output format specifications
- Include edge case considerations and error handling
- Add success criteria and validation steps
- Enhance with domain-specific expertise
` : isAuthenticated ? `
STANDARD ENHANCEMENTS:
- Improve clarity and structure
- Add relevant context where missing
- Optimize XML formatting and organization
- Include basic requirements and guidelines
- Ensure proper task specification
` : `
BASIC ENHANCEMENTS:
- Create proper XML structure with essential tags
- Ensure all required elements are included
- Basic formatting and organization
`}

IMPORTANT FORMATTING RULES:
- Use proper XML tags: <prompt>, <role>, <task>, <context>, <requirements>, etc.
- Ensure all tags are properly closed
- Use clear, concise language
- Make the prompt actionable and specific
- Include relevant examples if helpful

Format your response EXACTLY as:
ENHANCED_PROMPT:
[Your enhanced XML prompt here]

IMPROVEMENTS:
- [List each specific improvement made]

QUALITY_SCORE: [Number from 1-10]`

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
    let promptStarted = false
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      if (trimmedLine.includes('ENHANCED_PROMPT:')) {
        currentSection = 'prompt'
        continue
      } else if (trimmedLine.includes('IMPROVEMENTS:')) {
        currentSection = 'improvements'
        continue
      } else if (trimmedLine.includes('QUALITY_SCORE:')) {
        const scoreMatch = trimmedLine.match(/(\d+(?:\.\d+)?)/)
        if (scoreMatch) {
          qualityScore = parseFloat(scoreMatch[1])
        }
        continue
      }
      
      if (currentSection === 'prompt') {
        if (trimmedLine.startsWith('<prompt>') || promptStarted) {
          promptStarted = true
          enrichedPrompt += line + '\n'
          
          // Stop at closing prompt tag
          if (trimmedLine.includes('</prompt>')) {
            break
          }
        }
      } else if (currentSection === 'improvements' && trimmedLine.startsWith('-')) {
        improvements.push(trimmedLine.substring(1).trim())
      }
    }
    
    // Fallback parsing if structured format failed
    if (!enrichedPrompt.trim()) {
      // Look for XML content in the response
      const xmlMatch = content.match(/<prompt>[\s\S]*?<\/prompt>/i)
      if (xmlMatch) {
        enrichedPrompt = xmlMatch[0]
      } else {
        // Create basic XML from content
        enrichedPrompt = `<prompt>\n${content.trim()}\n</prompt>`
      }
    }
    
    // Ensure we have some improvements
    if (improvements.length === 0) {
      improvements = [
        'Enhanced XML structure and formatting',
        'Improved clarity and specificity',
        'Optimized for Claude AI processing'
      ]
    }
    
    return {
      enrichedPrompt: enrichedPrompt.trim(),
      improvements,
      qualityScore
    }
  } catch (error) {
    logger.error('Failed to parse GPT response:', error)
    return {
      enrichedPrompt: `<prompt>\n${content}\n</prompt>`,
      improvements: ['Enhanced with AI optimization'],
      qualityScore: isPro ? 8.0 : 7.0
    }
  }
}

// Generate fallback prompt when GPT fails
function generateFallbackPrompt({ task, context, requirements, role, style, output }) {
  let xml = '<prompt>\n'
  
  if (role) {
    xml += `  <role>${escapeXml(role)}</role>\n`
  }
  
  if (task) {
    xml += `  <task>\n    ${escapeXml(task)}\n  </task>\n`
  }
  
  if (context) {
    xml += `  <context>\n    ${escapeXml(context)}\n  </context>\n`
  }
  
  if (requirements) {
    xml += `  <requirements>\n    ${escapeXml(requirements)}\n  </requirements>\n`
  }
  
  if (style) {
    xml += `  <style>\n    ${escapeXml(style)}\n  </style>\n`
  }
  
  if (output) {
    xml += `  <output>\n    ${escapeXml(output)}\n  </output>\n`
  }
  
  xml += '</prompt>'
  
  return xml
}

// Escape XML special characters
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Log usage for analytics
async function logUsage({ userId, action, tier, tokensUsed, processingTime, success, error }) {
  try {
    if (!database.supabase) return
    
    await database.supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        action_type: action,
        metadata: {
          tier,
          tokens_used: tokensUsed,
          processing_time_ms: processingTime,
          error: error || null
        },
        success
      })
  } catch (err) {
    logger.error('Failed to log usage:', err)
  }
}

// GET /api/v1/enrichment/templates
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'coding',
        name: 'Code Assistant',
        description: 'Template for programming and development tasks',
        role: 'Expert Software Developer',
        template: {
          task: 'Help me with coding: {task}',
          context: 'Working on a software project',
          requirements: 'Clean, maintainable, well-documented code'
        }
      },
      {
        id: 'writing',
        name: 'Content Writer',
        description: 'Template for writing and content creation',
        role: 'Professional Content Writer',
        template: {
          task: 'Help me write: {task}',
          context: 'Creating content for {audience}',
          requirements: 'Engaging, clear, and well-structured content'
        }
      },
      {
        id: 'analysis',
        name: 'Data Analyst',
        description: 'Template for analysis and research tasks',
        role: 'Senior Data Analyst',
        template: {
          task: 'Analyze: {task}',
          context: 'Business intelligence and decision support',
          requirements: 'Thorough, data-driven analysis with actionable insights'
        }
      },
      {
        id: 'design',
        name: 'UX Designer',
        description: 'Template for design and user experience tasks',
        role: 'Senior UX Designer',
        template: {
          task: 'Design: {task}',
          context: 'Creating user-centered solutions',
          requirements: 'Accessible, intuitive, and user-friendly design'
        }
      }
    ]

    res.json({
      success: true,
      data: templates
    })
  } catch (error) {
    logger.error('Error fetching templates:', error)
    res.status(500).json({
      error: 'Failed to fetch templates',
      message: 'Could not retrieve enhancement templates'
    })
  }
})

// GET /api/v1/enrichment/stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to view your stats'
      })
    }
    
    // Get user's enhancement stats
    const { data: stats, error } = await database.supabase
      .from('usage_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('action_type', 'prompt_enhancement')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    
    if (error) {
      throw error
    }
    
    const totalEnhancements = stats.length
    const successfulEnhancements = stats.filter(s => s.success).length
    const totalTokens = stats.reduce((sum, s) => sum + (s.metadata?.tokens_used || 0), 0)
    const avgProcessingTime = stats.length > 0 
      ? stats.reduce((sum, s) => sum + (s.metadata?.processing_time_ms || 0), 0) / stats.length
      : 0
    
    res.json({
      success: true,
      data: {
        totalEnhancements,
        successfulEnhancements,
        successRate: totalEnhancements > 0 ? (successfulEnhancements / totalEnhancements * 100).toFixed(1) : 0,
        totalTokens,
        avgProcessingTime: Math.round(avgProcessingTime),
        period: 'last_30_days'
      }
    })
  } catch (error) {
    logger.error('Error fetching enhancement stats:', error)
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: 'Could not retrieve enhancement statistics'
    })
  }
})

export default router 