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
    userTier: { type: 'string', enum: ['free', 'pro', 'enterprise'] },
    enrichmentLevel: { type: 'number', minimum: 0, maximum: 100 }
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
  console.log('DEBUG: Enhancement request received')
  try {
      const { task, context, requirements, role, style, output, userTier, enrichmentLevel = 50 } = req.body
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

      // Calculate containment level early for bypass check
      const containmentLevel = Math.round(enrichmentLevel / 5) * 5
      
      // Anti-hallucination bypass for minimal inputs at low enrichment levels
      let enhancedPrompt
      let tokensUsed = 0
      const startTime = Date.now()
      
      // ENFORCE RESTRICTIONS: For minimal inputs at 5% or below, bypass AI entirely
      const isMinimalInput = task.length < 10 || (context && context.length < 10)
      const isLowEnrichment = containmentLevel <= 5
      
      logger.info('Enrichment analysis', {
        containmentLevel,
        taskLength: task.length,
        contextLength: context?.length || 0,
        enrichmentLevel,
        isMinimalInput,
        isLowEnrichment
      })
      
      console.log('DEBUG: About to check bypass condition')
      if (true) { // FORCE BYPASS FOR TESTING
        console.log('DEBUG: Bypass condition is TRUE - entering bypass logic')
        // FORCE BYPASS: For minimal inputs at 5% or below, bypass AI entirely
        logger.info('ENFORCING RESTRICTIONS - Bypassing AI for minimal input', {
          containmentLevel,
          taskLength: task.length,
          contextLength: context?.length || 0,
          enrichmentLevel
        })
        
        // Create minimal output with NO expansion
        enhancedPrompt = `<task>${task}</task>`
        if (context && context.trim()) {
          enhancedPrompt += `\n<context>${context}</context>`
        }
        if (requirements && requirements.trim()) {
          enhancedPrompt += `\n<requirements>${requirements}</requirements>`
        }
        if (role && role.trim()) {
          enhancedPrompt += `\n<role>${role}</role>`
        }
        if (style && style.trim()) {
          enhancedPrompt += `\n<style>${style}</style>`
        }
        if (output && output.trim()) {
          enhancedPrompt += `\n<output_format>${output}</output_format>`
        }
        tokensUsed = 50 // Minimal token usage for bypass
        
        logger.info('BYPASS COMPLETED - Minimal output generated', {
          outputLength: enhancedPrompt.length,
          tokensUsed
        })
        
        // Skip all AI processing and go directly to response
        const processingTime = Date.now() - startTime
        
        // Parse the response to extract structured data
        const enhancementResult = parseEnhancementResponse(enhancedPrompt, isPro)

        // Log successful usage
        if (userId) {
          await logUsage(userId, 'enhancement', {
            resourceType: 'prompt',
            tokensUsed,
            processingTime,
            modelUsed: 'bypass',
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
              modelUsed: 'bypass',
              timestamp: new Date().toISOString()
            }
          }
        }

        // Add quota info for authenticated users
        if (req.quotaInfo) {
          response.quota = {
            remaining: req.quotaInfo.remaining,
            resetDate: req.quotaInfo.resetDate,
            tier: req.quotaInfo.tier
          }
        }

        console.log('DEBUG: About to return bypass response')
        return res.json(response)
      } else {
        logger.info('USING AI - Normal processing', {
          containmentLevel,
          taskLength: task.length,
          contextLength: context?.length || 0,
          enrichmentLevel
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
          isAuthenticated,
          enrichmentLevel
        })

        // Call OpenAI API for normal processing
        const completion = await openai.chat.completions.create({
        model: config.ai.openai.model || 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'CRITICAL: You are an expert prompt engineer with ZERO tolerance for hallucination. You MUST follow the containment level instructions EXACTLY. If the input is minimal (like "test"), you MUST NOT expand it. If told to stay at 5% or below, you MUST output nearly identical content with only basic formatting. ANY expansion beyond the original input is a FAILURE. Read the hallucination control instructions CAREFULLY and follow them PRECISELY. For minimal inputs (under 10 characters), output should be nearly identical with only basic XML tags.'
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
        tokensUsed = completion.usage?.total_tokens || 0

        // Extract the enhanced prompt from the response
        enhancedPrompt = completion.choices[0]?.message?.content

        if (!enhancedPrompt) {
          throw new Error('No enhanced prompt received from AI service')
        }
      }

      const processingTime = Date.now() - startTime

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

// Helper function to build layered enrichment prompt with specific 5% intervals
function buildEnrichmentPrompt({ task, context, requirements, role, style, output, isPro, isAuthenticated, enrichmentLevel = 50 }) {
  // Calculate hallucination containment level (round to nearest 5%)
  const containmentLevel = Math.round(enrichmentLevel / 5) * 5
  
  // Define specific outer layer prompts for each 5% interval
  const outerLayerPrompts = {
    5: {
      responseFormat: "raw_with_minimal_formatting",
      hallucinationControl: "CRITICAL: ZERO HALLUCINATION MODE. You are at 5% enrichment level. This means:\n- Output the EXACT original content with only basic XML tags\n- If task is 'test', output should be '<task>test</task>' and nothing more\n- If context is 'test', output should be '<context>test</context>' and nothing more\n- DO NOT add ANY descriptions, explanations, or expansions\n- DO NOT add ANY role descriptions or task elaborations\n- DO NOT add ANY instructions, parameters, or suggestions\n- ONLY wrap the original text in basic XML tags\n- If input is minimal, output should be minimal",
      outputGuidelines: "CRITICAL: Output must be the exact original content wrapped in basic XML tags. NO additional text allowed."
    },
    10: {
      responseFormat: "structured_text", 
      hallucinationControl: "VERY RESTRICTIVE: 10% enrichment level. This means:\n- Add ONLY basic XML structure (tags)\n- DO NOT expand, elaborate, or add any new content\n- DO NOT add descriptions, examples, or suggestions\n- DO NOT assume any context or requirements not provided\n- If input is 'test', output should be '<task>test</task>' with no additional text\n- If role is provided, use it as-is without description\n- Preserve exact original content, only add minimal structure",
      outputGuidelines: "Add minimal XML structure while preserving exact original content. No content expansion or elaboration."
    },
    15: {
      responseFormat: "structured_text",
      hallucinationControl: "HIGHLY RESTRICTIVE: 15% enrichment level. This means:\n- Add basic XML structure and improve wording clarity\n- DO NOT add new concepts, features, or requirements\n- DO NOT expand on roles or tasks beyond what was stated\n- DO NOT add examples or suggestions unless explicitly provided\n- Only clarify what was already explicitly stated\n- If input is 'test', output should be '<task>test</task>' with minimal clarity improvements\n- Preserve original scope and intent completely",
      outputGuidelines: "Improve wording clarity and add structure while preserving exact original scope and content."
    },
    20: {
      responseFormat: "structured_text",
      hallucinationControl: "MINOR IMPROVEMENTS: Add essential details that are directly implied by the task. No creative additions or assumptions.",
      outputGuidelines: "Include only details that are logically necessary for the stated task."
    },
    25: {
      responseFormat: "basic_xml",
      hallucinationControl: "CONSERVATIVE ENHANCEMENT: Add XML structure and clarify requirements that are implicit in the task. No speculative features.",
      outputGuidelines: "Use proper XML tags and clarify implicit requirements without adding new ones."
    },
    30: {
      responseFormat: "basic_xml",
      hallucinationControl: "MODERATE STRUCTURE: Enhance organization and add standard practices that are commonly expected for this type of task.",
      outputGuidelines: "Include industry-standard approaches that are typically required for the stated task type."
    },
    35: {
      responseFormat: "enhanced_xml",
      hallucinationControl: "STANDARD ENHANCEMENT: Add commonly expected features and best practices. Include only well-established requirements for this task type.",
      outputGuidelines: "Incorporate standard best practices and commonly expected features for this domain."
    },
    40: {
      responseFormat: "enhanced_xml",
      hallucinationControl: "PRACTICAL ADDITIONS: Include practical considerations and implementation details that are standard for professional work in this area.",
      outputGuidelines: "Add professional-grade considerations and implementation details that are industry standard."
    },
    45: {
      responseFormat: "detailed_xml",
      hallucinationControl: "PROFESSIONAL ENHANCEMENT: Add professional-grade features and considerations. Include examples that are directly relevant to the core task.",
      outputGuidelines: "Enhance with professional features and include relevant, task-specific examples."
    },
    50: {
      responseFormat: "detailed_xml",
      hallucinationControl: "BALANCED ENHANCEMENT: Add useful features and examples while maintaining focus on the core task. Include error handling and edge cases.",
      outputGuidelines: "Balance enhancement with focus. Include error handling and common edge cases."
    },
    55: {
      responseFormat: "detailed_xml_with_examples",
      hallucinationControl: "ENHANCED DETAIL: Add comprehensive examples and advanced features that directly support the main task. Include performance considerations.",
      outputGuidelines: "Provide detailed examples and advanced features that enhance the core functionality."
    },
    60: {
      responseFormat: "detailed_xml_with_examples",
      hallucinationControl: "ADVANCED FEATURES: Include advanced functionality and optimization techniques. Add relevant integrations and scalability considerations.",
      outputGuidelines: "Include advanced features, optimizations, and scalability considerations."
    },
    65: {
      responseFormat: "comprehensive_xml",
      hallucinationControl: "COMPREHENSIVE APPROACH: Add multiple implementation approaches and advanced techniques. Include testing and validation strategies.",
      outputGuidelines: "Provide comprehensive coverage with multiple approaches and validation strategies."
    },
    70: {
      responseFormat: "comprehensive_xml",
      hallucinationControl: "EXPERT-LEVEL ENHANCEMENT: Include expert techniques and advanced patterns. Add monitoring and maintenance considerations.",
      outputGuidelines: "Apply expert-level techniques with monitoring and maintenance considerations."
    },
    75: {
      responseFormat: "comprehensive_xml_with_reasoning",
      hallucinationControl: "ADVANCED EXPERTISE: Include cutting-edge techniques and architectural patterns. Add detailed reasoning for design decisions.",
      outputGuidelines: "Apply advanced techniques with detailed reasoning for all design decisions."
    },
    80: {
      responseFormat: "comprehensive_xml_with_reasoning",
      hallucinationControl: "HIGH-LEVEL ENHANCEMENT: Include sophisticated patterns and enterprise-grade considerations. Add comprehensive documentation and reasoning.",
      outputGuidelines: "Implement sophisticated patterns with enterprise-grade features and comprehensive documentation."
    },
    85: {
      responseFormat: "advanced_xml_with_reasoning",
      hallucinationControl: "SOPHISTICATED ENHANCEMENT: Add innovative approaches and cutting-edge techniques. Include detailed architectural reasoning and future-proofing.",
      outputGuidelines: "Apply innovative approaches with detailed architectural reasoning and future-proofing strategies."
    },
    90: {
      responseFormat: "advanced_xml_with_reasoning",
      hallucinationControl: "NEAR-MAXIMUM ENHANCEMENT: Include experimental techniques and advanced optimizations. Verify all additions are technically sound.",
      outputGuidelines: "Include experimental techniques while ensuring all additions are technically verified and sound."
    },
    95: {
      responseFormat: "maximum_xml_with_reasoning",
      hallucinationControl: "MAXIMUM SAFE ENHANCEMENT: Push boundaries with advanced techniques while maintaining accuracy. Include innovative solutions but verify feasibility.",
      outputGuidelines: "Push creative boundaries while maintaining technical accuracy and feasibility verification."
    },
    100: {
      responseFormat: "maximum_xml_with_reasoning",
      hallucinationControl: "FULL CREATIVE ENHANCEMENT: Maximum creativity and innovation allowed. Include cutting-edge approaches but mark speculative elements clearly.",
      outputGuidelines: "Apply maximum creativity with clear marking of speculative or experimental elements."
    }
  }
  
  // Fill in any missing intervals with interpolated values
  for (let level = 5; level <= 100; level += 5) {
    if (!outerLayerPrompts[level]) {
      // Find nearest defined levels
      const lowerLevel = Math.max(...Object.keys(outerLayerPrompts).map(Number).filter(l => l < level))
      const upperLevel = Math.min(...Object.keys(outerLayerPrompts).map(Number).filter(l => l > level))
      
      if (lowerLevel && upperLevel) {
        outerLayerPrompts[level] = {
          responseFormat: outerLayerPrompts[lowerLevel].responseFormat,
          hallucinationControl: `LEVEL ${level}% ENHANCEMENT: Intermediate enhancement between ${lowerLevel}% and ${upperLevel}% levels. ${outerLayerPrompts[lowerLevel].hallucinationControl}`,
          outputGuidelines: outerLayerPrompts[lowerLevel].outputGuidelines
        }
      }
    }
  }
  
  // Get the specific outer layer configuration for this containment level
  const outerConfig = outerLayerPrompts[containmentLevel] || outerLayerPrompts[50]
  
  // Build the inner prompt content
  const innerPromptContent = `
<task>
${task}
</task>

<role>
${role}
</role>

${context ? `<context>
${context}
</context>` : ''}

${requirements ? `<requirements>
${requirements}
</requirements>` : ''}

${style ? `<style>
${style}
</style>` : ''}

${output ? `<output_format>
${output}
</output_format>` : ''}
  `.trim()

  // Create the specific layered prompt for this exact percentage
  const layeredPrompt = `
<outer_layer>
  <containment_level>${containmentLevel}% hallucination containment</containment_level>
  <response_format>${outerConfig.responseFormat}</response_format>
  
  <input_analysis>
    Task length: ${task.length} characters
    Context length: ${context?.length || 0} characters
    Requirements length: ${requirements?.length || 0} characters
    Input type: ${task.length < 10 ? 'MINIMAL INPUT' : 'NORMAL INPUT'}
  </input_analysis>
  
  <hallucination_control>
    ${outerConfig.hallucinationControl}
    
    CRITICAL CONSTRAINTS FOR ${containmentLevel}%:
    - Do not exceed the specified enhancement level
    - Stay within the bounds of what's explicitly or implicitly stated
    - If unsure about any addition, err on the side of caution
    - Mark any speculative elements clearly if enhancement level permits
    
    ${task.length < 10 ? 'MINIMAL INPUT DETECTED: If task is less than 10 characters, treat as placeholder and DO NOT expand. Output should be nearly identical to input with only basic XML structure.' : ''}
  </hallucination_control>
  
  <inner_prompt>
${innerPromptContent}
  </inner_prompt>
  
  <output_requirements>
    ${outerConfig.outputGuidelines}
    
    Enhancement Level: ${containmentLevel}%
    User Tier: ${isPro ? 'Professional' : 'Standard'}
    Response must be enhanced XML that respects the exact ${containmentLevel}% containment level.
    
    ${task.length < 10 ? 'MINIMAL INPUT RULE: For inputs under 10 characters, output should be nearly identical with only basic XML formatting.' : ''}
  </output_requirements>
</outer_layer>
  `.trim()

  return layeredPrompt
}

// Helper function to parse AI response
function parseEnhancementResponse(response, isPro) {
  try {
    // Check if this is a bypass response (simple XML without enhanced_prompt tags)
    const hasEnhancedPromptTags = response.includes('<enhanced_prompt>')
    
    if (!hasEnhancedPromptTags) {
      // This is a bypass response - return it as-is
      return {
        enhancedPrompt: response,
        suggestions: ['Minimal formatting applied'],
        explanation: 'Prompt preserved with minimal formatting (bypass mode)'
      }
    }
    
    // This is an AI response - parse it normally
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