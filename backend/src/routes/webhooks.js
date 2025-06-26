import express from 'express'
import { database } from '../config/database.js'
import { logger } from '../utils/logger.js'
import crypto from 'crypto'

const router = express.Router()

// Middleware to verify webhook signatures
const verifyWebhookSignature = (secret) => {
  return (req, res, next) => {
    const signature = req.headers['x-webhook-signature']
    if (!signature) {
      return res.status(401).json({
        error: 'Missing signature',
        message: 'Webhook signature is required'
      })
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(req.body))
      .digest('hex')

    if (signature !== `sha256=${expectedSignature}`) {
      return res.status(401).json({
        error: 'Invalid signature',
        message: 'Webhook signature verification failed'
      })
    }

    next()
  }
}

// POST /api/v1/webhooks/stripe
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature']
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      logger.warn('Stripe webhook secret not configured')
      return res.status(500).json({
        error: 'Webhook not configured',
        message: 'Stripe webhook secret is not set'
      })
    }

    // In a real implementation, you would verify the Stripe signature here
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)

    // For now, parse the body as JSON
    const event = JSON.parse(req.body.toString())

    logger.info('Received Stripe webhook:', { type: event.type, id: event.id })

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      
      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    logger.error('Error processing Stripe webhook:', error)
    res.status(500).json({
      error: 'Webhook processing failed',
      message: 'Failed to process Stripe webhook'
    })
  }
})

// POST /api/v1/webhooks/supabase
router.post('/supabase', async (req, res) => {
  try {
    const { type, table, record, old_record } = req.body

    logger.info('Received Supabase webhook:', { type, table })

    // Handle different database events
    switch (table) {
      case 'users':
        if (type === 'INSERT') {
          await handleNewUser(record)
        }
        break
      
      case 'prompts':
        if (type === 'INSERT') {
          await handleNewPrompt(record)
        }
        break
      
      default:
        logger.info(`Unhandled Supabase table: ${table}`)
    }

    res.json({ received: true })
  } catch (error) {
    logger.error('Error processing Supabase webhook:', error)
    res.status(500).json({
      error: 'Webhook processing failed',
      message: 'Failed to process Supabase webhook'
    })
  }
})

// Helper functions for webhook processing
async function handleSubscriptionUpdate(subscription) {
  try {
    const customerId = subscription.customer
    const status = subscription.status
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

    // Find user by Stripe customer ID
    const { data: user, error } = await database
      .from('users')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (error || !user) {
      logger.warn(`User not found for Stripe customer: ${customerId}`)
      return
    }

    // Update subscription status
    await database
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        stripe_subscription_id: subscription.id,
        status: status,
        current_period_end: currentPeriodEnd.toISOString(),
        updated_at: new Date().toISOString()
      })

    logger.info(`Updated subscription for user ${user.id}:`, { status, currentPeriodEnd })
  } catch (error) {
    logger.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionCancellation(subscription) {
  try {
    const { error } = await database
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) throw error

    logger.info(`Canceled subscription: ${subscription.id}`)
  } catch (error) {
    logger.error('Error handling subscription cancellation:', error)
  }
}

async function handlePaymentSucceeded(invoice) {
  try {
    // Log successful payment
    logger.info(`Payment succeeded for invoice: ${invoice.id}`, {
      amount: invoice.amount_paid,
      customer: invoice.customer
    })

    // You could send a thank you email or update payment history here
  } catch (error) {
    logger.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice) {
  try {
    // Log failed payment
    logger.warn(`Payment failed for invoice: ${invoice.id}`, {
      amount: invoice.amount_due,
      customer: invoice.customer
    })

    // You could send a payment retry email or update account status here
  } catch (error) {
    logger.error('Error handling payment failure:', error)
  }
}

async function handleNewUser(user) {
  try {
    logger.info(`New user registered: ${user.id}`, {
      email: user.email,
      createdAt: user.created_at
    })

    // You could send a welcome email or set up default preferences here
  } catch (error) {
    logger.error('Error handling new user:', error)
  }
}

async function handleNewPrompt(prompt) {
  try {
    logger.info(`New prompt created: ${prompt.id}`, {
      userId: prompt.user_id,
      model: prompt.model_used
    })

    // You could update usage statistics or trigger analytics here
  } catch (error) {
    logger.error('Error handling new prompt:', error)
  }
}

export default router 