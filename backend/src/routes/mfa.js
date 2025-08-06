import express from 'express'
import MFAService from '../services/mfaService.js'
import { authenticateUser } from '../middleware/auth.js'
import { rateLimit } from '../middleware/rateLimit.js'
import { validateRequest } from '../middleware/validation.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * @route POST /api/mfa/generate-secret
 * @desc Generate a new TOTP secret for 2FA setup
 * @access Private
 */
router.post('/generate-secret', 
  authenticateUser,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 5 }), // 5 requests per 5 minutes
  async (req, res) => {
    try {
      const { user } = req
      
      // Generate TOTP secret
      const secret = MFAService.generateTOTPSecret()
      
      // Generate QR code data URL
      const qrCodeDataURL = await MFAService.generateQRCodeDataURL('Promptr', user.email, secret)
      
      // Generate backup codes
      const backupCodes = MFAService.generateBackupCodes()
      
      res.json({
        success: true,
        data: {
          secret,
          qrCodeUrl: qrCodeDataURL,
          backupCodes
        }
      })
    } catch (error) {
      logger.error('Error generating TOTP secret:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate TOTP secret'
      })
    }
  }
)

/**
 * @route POST /api/mfa/verify-code
 * @desc Verify TOTP code from authenticator app
 * @access Private
 */
router.post('/verify-code',
  authenticateUser,
  rateLimit({ windowMs: 60 * 1000, max: 10 }), // 10 requests per minute
  validateRequest({
    body: {
      code: { type: 'string', required: true, pattern: /^\d{6}$/ },
      secret: { type: 'string', required: true }
    }
  }),
  async (req, res) => {
    try {
      const { code, secret } = req.body
      
      // Verify TOTP code
      const isValid = MFAService.verifyTOTPCode(code, secret)
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code'
        })
      }
      
      res.json({
        success: true,
        message: 'Code verified successfully'
      })
    } catch (error) {
      logger.error('Error verifying TOTP code:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to verify code'
      })
    }
  }
)

/**
 * @route POST /api/mfa/enable
 * @desc Enable 2FA for user
 * @access Private
 */
router.post('/enable',
  authenticateUser,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 3 }), // 3 requests per 5 minutes
  validateRequest({
    body: {
      secret: { type: 'string', required: true },
      backupCodes: { type: 'array', required: true }
    }
  }),
  async (req, res) => {
    try {
      const { user } = req
      const { secret, backupCodes } = req.body
      
      // Enable 2FA
      const updatedUser = await MFAService.enable2FA(user.id, secret, backupCodes)
      
      res.json({
        success: true,
        message: '2FA enabled successfully',
        data: {
          userId: updatedUser.id,
          twoFactorEnabled: updatedUser.security_two_factor_enabled
        }
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
 * @route POST /api/mfa/disable
 * @desc Disable 2FA for user
 * @access Private
 */
router.post('/disable',
  authenticateUser,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 3 }), // 3 requests per 5 minutes
  async (req, res) => {
    try {
      const { user } = req
      
      // Disable 2FA
      const updatedUser = await MFAService.disable2FA(user.id)
      
      res.json({
        success: true,
        message: '2FA disabled successfully',
        data: {
          userId: updatedUser.id,
          twoFactorEnabled: updatedUser.security_two_factor_enabled
        }
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
 * @route POST /api/mfa/verify-backup-code
 * @desc Verify backup code
 * @access Private
 */
router.post('/verify-backup-code',
  authenticateUser,
  rateLimit({ windowMs: 60 * 1000, max: 5 }), // 5 requests per minute
  validateRequest({
    body: {
      backupCode: { type: 'string', required: true, pattern: /^[A-F0-9]{8}$/ }
    }
  }),
  async (req, res) => {
    try {
      const { user } = req
      const { backupCode } = req.body
      
      // Verify backup code
      const isValid = await MFAService.verifyBackupCode(user.id, backupCode)
      
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid backup code'
        })
      }
      
      res.json({
        success: true,
        message: 'Backup code verified successfully'
      })
    } catch (error) {
      logger.error('Error verifying backup code:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to verify backup code'
      })
    }
  }
)

/**
 * @route POST /api/mfa/generate-backup-codes
 * @desc Generate new backup codes
 * @access Private
 */
router.post('/generate-backup-codes',
  authenticateUser,
  rateLimit({ windowMs: 5 * 60 * 1000, max: 3 }), // 3 requests per 5 minutes
  async (req, res) => {
    try {
      const { user } = req
      
      // Generate new backup codes
      const { backupCodes } = await MFAService.generateNewBackupCodes(user.id)
      
      res.json({
        success: true,
        message: 'New backup codes generated successfully',
        data: {
          backupCodes
        }
      })
    } catch (error) {
      logger.error('Error generating backup codes:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to generate backup codes'
      })
    }
  }
)

/**
 * @route GET /api/mfa/status
 * @desc Get user's 2FA status
 * @access Private
 */
router.get('/status',
  authenticateUser,
  async (req, res) => {
    try {
      const { user } = req
      
      // Get 2FA status
      const status = await MFAService.get2FAStatus(user.id)
      
      res.json({
        success: true,
        data: status
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
 * @route POST /api/mfa/login
 * @desc Handle 2FA during login
 * @access Public (but requires valid session)
 */
router.post('/login',
  rateLimit({ windowMs: 60 * 1000, max: 10 }), // 10 requests per minute
  validateRequest({
    body: {
      userId: { type: 'string', required: true },
      code: { type: 'string', required: true },
      method: { type: 'string', enum: ['totp', 'backup'], required: true }
    }
  }),
  async (req, res) => {
    try {
      const { userId, code, method } = req.body
      const ipAddress = req.ip || req.connection.remoteAddress
      const userAgent = req.get('User-Agent')
      
      let isValid = false
      
      if (method === 'totp') {
        // Get user's TOTP secret
        const { data: user } = await supabase
          .from('profiles')
          .select('security_two_factor_secret')
          .eq('id', userId)
          .single()
        
        if (!user?.security_two_factor_secret) {
          return res.status(400).json({
            success: false,
            error: '2FA not enabled for this user'
          })
        }
        
        isValid = MFAService.verifyTOTPCode(code, user.security_two_factor_secret)
      } else if (method === 'backup') {
        isValid = await MFAService.verifyBackupCode(userId, code)
      }
      
      if (!isValid) {
        // Log failed attempt
        await MFAService.createLoginHistory(userId, ipAddress, userAgent, false, method)
        
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code'
        })
      }
      
      // Log successful attempt
      await MFAService.createLoginHistory(userId, ipAddress, userAgent, true, method)
      await MFAService.updateLastLogin(userId)
      
      res.json({
        success: true,
        message: '2FA verification successful'
      })
    } catch (error) {
      logger.error('Error during 2FA login:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to verify 2FA'
      })
    }
  }
)

/**
 * @route GET /api/mfa/login-history
 * @desc Get user's login history
 * @access Private
 */
router.get('/login-history',
  authenticateUser,
  async (req, res) => {
    try {
      const { user } = req
      
      // Get login history from user's profile
      const { data, error } = await supabase
        .from('profiles')
        .select('security_login_history')
        .eq('id', user.id)
        .single()
      
      if (error) {
        throw error
      }
      
      const loginHistory = data.security_login_history || []
      
      res.json({
        success: true,
        data: {
          loginHistory: loginHistory.slice(-20) // Last 20 entries
        }
      })
    } catch (error) {
      logger.error('Error getting login history:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get login history'
      })
    }
  }
)

export default router 