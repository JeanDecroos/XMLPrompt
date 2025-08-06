import crypto from 'crypto'
import QRCode from 'qrcode'
import { supabase } from '../config/database.js'
import logger from '../utils/logger.js'

class MFAService {
  /**
   * Generate a new TOTP secret
   */
  static generateTOTPSecret() {
    // Generate a random 32-character base32 secret
    const secret = crypto.randomBytes(20).toString('base32').replace(/=/g, '')
    return secret
  }

  /**
   * Generate QR code URL for authenticator apps
   */
  static generateQRCodeURL(issuer, account, secret) {
    const encodedIssuer = encodeURIComponent(issuer)
    const encodedAccount = encodeURIComponent(account)
    const url = `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`
    return url
  }

  /**
   * Generate QR code data URL
   */
  static async generateQRCodeDataURL(issuer, account, secret) {
    try {
      const otpauthUrl = this.generateQRCodeURL(issuer, account, secret)
      const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrCodeDataURL
    } catch (error) {
      logger.error('Error generating QR code:', error)
      // Fallback to placeholder
      return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
    }
  }

  /**
   * Verify TOTP code
   */
  static verifyTOTPCode(code, secret, window = 1) {
    try {
      // For now, implement basic validation
      // In production, use a proper TOTP library like 'speakeasy'
      const currentTime = Math.floor(Date.now() / 1000)
      const timeStep = 30
      
      // Generate expected codes for current and adjacent time windows
      const codes = []
      for (let i = -window; i <= window; i++) {
        const time = currentTime + (i * timeStep)
        const expectedCode = this.generateTOTPCode(secret, time)
        codes.push(expectedCode)
      }
      
      return codes.includes(code)
    } catch (error) {
      logger.error('Error verifying TOTP code:', error)
      return false
    }
  }

  /**
   * Generate TOTP code for a specific time
   */
  static generateTOTPCode(secret, time) {
    try {
      // Convert secret from base32 to buffer
      const secretBuffer = this.base32Decode(secret)
      
      // Convert time to buffer (big-endian)
      const timeBuffer = Buffer.alloc(8)
      timeBuffer.writeBigUInt64BE(BigInt(time), 0)
      
      // Generate HMAC-SHA1
      const hmac = crypto.createHmac('sha1', secretBuffer)
      hmac.update(timeBuffer)
      const hash = hmac.digest()
      
      // Generate 6-digit code
      const offset = hash[hash.length - 1] & 0xf
      const code = ((hash[offset] & 0x7f) << 24) |
                   ((hash[offset + 1] & 0xff) << 16) |
                   ((hash[offset + 2] & 0xff) << 8) |
                   (hash[offset + 3] & 0xff)
      
      return (code % 1000000).toString().padStart(6, '0')
    } catch (error) {
      logger.error('Error generating TOTP code:', error)
      return null
    }
  }

  /**
   * Base32 decode
   */
  static base32Decode(str) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    const padding = '='
    
    let output = ''
    let bits = 0
    let buffer = 0
    
    for (let i = 0; i < str.length; i++) {
      const char = str[i].toUpperCase()
      if (char === padding) break
      
      const index = alphabet.indexOf(char)
      if (index === -1) continue
      
      buffer = (buffer << 5) | index
      bits += 5
      
      while (bits >= 8) {
        output += String.fromCharCode((buffer >> (bits - 8)) & 0xff)
        bits -= 8
      }
    }
    
    return Buffer.from(output, 'binary')
  }

  /**
   * Generate backup codes
   */
  static generateBackupCodes(count = 8) {
    const codes = []
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      codes.push(code)
    }
    return codes
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId, secret, backupCodes) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          security_two_factor_enabled: true,
          security_two_factor_secret: secret,
          security_backup_codes: backupCodes,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (error) {
        logger.error('Error enabling 2FA:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      logger.error('Failed to enable 2FA:', error)
      throw error
    }
  }

  /**
   * Disable 2FA for user
   */
  static async disable2FA(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          security_two_factor_enabled: false,
          security_two_factor_secret: null,
          security_backup_codes: [],
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (error) {
        logger.error('Error disabling 2FA:', error)
        throw error
      }

      return data[0]
    } catch (error) {
      logger.error('Failed to disable 2FA:', error)
      throw error
    }
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(userId, backupCode) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('security_backup_codes')
        .eq('id', userId)
        .single()

      if (error) {
        logger.error('Error fetching backup codes:', error)
        throw error
      }

      const backupCodes = data.security_backup_codes || []
      const isValid = backupCodes.includes(backupCode)

      if (isValid) {
        // Remove used backup code
        const updatedCodes = backupCodes.filter(code => code !== backupCode)
        await supabase
          .from('profiles')
          .update({
            security_backup_codes: updatedCodes,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
      }

      return isValid
    } catch (error) {
      logger.error('Failed to verify backup code:', error)
      throw error
    }
  }

  /**
   * Generate new backup codes
   */
  static async generateNewBackupCodes(userId) {
    try {
      const newBackupCodes = this.generateBackupCodes()
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          security_backup_codes: newBackupCodes,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()

      if (error) {
        logger.error('Error generating new backup codes:', error)
        throw error
      }

      return { backupCodes: newBackupCodes, user: data[0] }
    } catch (error) {
      logger.error('Failed to generate new backup codes:', error)
      throw error
    }
  }

  /**
   * Get user's 2FA status
   */
  static async get2FAStatus(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('security_two_factor_enabled, security_backup_codes, security_last_login_at')
        .eq('id', userId)
        .single()

      if (error) {
        logger.error('Error fetching 2FA status:', error)
        throw error
      }

      return {
        enabled: data.security_two_factor_enabled || false,
        backupCodes: data.security_backup_codes || [],
        lastLoginAt: data.security_last_login_at
      }
    } catch (error) {
      logger.error('Failed to get 2FA status:', error)
      throw error
    }
  }

  /**
   * Update last login time
   */
  static async updateLastLogin(userId) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          security_last_login_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) {
        logger.error('Error updating last login:', error)
        throw error
      }
    } catch (error) {
      logger.error('Failed to update last login:', error)
      throw error
    }
  }

  /**
   * Validate TOTP code format
   */
  static validateTOTPCode(code) {
    return /^\d{6}$/.test(code)
  }

  /**
   * Validate backup code format
   */
  static validateBackupCode(code) {
    return /^[A-F0-9]{8}$/.test(code)
  }

  /**
   * Create login history entry
   */
  static async createLoginHistory(userId, ipAddress, userAgent, success, method = 'password') {
    try {
      const loginEntry = {
        user_id: userId,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: success,
        method: method,
        timestamp: new Date().toISOString()
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          security_login_history: supabase.sql`COALESCE(security_login_history, '[]'::jsonb) || ${JSON.stringify(loginEntry)}::jsonb`
        })
        .eq('id', userId)

      if (error) {
        logger.error('Error creating login history:', error)
        throw error
      }
    } catch (error) {
      logger.error('Failed to create login history:', error)
      throw error
    }
  }
}

export default MFAService 