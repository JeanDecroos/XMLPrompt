import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api/client'
import {
  InvoicesSchema,
  PlanSchema,
  ProfileSchema,
  SessionsSchema,
  SharedPromptsSchema,
  TwoFADisableRespSchema,
  TwoFAEnableSchema,
  TwoFAStatusSchema,
  TwoFAVerifyBodySchema,
  TwoFAVerifyRespSchema,
  UpdateProfileSchema,
  UploadAvatarRespSchema,
  UsageSchema,
  RevokeRespSchema,
} from '../../lib/api/schemas'

// Helpers
const parse = <T>(schema: { parse: (d: unknown) => T }, data: unknown): T => schema.parse(data)

// Queries
export const usePlan = () =>
  useQuery<Plan>({
    queryKey: ['billing', 'plan'],
    queryFn: async () => parse(PlanSchema, (await api.get('/api/billing/plan')).data),
    retry: (count, err: unknown) => {
      const status = typeof err === 'object' && err !== null && 'status' in err ? (err as { status?: number }).status : undefined
      return typeof status === 'number' && status >= 400 && status < 500 ? false : count < 2
    },
  })

export const useUsage = () =>
  useQuery<Usage>({
    queryKey: ['billing', 'usage'],
    queryFn: async () => parse(UsageSchema, (await api.get('/api/billing/usage')).data),
    retry: (count, err: unknown) => {
      const status = typeof err === 'object' && err !== null && 'status' in err ? (err as { status?: number }).status : undefined
      return typeof status === 'number' && status >= 400 && status < 500 ? false : count < 2
    },
  })

export const useInvoices = (limit = 5) =>
  useQuery<Invoices>({
    queryKey: ['billing', 'invoices', limit],
    queryFn: async () => parse(InvoicesSchema, (await api.get('/api/billing/invoices', { params: { limit } })).data),
  })

export const use2FAStatus = () =>
  useQuery<TwoFAStatus>({ queryKey: ['security', '2fa'], queryFn: async () => parse(TwoFAStatusSchema, (await api.get('/api/security/2fa/status')).data) })

export const useEnable2FA = () =>
  useMutation<TwoFAEnable>({
    mutationFn: async () => parse(TwoFAEnableSchema, (await api.post('/api/security/2fa/enable')).data),
  })

export const useVerify2FA = () =>
  useMutation<TwoFAVerifyResp, unknown, string>({
    mutationFn: async (code: string) => parse(TwoFAVerifyRespSchema, (await api.post('/api/security/2fa/verify', TwoFAVerifyBodySchema.parse({ code }))).data),
  })

export const useDisable2FA = () =>
  useMutation<TwoFADisableResp>({ mutationFn: async () => parse(TwoFADisableRespSchema, (await api.post('/api/security/2fa/disable')).data) })

export const useSessions = () =>
  useQuery<Sessions>({ queryKey: ['security', 'sessions'], queryFn: async () => parse(SessionsSchema, (await api.get('/api/security/sessions')).data) })

export const useRevokeSession = () => {
  const qc = useQueryClient()
  return useMutation<RevokeResp, unknown, string, { prev?: Sessions }>({
    mutationFn: async (id: string): Promise<RevokeResp> => parse(RevokeRespSchema, (await api.delete(`/api/security/sessions/${id}`)).data),
    onMutate: async (id): Promise<{ prev?: Sessions }> => {
      await qc.cancelQueries({ queryKey: ['security', 'sessions'] })
      const prev = qc.getQueryData<Sessions>(['security', 'sessions'])
      qc.setQueryData(['security', 'sessions'], (data: Sessions | undefined) => ({ sessions: (data?.sessions || []).filter((s) => s.id !== id) }))
      return { prev }
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(['security', 'sessions'], ctx.prev as Sessions)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['security', 'sessions'] }),
  })
}

export const useProfile = () =>
  useQuery<Profile>({ queryKey: ['account', 'profile'], queryFn: async () => parse(ProfileSchema, (await api.get('/api/account/profile')).data) })

export const useUpdateProfile = () => {
  const qc = useQueryClient()
  return useMutation<Profile, unknown, import('@api/types').UpdateProfile>({
    mutationFn: async (payload) => parse(ProfileSchema, (await api.patch('/api/account/profile', UpdateProfileSchema.parse(payload))).data),
    onSuccess: (data) => qc.setQueryData(['account', 'profile'], data),
  })
}

export const useUploadAvatar = () => {
  const qc = useQueryClient()
  return useMutation<UploadAvatarResp, unknown, File>({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return parse(UploadAvatarRespSchema, (await api.put('/api/account/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data)
    },
    onSuccess: (data) => {
      qc.setQueryData(['account', 'profile'], (prev: Profile | undefined) => ({ ...(prev || {}), avatarUrl: data.avatarUrl }))
    },
  })
}

export const useSharedPrompts = (limit = 3) =>
  useQuery<SharedPrompts>({
    queryKey: ['prompts', 'shared', limit],
    queryFn: async () => parse(SharedPromptsSchema, (await api.get('/api/prompts/shared', { params: { limit } })).data),
  })


