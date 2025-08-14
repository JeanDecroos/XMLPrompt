# Profile Feature

This module provides typed API hooks (React Query + Zod) and MSW mocks for the Profile page.

## Endpoints
- GET /api/billing/plan, /usage, /invoices
- GET/POST /api/security/2fa/*
- GET/DELETE /api/security/sessions
- GET/PATCH /api/account/profile, PUT /api/account/avatar
- GET /api/prompts/shared

## Hooks
- usePlan, useUsage, useInvoices
- use2FAStatus, useEnable2FA, useVerify2FA, useDisable2FA
- useSessions, useRevokeSession
- useProfile, useUpdateProfile, useUploadAvatar
- useSharedPrompts

All responses are validated with Zod; invalid payloads throw typed errors.

## MSW
Dev builds start MSW automatically from `src/mocks/browser.ts`. To point to a real API, set VITE_API_URL and disable MSW start logic in `src/main.jsx`.
