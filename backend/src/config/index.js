/**
 * Configuration Management
 * Centralized configuration with environment variable validation
 */

import dotenv from 'dotenv'
import Joi from 'joi'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Configuration schema for validation
const configSchema = Joi.object({
  // Server Configuration
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3001),
  HOST: Joi.string().default('localhost'),
  API_VERSION: Joi.string().default('v1'),

  // CORS Configuration
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // Supabase Configuration
  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

  // Database Configuration (Not needed for Supabase)
  // DATABASE_URL: Joi.string().uri().optional(),

  // AI Services Configuration
  OPENAI_API_KEY: Joi.string().required(),
  OPENAI_MODEL: Joi.string().default('gpt-4o-mini'),
  OPENAI_MAX_TOKENS: Joi.number().default(2000),
  OPENAI_TEMPERATURE: Joi.number().min(0).max(2).default(0.7),

  ANTHROPIC_API_KEY: Joi.string().optional(),
  ANTHROPIC_MODEL: Joi.string().default('claude-3-5-sonnet-20241022'),
  ANTHROPIC_MAX_TOKENS: Joi.number().default(4000),

  GOOGLE_AI_API_KEY: Joi.string().optional(),
  GOOGLE_AI_MODEL: Joi.string().default('gemini-1.5-pro'),

  // Redis Configuration
  REDIS_URL: Joi.string().default('redis://localhost:6379'),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),
        REDIS_KEY_PREFIX: Joi.string().default('promptr:'),

  // Authentication & Security
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  API_KEY_SECRET: Joi.string().min(32).required(),
  API_KEY_LENGTH: Joi.number().default(32),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
  RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS: Joi.boolean().default(false),

  // Payment Processing
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  STRIPE_PRICE_ID_PRO: Joi.string().optional(),
  STRIPE_PRICE_ID_ENTERPRISE: Joi.string().optional(),

  // Email Services
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),

  SENDGRID_API_KEY: Joi.string().optional(),
  SENDGRID_FROM_EMAIL: Joi.string().email().optional(),
        SENDGRID_FROM_NAME: Joi.string().default('Promptr'),

  // File Storage
  UPLOAD_DIR: Joi.string().default('uploads'),
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  ALLOWED_FILE_TYPES: Joi.string().default('image/jpeg,image/png,image/webp,application/pdf,text/plain'),

  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().optional(),

  // Monitoring & Analytics
  SENTRY_DSN: Joi.string().allow('').optional(),
  SENTRY_ENVIRONMENT: Joi.string().default('development'),

  ANALYTICS_ENABLED: Joi.boolean().default(true),
  ANALYTICS_SAMPLE_RATE: Joi.number().min(0).max(1).default(1.0),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FILE: Joi.string().default('logs/app.log'),
  LOG_MAX_SIZE: Joi.string().default('20m'),
  LOG_MAX_FILES: Joi.string().default('14d'),

  // Feature Flags
  FEATURE_PROMPT_ENRICHMENT: Joi.boolean().default(true),
  FEATURE_PROMPT_SHARING: Joi.boolean().default(true),
  FEATURE_PUBLIC_GALLERY: Joi.boolean().default(true),
  FEATURE_API_ACCESS: Joi.boolean().default(true),
  FEATURE_ADVANCED_ANALYTICS: Joi.boolean().default(true),

  FEATURE_COLLABORATIVE_EDITING: Joi.boolean().default(false),
  FEATURE_AI_SUGGESTIONS: Joi.boolean().default(false),
  FEATURE_VOICE_INPUT: Joi.boolean().default(false),

  // Background Jobs
  QUEUE_REDIS_URL: Joi.string().default('redis://localhost:6379'),
  QUEUE_CONCURRENCY: Joi.number().default(5),
  QUEUE_MAX_ATTEMPTS: Joi.number().default(3),
  QUEUE_BACKOFF_DELAY: Joi.number().default(5000),

  ENABLE_EMAIL_JOBS: Joi.boolean().default(true),
  ENABLE_ANALYTICS_JOBS: Joi.boolean().default(true),
  ENABLE_CLEANUP_JOBS: Joi.boolean().default(true),

  // External Integrations
  GITHUB_CLIENT_ID: Joi.string().optional(),
  GITHUB_CLIENT_SECRET: Joi.string().optional(),

  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),

  DISCORD_CLIENT_ID: Joi.string().optional(),
  DISCORD_CLIENT_SECRET: Joi.string().optional(),
  DISCORD_WEBHOOK_URL: Joi.string().allow('').optional(),

  // Development & Testing
  ENABLE_API_DOCS: Joi.boolean().default(true),
  ENABLE_PLAYGROUND: Joi.boolean().default(true),
  ENABLE_DEBUG_ROUTES: Joi.boolean().default(true),

  TEST_DATABASE_URL: Joi.string().uri().optional(),
  TEST_REDIS_URL: Joi.string().optional(),

  MOCK_AI_SERVICES: Joi.boolean().default(false),
  MOCK_PAYMENT_SERVICES: Joi.boolean().default(false),
  MOCK_EMAIL_SERVICES: Joi.boolean().default(false),

  // Performance & Scaling
  CACHE_TTL: Joi.number().default(3600),
  CACHE_MAX_SIZE: Joi.number().default(1000),

  DB_POOL_MIN: Joi.number().default(2),
  DB_POOL_MAX: Joi.number().default(10),
  DB_POOL_IDLE_TIMEOUT: Joi.number().default(30000),

  REQUEST_TIMEOUT: Joi.number().default(30000),
  AI_REQUEST_TIMEOUT: Joi.number().default(60000),

  // Business Logic
  FREE_TIER_MONTHLY_PROMPTS: Joi.number().default(100),
  FREE_TIER_MONTHLY_ENRICHMENTS: Joi.number().default(20),
  PRO_TIER_MONTHLY_PROMPTS: Joi.number().default(1000),
  PRO_TIER_MONTHLY_ENRICHMENTS: Joi.number().default(500),

  ENABLE_CONTENT_MODERATION: Joi.boolean().default(true),
  MODERATION_STRICT_MODE: Joi.boolean().default(false),
  AUTO_APPROVE_TRUSTED_USERS: Joi.boolean().default(true),

  MAX_SHARES_PER_USER: Joi.number().default(100),
  MAX_SHARE_VIEWS: Joi.number().default(10000),
  DEFAULT_SHARE_EXPIRY_DAYS: Joi.number().default(30),

  // Security Settings
  MIN_PASSWORD_LENGTH: Joi.number().default(8),
  REQUIRE_PASSWORD_UPPERCASE: Joi.boolean().default(true),
  REQUIRE_PASSWORD_LOWERCASE: Joi.boolean().default(true),
  REQUIRE_PASSWORD_NUMBERS: Joi.boolean().default(true),
  REQUIRE_PASSWORD_SYMBOLS: Joi.boolean().default(false),

  SESSION_COOKIE_SECURE: Joi.boolean().default(true),
  SESSION_COOKIE_HTTP_ONLY: Joi.boolean().default(true),
  SESSION_COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('strict'),

  ENABLE_API_KEY_ROTATION: Joi.boolean().default(true),
  API_KEY_ROTATION_DAYS: Joi.number().default(90),
  ENABLE_IP_WHITELIST: Joi.boolean().default(false),

  // Compliance & Legal
  ENABLE_GDPR_MODE: Joi.boolean().default(true),
  DATA_RETENTION_DAYS: Joi.number().default(365),
  ENABLE_DATA_EXPORT: Joi.boolean().default(true),
  ENABLE_DATA_DELETION: Joi.boolean().default(true),

  TERMS_VERSION: Joi.string().default('1.0'),
  PRIVACY_VERSION: Joi.string().default('1.0'),
  COOKIE_CONSENT_REQUIRED: Joi.boolean().default(true)
})

