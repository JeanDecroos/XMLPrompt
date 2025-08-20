import express from 'express'
import MFAService from '../services/mfaService.js'
import { database } from '../config/database.js'
import { authMiddleware } from '../middleware/auth.js'
import { rateLimitMiddleware } from '../middleware/rateLimit.js'
import { validationMiddleware } from '../middleware/validation.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * @route GET /api/security/2fa/status
 * @desc Get 2FA status for current user
 * @access Private
 */
router.get('/2fa/status',
  authMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      
      // Get 2FA status from database
      const { data: profile, error } = await database.supabase
        .from('profiles')
        .select('security_two_factor_enabled, security_two_factor_secret')
        .eq('id', user.id)
        .single()

      if (error) {
        logger.error('Error fetching 2FA status:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch 2FA status'
        })
      }

      res.json({
        enabled: profile?.security_two_factor_enabled || false
      })
    } catch (error) {
      logger.error('Error getting 2FA status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get 2FA status'
      })
    }
  }
)

/**
 * @route POST /api/security/2fa/enable
 * @desc Enable 2FA for user (generate secret and QR code)
 * @access Private
 */
router.post('/2fa/enable',
  authMiddleware,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      
      // Generate TOTP secret
      const secret = MFAService.generateTOTPSecret()
      
      // Generate QR code data URL
      const qrCodeDataURL = await MFAService.generateQRCodeDataURL('Promptr', user.email, secret)
      
      // Generate backup codes
      const backupCodes = MFAService.generateBackupCodes()
      
      // Store the secret temporarily (will be confirmed when user verifies)
      const { error } = await database.supabase
        .from('profiles')
        .update({
          security_two_factor_secret: secret,
          security_backup_codes: backupCodes,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        logger.error('Error storing 2FA secret:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to store 2FA secret'
        })
      }

      // Generate otpauth URL for QR code
      const otpauthUrl = `otpauth://totp/Promptr:${encodeURIComponent(user.email)}?secret=${secret}&issuer=Promptr`
      
      res.json({
        otpauthUrl
      })
    } catch (error) {
      logger.error('Error enabling 2FA:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to enable 2FA'
      })
    }
  }
)

/**
 * @route POST /api/security/2fa/verify
 * @desc Verify 2FA code and complete setup
 * @access Private
 */
router.post('/2fa/verify',
  authMiddleware,
  rateLimitMiddleware,
  validationMiddleware({
    body: {
      code: { type: 'string', required: true, pattern: /^\d{6}$/ }
    }
  }),
  async (req, res) => {
    try {
      const { user } = req
      const { code } = req.body
      
      // Get the stored secret
      const { data: profile, error: fetchError } = await database.supabase
        .from('profiles')
        .select('security_two_factor_secret')
        .eq('id', user.id)
        .single()

      if (fetchError || !profile?.security_two_factor_secret) {
        return res.status(400).json({
          success: false,
          error: 'No 2FA setup in progress. Please start the setup process again.'
        })
      }

      // Verify TOTP code
      const isValid = MFAService.verifyTOTPCode(code, profile.security_two_factor_secret)
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code'
        })
      }

      // Enable 2FA
      const { error: updateError } = await database.supabase
        .from('profiles')
        .update({
          security_two_factor_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        logger.error('Error enabling 2FA:', updateError)
        return res.status(500).json({
          success: false,
          error: 'Failed to enable 2FA'
        })
      }

      res.json({
        enabled: true
      })
    } catch (error) {
      logger.error('Error verifying 2FA code:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to verify 2FA code'
      })
    }
  }
)

/**
 * @route POST /api/security/2fa/disable
 * @desc Disable 2FA for user
 * @access Private
 */
router.post('/2fa/disable',
  authMiddleware,
  rateLimitMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      
      // Disable 2FA
      const { error } = await database.supabase
        .from('profiles')
        .update({
          security_two_factor_enabled: false,
          security_two_factor_secret: null,
          security_backup_codes: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        logger.error('Error disabling 2FA:', error)
        return res.status(500).json({
          success: false,
          error: 'Failed to disable 2FA'
        })
      }

      res.json({
        success: true
      })
    } catch (error) {
      logger.error('Error disabling 2FA:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to disable 2FA'
      })
    }
  }
)

/**
 * @route GET /api/security/sessions
 * @desc Get active sessions for current user
 * @access Private
 */
router.get('/sessions',
  authMiddleware,
  async (req, res) => {
    try {
      const { user } = req
      
      // For now, return a simple session structure
      // This can be enhanced later to track actual sessions
      res.json({
        sessions: [
          {
            id: 'current',
            device: 'Current Device',
            ip: '127.0.0.1',
            location: 'Unknown',
            lastActiveAt: new Date().toISOString(),
            current: true
          }
        ]
      })
    } catch (error) {
      logger.error('Error getting sessions:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get sessions'
      })
    }
  }
)

export default router
