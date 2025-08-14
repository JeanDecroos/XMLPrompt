import { z } from 'zod'
import {
  InvoicesSchema,
  PlanSchema,
  ProfileSchema,
  SessionsSchema,
  SharedPromptsSchema,
  TwoFADisableRespSchema,
  TwoFAEnableSchema,
  TwoFAStatusSchema,
  TwoFAVerifyRespSchema,
  UpdateProfileSchema,
  UploadAvatarRespSchema,
  UsageSchema,
  RevokeRespSchema,
} from './schemas'

export type Plan = z.infer<typeof PlanSchema>
export type Usage = z.infer<typeof UsageSchema>
export type Invoices = z.infer<typeof InvoicesSchema>
export type TwoFAStatus = z.infer<typeof TwoFAStatusSchema>
export type TwoFAEnable = z.infer<typeof TwoFAEnableSchema>
export type TwoFAVerifyResp = z.infer<typeof TwoFAVerifyRespSchema>
export type TwoFADisableResp = z.infer<typeof TwoFADisableRespSchema>
export type Sessions = z.infer<typeof SessionsSchema>
export type RevokeResp = z.infer<typeof RevokeRespSchema>
export type Profile = z.infer<typeof ProfileSchema>
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>
export type UploadAvatarResp = z.infer<typeof UploadAvatarRespSchema>
export type SharedPrompts = z.infer<typeof SharedPromptsSchema>