// Validate environment variables
const { error, value: envVars } = configSchema.validate(process.env, {
  allowUnknown: true,
  stripUnknown: true
})

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

// Export structured configuration
export const config = {
  env: envVars.NODE_ENV,
  app: {
          name: 'Promptr Backend API',
    version: '2.0.0',
    apiVersion: envVars.API_VERSION
  },
  server: {
    port: envVars.PORT,
    host: envVars.HOST,
    requestTimeout: envVars.REQUEST_TIMEOUT
  },
  cors: {
    origin: envVars.CORS_ORIGIN,
    credentials: envVars.CORS_CREDENTIALS
  },
  database: {
    supabaseUrl: envVars.SUPABASE_URL,
    supabaseAnonKey: envVars.SUPABASE_ANON_KEY,
    supabaseServiceKey: envVars.SUPABASE_SERVICE_ROLE_KEY,
    // directUrl: envVars.DATABASE_URL, // Not needed for Supabase
    pool: {
      min: envVars.DB_POOL_MIN,
      max: envVars.DB_POOL_MAX,
      idleTimeout: envVars.DB_POOL_IDLE_TIMEOUT
    }
  },
  redis: {
    url: envVars.REDIS_URL,
    password: envVars.REDIS_PASSWORD,
    db: envVars.REDIS_DB,
    keyPrefix: envVars.REDIS_KEY_PREFIX
  },
  ai: {
    openai: {
      apiKey: envVars.OPENAI_API_KEY,
      model: envVars.OPENAI_MODEL,
      maxTokens: envVars.OPENAI_MAX_TOKENS,
      temperature: envVars.OPENAI_TEMPERATURE,
      timeout: envVars.AI_REQUEST_TIMEOUT
    },
    anthropic: {
      apiKey: envVars.ANTHROPIC_API_KEY,
      model: envVars.ANTHROPIC_MODEL,
      maxTokens: envVars.ANTHROPIC_MAX_TOKENS,
      timeout: envVars.AI_REQUEST_TIMEOUT
    },
    google: {
      apiKey: envVars.GOOGLE_AI_API_KEY,
      model: envVars.GOOGLE_AI_MODEL,
      timeout: envVars.AI_REQUEST_TIMEOUT
    }
  },
  auth: {
    jwt: {
      secret: envVars.JWT_SECRET,
      expiresIn: envVars.JWT_EXPIRES_IN,
      refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN
    },
    apiKey: {
      secret: envVars.API_KEY_SECRET,
      length: envVars.API_KEY_LENGTH,
      rotationEnabled: envVars.ENABLE_API_KEY_ROTATION,
      rotationDays: envVars.API_KEY_ROTATION_DAYS
    },
    password: {
      minLength: envVars.MIN_PASSWORD_LENGTH,
      requireUppercase: envVars.REQUIRE_PASSWORD_UPPERCASE,
      requireLowercase: envVars.REQUIRE_PASSWORD_LOWERCASE,
      requireNumbers: envVars.REQUIRE_PASSWORD_NUMBERS,
      requireSymbols: envVars.REQUIRE_PASSWORD_SYMBOLS
    },
    session: {
      secure: envVars.SESSION_COOKIE_SECURE,
      httpOnly: envVars.SESSION_COOKIE_HTTP_ONLY,
      sameSite: envVars.SESSION_COOKIE_SAME_SITE
    }
  },
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    maxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
    skipSuccessfulRequests: envVars.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS
  },
  payment: {
    stripe: {
      secretKey: envVars.STRIPE_SECRET_KEY,
      publishableKey: envVars.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
      priceIds: {
        pro: envVars.STRIPE_PRICE_ID_PRO,
        enterprise: envVars.STRIPE_PRICE_ID_ENTERPRISE
      }
    }
  },
  email: {
    smtp: {
      host: envVars.SMTP_HOST,
      port: envVars.SMTP_PORT,
      secure: envVars.SMTP_SECURE,
      user: envVars.SMTP_USER,
      pass: envVars.SMTP_PASS
    },
    sendgrid: {
      apiKey: envVars.SENDGRID_API_KEY,
      fromEmail: envVars.SENDGRID_FROM_EMAIL,
      fromName: envVars.SENDGRID_FROM_NAME
    }
  },
  storage: {
    local: {
      uploadDir: envVars.UPLOAD_DIR,
      maxFileSize: envVars.MAX_FILE_SIZE,
      allowedTypes: envVars.ALLOWED_FILE_TYPES.split(',')
    },
    aws: {
      accessKeyId: envVars.AWS_ACCESS_KEY_ID,
      secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
      region: envVars.AWS_REGION,
      bucket: envVars.AWS_S3_BUCKET
    }
  },
  monitoring: {
    sentry: {
      dsn: envVars.SENTRY_DSN,
      environment: envVars.SENTRY_ENVIRONMENT
    },
    analytics: {
      enabled: envVars.ANALYTICS_ENABLED,
      sampleRate: envVars.ANALYTICS_SAMPLE_RATE
    }
  },
  logging: {
    level: envVars.LOG_LEVEL,
    file: envVars.LOG_FILE,
    maxSize: envVars.LOG_MAX_SIZE,
    maxFiles: envVars.LOG_MAX_FILES
  },
  features: {
    promptEnrichment: envVars.FEATURE_PROMPT_ENRICHMENT,
    promptSharing: envVars.FEATURE_PROMPT_SHARING,
    publicGallery: envVars.FEATURE_PUBLIC_GALLERY,
    apiAccess: envVars.FEATURE_API_ACCESS,
    advancedAnalytics: envVars.FEATURE_ADVANCED_ANALYTICS,
    collaborativeEditing: envVars.FEATURE_COLLABORATIVE_EDITING,
    aiSuggestions: envVars.FEATURE_AI_SUGGESTIONS,
    voiceInput: envVars.FEATURE_VOICE_INPUT,
    enableApiDocs: envVars.ENABLE_API_DOCS,
    enablePlayground: envVars.ENABLE_PLAYGROUND,
    enableDebugRoutes: envVars.ENABLE_DEBUG_ROUTES
  },
  queue: {
    redis: {
      url: envVars.QUEUE_REDIS_URL
    },
    concurrency: envVars.QUEUE_CONCURRENCY,
    maxAttempts: envVars.QUEUE_MAX_ATTEMPTS,
    backoffDelay: envVars.QUEUE_BACKOFF_DELAY,
    jobs: {
      email: envVars.ENABLE_EMAIL_JOBS,
      analytics: envVars.ENABLE_ANALYTICS_JOBS,
      cleanup: envVars.ENABLE_CLEANUP_JOBS
    }
  },
  integrations: {
    github: {
      clientId: envVars.GITHUB_CLIENT_ID,
      clientSecret: envVars.GITHUB_CLIENT_SECRET
    },
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET
    },
    discord: {
      clientId: envVars.DISCORD_CLIENT_ID,
      clientSecret: envVars.DISCORD_CLIENT_SECRET,
      webhookUrl: envVars.DISCORD_WEBHOOK_URL
    }
  },
  testing: {
    databaseUrl: envVars.TEST_DATABASE_URL,
    redisUrl: envVars.TEST_REDIS_URL,
    mocks: {
      aiServices: envVars.MOCK_AI_SERVICES,
      paymentServices: envVars.MOCK_PAYMENT_SERVICES,
      emailServices: envVars.MOCK_EMAIL_SERVICES
    }
  },
  performance: {
    cache: {
      ttl: envVars.CACHE_TTL,
      maxSize: envVars.CACHE_MAX_SIZE
    }
  },
  business: {
    limits: {
      free: {
        monthlyPrompts: envVars.FREE_TIER_MONTHLY_PROMPTS,
        monthlyEnrichments: envVars.FREE_TIER_MONTHLY_ENRICHMENTS
      },
      pro: {
        monthlyPrompts: envVars.PRO_TIER_MONTHLY_PROMPTS,
        monthlyEnrichments: envVars.PRO_TIER_MONTHLY_ENRICHMENTS
      }
    },
    moderation: {
      enabled: envVars.ENABLE_CONTENT_MODERATION,
      strictMode: envVars.MODERATION_STRICT_MODE,
      autoApproveTrusted: envVars.AUTO_APPROVE_TRUSTED_USERS
    },
    sharing: {
      maxSharesPerUser: envVars.MAX_SHARES_PER_USER,
      maxShareViews: envVars.MAX_SHARE_VIEWS,
      defaultExpiryDays: envVars.DEFAULT_SHARE_EXPIRY_DAYS
    }
  },
  compliance: {
    gdpr: {
      enabled: envVars.ENABLE_GDPR_MODE,
      dataRetentionDays: envVars.DATA_RETENTION_DAYS,
      enableDataExport: envVars.ENABLE_DATA_EXPORT,
      enableDataDeletion: envVars.ENABLE_DATA_DELETION
    },
    legal: {
      termsVersion: envVars.TERMS_VERSION,
      privacyVersion: envVars.PRIVACY_VERSION,
      cookieConsentRequired: envVars.COOKIE_CONSENT_REQUIRED
    }
  }
}

// Validate critical configuration
if (config.env === 'production') {
  const requiredProductionVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'JWT_SECRET',
    'API_KEY_SECRET'
  ]

  const missingVars = requiredProductionVars.filter(varName => !envVars[varName])
  if (missingVars.length > 0) {
    throw new Error(`Missing required production environment variables: ${missingVars.join(', ')}`)
  }
}

// Log configuration summary (excluding sensitive data)
console.log('🔧 Configuration loaded:')
console.log(`   Environment: ${config.env}`)
console.log(`   Server: ${config.server.host}:${config.server.port}`)
console.log(`   Database: ${config.database.supabaseUrl ? 'Supabase' : 'Direct connection'}`)
console.log(`   Redis: ${config.redis.url}`)
console.log(`   AI Services: ${Object.keys(config.ai).filter(service => config.ai[service].apiKey).join(', ')}`)
console.log(`   Features: ${Object.entries(config.features).filter(([_, enabled]) => enabled).map(([name]) => name).join(', ')}`)

export default config 