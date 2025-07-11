import express from 'express'
import { OpenAI } from 'openai'
import { logger } from '../utils/logger.js'
import { config } from '../config/index.js'
import { rateLimitMiddleware } from '../middleware/rateLimit.js'
import { quotaMiddleware, logUsage } from '../middleware/quotaMiddleware.js'
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
  quotaMiddleware('enhancement', { tokensRequired: 800 }),
  async (req, res) => {
  try {
      const { task, context, requirements, role, style, output, userTier } = req.body
      const userId = req.user?.id
      const isAuthenticated = !!req.user
      
      // Determine user tier from quota info (set by quota middleware)
      const tier = req.quotaInfo?.tier || 'free'
      const isPro = tier === 'pro' || tier === 'enterprise'
      
      logger.info('Prompt enhancement request', {
        userId,
        tier,
        taskLength: task.length,
        hasContext: !!context,
        hasRequirements: !!requirements,
        quotaRemaining: req.quotaInfo?.remaining
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

      const processingTime = Date.now() - startTime
      const tokensUsed = completion.usage?.total_tokens || 0

      // Extract the enhanced prompt from the response
      const enhancedPrompt = completion.choices[0]?.message?.content

      if (!enhancedPrompt) {
        throw new Error('No enhanced prompt received from AI service')
      }

      // Parse the response to extract structured data
      const enhancementResult = parseEnhancementResponse(enhancedPrompt, isPro)

      // Log successful usage
      if (userId) {
        await logUsage(userId, 'enhancement', {
          resourceType: 'prompt',
          tokensUsed,
          processingTime,
          modelUsed: config.ai.openai.model,
          success: true,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        })
      }

      // Add quota information to response
      const response = {
        success: true,
        data: {
          enhancedPrompt: enhancementResult.enhancedPrompt,
          suggestions: enhancementResult.suggestions,
          explanation: enhancementResult.explanation,
          metadata: {
            tier,
            isPro,
            tokensUsed,
            processingTime: `${((processingTime) / 1000).toFixed(1)}s`,
            modelUsed: config.ai.openai.model,
            timestamp: new Date().toISOString()
          }
        }
      }

      // Add quota info for authenticated users
      if (req.quotaInfo) {
        response.quota = {
          tier: req.quotaInfo.tier,
          remaining: req.quotaInfo.remaining,
          resetDates: {
            monthly: getNextMonthReset().toISOString()
          }
        }
      }

      logger.info('Prompt enhancement completed', {
        userId,
        tier,
        tokensUsed,
        processingTime: `${processingTime}ms`,
        success: true
      })

      res.json(response)
    } catch (error) {
      const processingTime = Date.now() - startTime

      // Log failed usage
      if (userId) {
        await logUsage(userId, 'enhancement', {
          resourceType: 'prompt',
          processingTime,
          success: false,
          error: error.message,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        })
      }

      logger.error('Prompt enhancement error:', {
        error: error.message,
        userId,
        tier: req.quotaInfo?.tier,
        processingTime: `${processingTime}ms`
      })

      if (error.code === 'insufficient_quota') {
        return res.status(402).json({
          error: 'Insufficient quota',
          message: 'Your account has insufficient quota for this request',
          upgradeUrl: '/pricing'
        })
      }

      res.status(500).json({
        error: 'Enhancement failed',
        message: 'Failed to enhance prompt. Please try again.',
        tier: req.quotaInfo?.tier || 'free'
      })
    }
  }
)

// GET /api/v1/enrichment/templates
router.get('/templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'content-creation',
        name: 'Content Creation',
        description: 'Optimized for blog posts, articles, and marketing content',
        tier: 'free',
        template: 'Create engaging content about {topic} for {audience}...'
      },
      {
        id: 'code-review',
        name: 'Code Review',
        description: 'Structured code analysis and improvement suggestions',
        tier: 'pro',
        template: 'Analyze this code for {language} focusing on {aspects}...'
      },
      {
        id: 'data-analysis',
        name: 'Data Analysis',
        description: 'Comprehensive data analysis and insights',
        tier: 'pro',
        template: 'Analyze the following dataset and provide insights on {metrics}...'
      }
    ]

    // Filter templates based on user tier
    const userTier = req.user?.subscription_tier || 'free'
    const availableTemplates = templates.filter(template => {
      if (template.tier === 'free') return true
      if (template.tier === 'pro' && ['pro', 'enterprise'].includes(userTier)) return true
      if (template.tier === 'enterprise' && userTier === 'enterprise') return true
      return false
    })

    res.json({
      success: true,
      data: {
        templates: availableTemplates,
        userTier,
        totalAvailable: availableTemplates.length,
        totalTemplates: templates.length
      }
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
        error: 'Authentication required'
      })
    }

    // Get user's enhancement statistics
    const { data: usageStats, error } = await database.supabase
      .from('usage_tracking')
      .select('action_type, success, tokens_used, model_used, created_at')
      .eq('user_id', userId)
      .eq('action_type', 'enhancement')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    const stats = {
      totalEnhancements: usageStats.length,
      successfulEnhancements: usageStats.filter(u => u.success).length,
      totalTokensUsed: usageStats.reduce((sum, u) => sum + (u.tokens_used || 0), 0),
      averageTokensPerEnhancement: 0,
      modelUsage: {},
      recentActivity: usageStats.slice(0, 10).map(u => ({
        date: u.created_at,
        success: u.success,
        tokensUsed: u.tokens_used,
        model: u.model_used
      }))
    }

    if (stats.totalEnhancements > 0) {
      stats.averageTokensPerEnhancement = Math.round(stats.totalTokensUsed / stats.totalEnhancements)
    }

    // Calculate model usage
    usageStats.forEach(usage => {
      const model = usage.model_used || 'unknown'
      stats.modelUsage[model] = (stats.modelUsage[model] || 0) + 1
    })

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    logger.error('Error fetching enhancement stats:', error)
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: 'Could not retrieve enhancement statistics'
    })
  }
})

