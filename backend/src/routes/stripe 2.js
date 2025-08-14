import express from 'express'
import { logger } from '../utils/logger.js'
import { config } from '../config/index.js'

const router = express.Router()

// NOTE: Placeholder Stripe endpoints for future integration
// These do not call Stripe. They return mock data so the UI flow can be wired.

// POST /api/v1/stripe/setup-intent
router.post('/setup-intent', async (req, res) => {
  try {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
    const clientSecret = 'seti_test_placeholder_secret'
    logger.info('Stripe setup-intent placeholder requested')
    return res.json({ success: true, data: { clientSecret, publishableKey, placeholder: true } })
  } catch (error) {
    logger.error('Error creating placeholder setup intent:', error)
    return res.status(500).json({ success: false, error: 'Failed to create setup intent (placeholder)' })
  }
})

// POST /api/v1/stripe/attach-payment-method
router.post('/attach-payment-method', async (req, res) => {
  try {
    const { paymentMethodId } = req.body || {}
    logger.info('Stripe attach payment method placeholder', { paymentMethodId })
    return res.json({ success: true, data: { attached: !!paymentMethodId, placeholder: true } })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to attach payment method (placeholder)' })
  }
})

// GET /api/v1/stripe/customer/payment-methods
router.get('/customer/payment-methods', async (_req, res) => {
  try {
    // Return empty list for now
    return res.json({ success: true, data: { paymentMethods: [], provider: 'stripe', placeholder: true } })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch payment methods (placeholder)' })
  }
})

export default router
 
// Additional placeholder endpoints for hosted flows
// POST /api/v1/stripe/checkout-session
router.post('/checkout-session', async (_req, res) => {
  try {
    // In real integration: create Stripe Checkout Session server-side and return session.url
    const url = 'https://checkout.stripe.com/pay/test_placeholder'
    return res.json({ success: true, data: { url, placeholder: true } })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create checkout session (placeholder)' })
  }
})

// POST /api/v1/stripe/billing-portal
router.post('/billing-portal', async (_req, res) => {
  try {
    // In real integration: create Stripe Billing Portal session and return portal.url
    const url = 'https://billing.stripe.com/p/login/test_placeholder'
    return res.json({ success: true, data: { url, placeholder: true } })
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create billing portal session (placeholder)' })
  }
})


