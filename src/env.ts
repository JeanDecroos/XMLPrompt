import { z } from 'zod'

const EnvSchema = z.object({
  VITE_API_URL: z.string().url().optional(),
  VITE_FEATURE_QUOTAS: z.string().optional(),
  VITE_FEATURE_IDENTITY: z.string().optional(),
})

const raw = EnvSchema.parse((import.meta as any).env)

export const ENV = {
  API_BASE_URL: raw.VITE_API_URL,
  FEATURE_QUOTAS: raw.VITE_FEATURE_QUOTAS === 'true',
  FEATURE_IDENTITY: raw.VITE_FEATURE_IDENTITY === 'true',
}

if (((import.meta as any).env?.PROD) && !ENV.API_BASE_URL) {
  throw new Error('API_BASE_URL is required in production')
}


