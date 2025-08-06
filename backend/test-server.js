import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { OpenAI } from 'openai'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3005

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
  // Using OpenAI directly - GPT-4.1 nano is available natively
})

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: PORT,
    openaiConfigured: !!process.env.OPENAI_API_KEY
  })
})

// Simple enrichment endpoint
app.post('/api/v1/enrichment/enhance', async (req, res) => {
  try {
    console.log('Received enrichment request:', req.body)
    
    const { task, role, context, requirements, enrichmentLevel = 50 } = req.body
    
    if (!task || !role) {
      return res.status(400).json({
        success: false,
        error: 'Task and role are required'
      })
    }

    // ENFORCE RESTRICTIONS: For minimal inputs at 5% or below, bypass AI entirely
    const containmentLevel = Math.round(enrichmentLevel / 5) * 5
    const isMinimalInput = task.length < 10 || (context && context.length < 10)
    const isLowEnrichment = containmentLevel <= 5
    
    console.log('Enrichment analysis:', {
      containmentLevel,
      taskLength: task.length,
      contextLength: context?.length || 0,
      enrichmentLevel,
      isMinimalInput,
      isLowEnrichment
    })
    
    if (isLowEnrichment && isMinimalInput) {
      console.log('ENFORCING RESTRICTIONS - Bypassing AI for minimal input')
      
      // Create minimal output with NO expansion
      let enhancedPrompt = `<task>${task}</task>`
      if (context && context.trim()) {
        enhancedPrompt += `\n<context>${context}</context>`
      }
      if (requirements && requirements.trim()) {
        enhancedPrompt += `\n<requirements>${requirements}</requirements>`
      }
      if (role && role.trim()) {
        enhancedPrompt += `\n<role>${role}</role>`
      }
      
      console.log('BYPASS COMPLETED - Minimal output generated:', enhancedPrompt)
      
      return res.json({
        success: true,
        data: {
          enhancedPrompt,
          explanation: 'Prompt preserved with minimal formatting (bypass mode)',
          metadata: {
            tokensUsed: 50,
            modelUsed: 'bypass',
            timestamp: new Date().toISOString()
          }
        }
      })
    }

    // Build prompt for OpenAI
    const prompt = `You are an expert prompt engineer. Enhance this prompt for optimal AI performance.

Original Task: ${task}
Role: ${role}
${context ? `Context: ${context}` : ''}
${requirements ? `Requirements: ${requirements}` : ''}
Enhancement Level: ${enrichmentLevel}%

Create an enhanced XML-structured prompt. Respond with:
<enhanced_prompt>
[Your enhanced prompt here]
</enhanced_prompt>

<explanation>
[Brief explanation of improvements made]
</explanation>`

    // Try OpenAI first, fallback to demo if quota exceeded
    let enhancedPrompt, explanation, tokensUsed = 0
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4.1-nano', // Using GPT-4.1 nano directly from OpenAI
        messages: [
          {
            role: 'system',
            content: 'You are an expert prompt engineer who creates structured, effective prompts.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const response = completion.choices[0]?.message?.content
      tokensUsed = completion.usage?.total_tokens || 0
      
      // Extract enhanced prompt
      const enhancedMatch = response.match(/<enhanced_prompt>(.*?)<\/enhanced_prompt>/s)
      const explanationMatch = response.match(/<explanation>(.*?)<\/explanation>/s)
      
      enhancedPrompt = enhancedMatch ? enhancedMatch[1].trim() : response
      explanation = explanationMatch ? explanationMatch[1].trim() : 'Prompt enhanced with improved structure and clarity.'
      
    } catch (openaiError) {
      console.log('OpenAI error (using demo mode):', openaiError.message)
      
      // Demo enhancement based on enhancement level
      const intensity = enrichmentLevel <= 30 ? 'conservative' : 
                       enrichmentLevel <= 70 ? 'balanced' : 'creative'
      
      enhancedPrompt = `<prompt>
  <role>${role}</role>
  
  <task>
    ${task}
  </task>
  
  <context>
    ${context || `As a ${role}, focus on delivering professional, high-quality results.`}
  </context>
  
  <requirements>
    ${requirements || `- Follow best practices for ${role.toLowerCase()} work
- Ensure clarity and professionalism
- Adapt tone and style appropriately`}
  </requirements>
  
  <enhancement_level>${enrichmentLevel}% (${intensity})</enhancement_level>
  
  <instructions>
    Please provide a comprehensive response that:
    1. Addresses the core task thoroughly
    2. Maintains professional ${role.toLowerCase()} standards
    3. Includes relevant details and examples
    4. Uses appropriate formatting and structure
  </instructions>
</prompt>`
      
      explanation = `Enhanced with ${intensity} approach (${enrichmentLevel}% level). Added structured XML formatting, role-specific context, and clear instructions. ${openaiError.code === 'insufficient_quota' ? '⚠️ Demo mode active - add OpenAI credits for AI-powered enhancement.' : ''}`
    }

    res.json({
      success: true,
      data: {
        enhancedPrompt,
        explanation,
        metadata: {
          tokensUsed,
          modelUsed: 'gpt-4.1-nano',
          timestamp: new Date().toISOString()
        }
      }
    })
  } catch (error) {
    console.error('Enrichment error:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Enhanced test server running on http://localhost:${PORT}`)
  console.log(`🔑 OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`)
})