// Helper function to build enrichment prompt
function buildEnrichmentPrompt({ task, context, requirements, role, style, output, isPro, isAuthenticated }) {
  const basePrompt = `
Please enhance the following prompt for optimal performance with Claude AI:

**Original Task:** ${task}
**Role:** ${role}
${context ? `**Context:** ${context}` : ''}
${requirements ? `**Requirements:** ${requirements}` : ''}
${style ? `**Style:** ${style}` : ''}
${output ? `**Desired Output:** ${output}` : ''}

**Enhancement Level:** ${isPro ? 'Professional' : 'Standard'}
**User Status:** ${isAuthenticated ? 'Authenticated' : 'Anonymous'}

Please provide an enhanced XML-structured prompt that:
1. Uses clear XML tags for organization
2. Includes specific instructions and examples
3. Optimizes for Claude's capabilities
4. ${isPro ? 'Includes advanced techniques like thinking tags and multi-step reasoning' : 'Focuses on clarity and effectiveness'}

Format your response as:
<enhanced_prompt>
[Your enhanced prompt here]
</enhanced_prompt>

<suggestions>
[3-5 specific improvement suggestions]
</suggestions>

<explanation>
[Brief explanation of the enhancements made]
</explanation>
`

  return basePrompt
}

// Helper function to parse AI response
function parseEnhancementResponse(response, isPro) {
  try {
    const enhancedPromptMatch = response.match(/<enhanced_prompt>([\s\S]*?)<\/enhanced_prompt>/)
    const suggestionsMatch = response.match(/<suggestions>([\s\S]*?)<\/suggestions>/)
    const explanationMatch = response.match(/<explanation>([\s\S]*?)<\/explanation>/)

    return {
      enhancedPrompt: enhancedPromptMatch ? enhancedPromptMatch[1].trim() : response,
      suggestions: suggestionsMatch ? 
        suggestionsMatch[1].trim().split('\n').filter(s => s.trim()).map(s => s.replace(/^[-*]\s*/, '')) :
        ['Enhanced prompt structure', 'Improved clarity', 'Better task specification'],
      explanation: explanationMatch ? 
        explanationMatch[1].trim() : 
        `Enhanced prompt with ${isPro ? 'professional' : 'standard'} optimization techniques`
    }
  } catch (error) {
    logger.error('Error parsing enhancement response:', error)
    return {
      enhancedPrompt: response,
      suggestions: ['Enhanced prompt structure'],
      explanation: 'Prompt enhanced successfully'
    }
  }
}

// Helper function for date calculation
function getNextMonthReset() {
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setDate(1)
  nextMonth.setHours(0, 0, 0, 0)
  return nextMonth
}

export default router 