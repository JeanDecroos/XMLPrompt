import { supabase } from '../lib/supabase'
import UserSettingsService from './userSettingsService'

class MFAService {
  /**
   * Generate a new TOTP secret for 2FA setup
   */
  static async generateTOTPSecret(userId, email) {
    try {
      // TODO: Call backend API to generate TOTP secret
      // const response = await fetch('/api/mfa/generate-secret', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, email })
      // })
      // return response.json()
      
      // For now, generate a mock secret (in production, this would be from backend)
      const mockSecret = this.generateMockSecret()
      const qrCodeUrl = this.generateQRCodeURL(email, mockSecret)
      
      return {
        secret: mockSecret,
        qrCodeUrl: qrCodeUrl,
        backupCodes: this.generateBackupCodes()
      }
    } catch (error) {
      console.error('Failed to generate TOTP secret:', error)
      throw error
    }
  }

  /**
   * Verify TOTP code from authenticator app
   */
  static async verifyTOTPCode(code, secret) {
    try {
      // TODO: Call backend API to verify TOTP code
      // const response = await fetch('/api/mfa/verify-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code, secret })
      // })
      // return response.json()
      
      // For now, accept any 6-digit code (in production, this would validate against secret)
      const isValid = /^\d{6}$/.test(code)
      
      if (!isValid) {
        throw new Error('Invalid verification code')
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to verify TOTP code:', error)
      throw error
    }
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId, secret, backupCodes) {
    try {
      // Update user settings with 2FA enabled
      await UserSettingsService.updateSecuritySettings({
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: backupCodes
      })

      // TODO: Call backend API to enable 2FA
      // const response = await fetch('/api/mfa/enable', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, secret, backupCodes })
      // })
      // return response.json()
      
      return { success: true }
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
      throw error
    }
  }

  /**
   * Disable 2FA for user
   */
  static async disable2FA(userId) {
    try {
      // Update user settings with 2FA disabled
      await UserSettingsService.updateSecuritySettings({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: []
      })

      // TODO: Call backend API to disable 2FA
      // const response = await fetch('/api/mfa/disable', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId })
      // })
      // return response.json()
      
      return { success: true }
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      throw error
    }
  }

  /**
   * Verify backup code
   */
  static async verifyBackupCode(backupCode, userId) {
    try {
      // Get user's backup codes
      const userSettings = await UserSettingsService.getUserSettings()
      const storedBackupCodes = userSettings.security?.backupCodes || []
      
      // Check if backup code is valid
      const isValid = storedBackupCodes.includes(backupCode)
      
      if (!isValid) {
        throw new Error('Invalid backup code')
      }
      
      // TODO: Remove used backup code from storage
      // const updatedCodes = storedBackupCodes.filter(code => code !== backupCode)
      // await UserSettingsService.updateSecuritySettings({
      //   backupCodes: updatedCodes
      // })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to verify backup code:', error)
      throw error
    }
  }

  /**
   * Generate new backup codes
   */
  static async generateNewBackupCodes(userId) {
    try {
      const newBackupCodes = this.generateBackupCodes()
      
      // Update user settings with new backup codes
      await UserSettingsService.updateSecuritySettings({
        backupCodes: newBackupCodes
      })
      
      return { backupCodes: newBackupCodes }
    } catch (error) {
      console.error('Failed to generate new backup codes:', error)
      throw error
    }
  }

  /**
   * Check if user has 2FA enabled
   */
  static async is2FAEnabled(userId) {
    try {
      const userSettings = await UserSettingsService.getUserSettings()
      return userSettings.security?.twoFactorEnabled || false
    } catch (error) {
      console.error('Failed to check 2FA status:', error)
      return false
    }
  }

  /**
   * Get user's 2FA status and backup codes
   */
  static async get2FAStatus(userId) {
    try {
      const userSettings = await UserSettingsService.getUserSettings()
      return {
        enabled: userSettings.security?.twoFactorEnabled || false,
        backupCodes: userSettings.security?.backupCodes || [],
        lastLoginAt: userSettings.security?.lastLoginAt
      }
    } catch (error) {
      console.error('Failed to get 2FA status:', error)
      throw error
    }
  }

  /**
   * Generate mock TOTP secret (for development)
   */
  static generateMockSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  /**
   * Generate QR code URL for authenticator apps
   */
  static generateQRCodeURL(email, secret) {
    const issuer = 'Promptr'
    const account = email
    const url = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`
    
    // For development, return a placeholder QR code
    // In production, this would generate an actual QR code image
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`
  }

  /**
   * Generate backup codes
   */
  static generateBackupCodes() {
    const codes = []
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
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
    return /^[A-Z0-9]{8}$/.test(code)
  }

  /**
   * Format backup codes for display
   */
  static formatBackupCodes(codes) {
    return codes.map((code, index) => ({
      id: index + 1,
      code: code,
      used: false
    }))
  }

  /**
   * Download backup codes as text file
   */
  static downloadBackupCodes(codes, email) {
    const content = `Promptr Backup Codes for ${email}

IMPORTANT: Keep these codes in a safe place. You can use them to access your account if you lose your authenticator device.

${codes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Generated on: ${new Date().toLocaleDateString()}

Note: Each code can only be used once. Generate new codes if you run out.`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `promptr-backup-codes-${email}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /**
   * Get authenticator app recommendations
   */
  static getAuthenticatorApps() {
    return [
      {
        name: 'Google Authenticator',
        platforms: ['iOS', 'Android'],
        description: 'Simple and reliable TOTP authenticator',
        icon: '🔐',
        url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'
      },
      {
        name: 'Authy',
        platforms: ['iOS', 'Android', 'Desktop'],
        description: 'Cross-platform with cloud backup',
        icon: '📱',
        url: 'https://authy.com/'
      },
      {
        name: 'Microsoft Authenticator',
        platforms: ['iOS', 'Android'],
        description: 'Microsoft\'s authenticator app',
        icon: '🪟',
        url: 'https://www.microsoft.com/en-us/account/authenticator'
      },
      {
        name: '1Password',
        platforms: ['iOS', 'Android', 'Desktop'],
        description: 'Password manager with TOTP support',
        icon: '🔑',
        url: 'https://1password.com/'
      }
    ]
  }
}

export default MFAService 