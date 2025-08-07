/**
 * Data Encryption Service
 * Provides field-level encryption for sensitive data
 */

import crypto from 'crypto'
import { config } from '../config/index.js'
import { logger } from '../utils/logger.js'

class EncryptionService {
  constructor() {
    // Use environment variable for encryption key or generate one
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey()
    this.algorithm = 'aes-256-gcm'
    this.keyLength = 32
    this.ivLength = 16
    this.tagLength = 16
  }

  /**
   * Generate a secure encryption key
   */
  generateEncryptionKey() {
    const key = crypto.randomBytes(this.keyLength)
    logger.warn('No ENCRYPTION_KEY found in environment. Generated temporary key. Set ENCRYPTION_KEY for production.')
    return key.toString('hex')
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data) {
    try {
      if (!data || data === '') {
        return null
      }

      const iv = crypto.randomBytes(this.ivLength)
      const cipher = crypto.createCipher(this.algorithm, Buffer.from(this.encryptionKey, 'hex'))
      
      let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const tag = cipher.getAuthTag()
      
      // Combine IV, encrypted data, and auth tag
      const result = iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex')
      
      return result
    } catch (error) {
      logger.error('Encryption failed:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData) {
    try {
      if (!encryptedData || encryptedData === '') {
        return null
      }

      const parts = encryptedData.split(':')
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format')
      }

      const iv = Buffer.from(parts[0], 'hex')
      const encrypted = parts[1]
      const tag = Buffer.from(parts[2], 'hex')

      const decipher = crypto.createDecipher(this.algorithm, Buffer.from(this.encryptionKey, 'hex'))
      decipher.setAuthTag(tag)
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return JSON.parse(decrypted)
    } catch (error) {
      logger.error('Decryption failed:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Encrypt specific fields in an object
   */
  encryptFields(data, fieldsToEncrypt) {
    if (!data || typeof data !== 'object') {
      return data
    }

    const encrypted = { ...data }
    
    for (const field of fieldsToEncrypt) {
      if (encrypted[field] !== undefined && encrypted[field] !== null) {
        encrypted[field] = this.encrypt(encrypted[field])
      }
    }
    
    return encrypted
  }

  /**
   * Decrypt specific fields in an object
   */
  decryptFields(data, fieldsToDecrypt) {
    if (!data || typeof data !== 'object') {
      return data
    }

    const decrypted = { ...data }
    
    for (const field of fieldsToDecrypt) {
      if (decrypted[field] !== undefined && decrypted[field] !== null) {
        try {
          decrypted[field] = this.decrypt(decrypted[field])
        } catch (error) {
          logger.warn(`Failed to decrypt field ${field}:`, error.message)
          decrypted[field] = null
        }
      }
    }
    
    return decrypted
  }

  /**
   * Hash sensitive data (one-way encryption)
   */
  hash(data, salt = null) {
    try {
      if (!data) return null
      
      const useSalt = salt || crypto.randomBytes(16).toString('hex')
      const hash = crypto.pbkdf2Sync(data, useSalt, 10000, 64, 'sha512')
      
      return {
        hash: hash.toString('hex'),
        salt: useSalt
      }
    } catch (error) {
      logger.error('Hashing failed:', error)
      throw new Error('Failed to hash data')
    }
  }

  /**
   * Verify hashed data
   */
  verifyHash(data, hash, salt) {
    try {
      if (!data || !hash || !salt) return false
      
      const testHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512')
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), testHash)
    } catch (error) {
      logger.error('Hash verification failed:', error)
      return false
    }
  }

  /**
   * Generate secure random string
   */
  generateSecureString(length = 32) {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Generate secure API key
   */
  generateApiKey(prefix = 'pk_') {
    const key = this.generateSecureString(32)
    return prefix + key
  }

  /**
   * Encrypt user preferences
   */
  encryptUserPreferences(preferences) {
    const sensitiveFields = [
      'payment_methods',
      'billing_history',
      'security_questions',
      'personal_notes'
    ]
    
    return this.encryptFields(preferences, sensitiveFields)
  }

  /**
   * Decrypt user preferences
   */
  decryptUserPreferences(preferences) {
    const sensitiveFields = [
      'payment_methods',
      'billing_history',
      'security_questions',
      'personal_notes'
    ]
    
    return this.decryptFields(preferences, sensitiveFields)
  }

  /**
   * Encrypt prompt content (if marked as sensitive)
   */
  encryptPromptContent(prompt, isSensitive = false) {
    if (!isSensitive) return prompt
    
    const sensitiveFields = [
      'raw_prompt',
      'enriched_prompt',
      'context',
      'requirements'
    ]
    
    return this.encryptFields(prompt, sensitiveFields)
  }

  /**
   * Decrypt prompt content
   */
  decryptPromptContent(prompt) {
    const sensitiveFields = [
      'raw_prompt',
      'enriched_prompt',
      'context',
      'requirements'
    ]
    
    return this.decryptFields(prompt, sensitiveFields)
  }

  /**
   * Encrypt API key data
   */
  encryptApiKeyData(apiKeyData) {
    const sensitiveFields = [
      'key_hash',
      'permissions',
      'webhook_urls'
    ]
    
    return this.encryptFields(apiKeyData, sensitiveFields)
  }

  /**
   * Decrypt API key data
   */
  decryptApiKeyData(apiKeyData) {
    const sensitiveFields = [
      'key_hash',
      'permissions',
      'webhook_urls'
    ]
    
    return this.decryptFields(apiKeyData, sensitiveFields)
  }

  /**
   * Rotate encryption key
   */
  async rotateEncryptionKey(newKey) {
    try {
      // This would require re-encrypting all existing data
      // Implementation depends on database structure
      logger.info('Encryption key rotation initiated')
      
      // Store new key securely
      this.encryptionKey = newKey
      
      return true
    } catch (error) {
      logger.error('Encryption key rotation failed:', error)
      throw new Error('Failed to rotate encryption key')
    }
  }

  /**
   * Get encryption status
   */
  getEncryptionStatus() {
    return {
      algorithm: this.algorithm,
      keyLength: this.keyLength,
      hasKey: !!this.encryptionKey,
      isProductionKey: !!process.env.ENCRYPTION_KEY
    }
  }
}

// Create singleton instance
const encryptionService = new EncryptionService()

export default encryptionService 