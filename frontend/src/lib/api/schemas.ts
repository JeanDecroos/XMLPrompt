import { z } from 'zod'

export const PlanSchema = z.object({
  name: z.string(),
  billingCycle: z.enum(['monthly', 'yearly']),
  nextRenewalAt: z.string().datetime(),
  isTopTier: z.boolean(),
  features: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      })
    )
    .optional(),
})

export const UsageSchema = z.object({
  promptsUsed: z.number().nonnegative(),
  promptsLimit: z.number().int().positive().nullable().optional(),
  modelsUsed: z.number().nonnegative(),
  modelsLimit: z.number().int().positive().nullable().optional(),
  period: z.object({ start: z.string().datetime(), end: z.string().datetime() }),
})

export const InvoicesSchema = z.object({
  invoices: z.array(
    z.object({
      id: z.string(),
      createdAt: z.string().datetime(),
      amountCents: z.number().int().nonnegative(),
      status: z.enum(['paid', 'open', 'void']),
    })
  ),
})

export const TwoFAStatusSchema = z.object({ enabled: z.boolean() })
export const TwoFAEnableSchema = z.object({ otpauthUrl: z.string().url() })
export const TwoFAVerifyBodySchema = z.object({ code: z.string().regex(/^\d{6}$/) })
export const TwoFAVerifyRespSchema = z.object({ enabled: z.literal(true) })
export const TwoFADisableRespSchema = z.object({ success: z.literal(true) })

export const SessionsSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string(),
      device: z.string(),
      ip: z.string(),
      location: z.string().optional(),
      lastActiveAt: z.string().datetime(),
      current: z.boolean(),
    })
  ),
})

export const RevokeRespSchema = z.object({ revoked: z.literal(true) })

export const ProfileSchema = z.object({
  email: z.string().email(),
  memberSince: z.string().datetime(),
  lastActiveAt: z.string().datetime(),
  location: z.string().optional(),
  timeZone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export const UpdateProfileSchema = z.object({
  location: z.string().optional(),
  timeZone: z.string().optional(),
})

export const UploadAvatarRespSchema = z.object({ avatarUrl: z.string().url() })

export const SharedPromptsSchema = z.object({
  items: z.array(
    z.object({ id: z.string(), title: z.string(), updatedAt: z.string().datetime(), url: z.string().url() })
  ),
})


