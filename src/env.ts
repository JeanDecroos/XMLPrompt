import { z } from 'zod'

const EnvSchema = z.object({
  VITE_API_URL: z.string().url().optional(),
  VITE_FEATURE_QUOTAS: z.string().optional(),
  VITE_FEATURE_IDENTITY: z.string().optional(),
  PROD: z.boolean().optional(),
})

type EnvInput = z.infer<typeof EnvSchema>

// import.meta.env is typed by vite/client but we validate and narrow via Zod
const rawEnv = EnvSchema.parse(import.meta.env as unknown as Record<string, unknown>) as EnvInput

export const ENV = {
  API_BASE_URL: rawEnv.VITE_API_URL,
  FEATURE_QUOTAS: rawEnv.VITE_FEATURE_QUOTAS === 'true',
  FEATURE_IDENTITY: rawEnv.VITE_FEATURE_IDENTITY === 'true',
}

if (rawEnv.PROD && !ENV.API_BASE_URL) {
  throw new Error('API_BASE_URL is required in production')
}


