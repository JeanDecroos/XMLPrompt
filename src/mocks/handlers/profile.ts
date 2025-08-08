import { http, HttpResponse } from 'msw'
import { addDays, subHours } from 'date-fns'

export const profileHandlers = [
  http.get('/api/billing/plan', () => {
    return HttpResponse.json({
      name: 'Premium',
      billingCycle: 'monthly',
      nextRenewalAt: addDays(new Date(), 28).toISOString(),
      isTopTier: true,
      features: [
        { key: 'prompts', label: 'Prompts', value: 'Unlimited' },
        { key: 'enhance', label: 'AI Enhancements', value: true },
        { key: 'support', label: 'Priority Support', value: true },
      ],
    })
  }),

  http.get('/api/billing/usage', () => {
    const now = new Date()
    return HttpResponse.json({
      promptsUsed: 120,
      promptsLimit: 1000,
      modelsUsed: 3,
      modelsLimit: 10,
      period: { start: subHours(now, 24 * 10).toISOString(), end: addDays(now, 20).toISOString() },
    })
  }),

  http.get('/api/billing/invoices', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') || 5)
    const base = Array.from({ length: 5 }).map((_, i) => ({
      id: `inv_${i + 1}`,
      createdAt: subHours(new Date(), i * 24 * 3).toISOString(),
      amountCents: 300,
      status: 'paid',
    }))
    return HttpResponse.json({ invoices: base.slice(0, limit) })
  }),

  http.get('/api/security/2fa/status', () => HttpResponse.json({ enabled: false })),
  http.post('/api/security/2fa/enable', () => HttpResponse.json({ otpauthUrl: 'otpauth://totp/Promptr:test?secret=ABC123' })),
  http.post('/api/security/2fa/verify', async ({ request }) => {
    const body: any = await request.json()
    const code = body?.code
    if (code !== '123456') {
      return new HttpResponse(JSON.stringify({ message: 'Invalid code' }), { status: 400 })
    }
    return HttpResponse.json({ enabled: true })
  }),
  http.post('/api/security/2fa/disable', () => HttpResponse.json({ success: true })),

  http.get('/api/security/sessions', () => {
    const now = new Date()
    return HttpResponse.json({
      sessions: [
        { id: 'sess_current', device: 'MacBook Air · Safari', ip: '10.0.0.1', location: 'Antwerp, BE', lastActiveAt: now.toISOString(), current: true },
        { id: 'sess_other', device: 'iPhone 14 · Mobile Safari', ip: '10.0.0.2', location: 'Antwerp, BE', lastActiveAt: subHours(now, 2).toISOString(), current: false },
      ],
    })
  }),
  http.delete('/api/security/sessions/:id', () => HttpResponse.json({ revoked: true })),

  http.get('/api/account/profile', () => {
    const now = new Date()
    return HttpResponse.json({
      email: 'user@example.com',
      memberSince: subHours(now, 24 * 365).toISOString(),
      lastActiveAt: now.toISOString(),
      location: 'Antwerp',
      timeZone: 'Europe/Brussels',
    })
  }),
  http.patch('/api/account/profile', async ({ request }) => {
    const body: any = await request.json()
    return HttpResponse.json(Object.assign({
      email: 'user@example.com',
      memberSince: subHours(new Date(), 24 * 365).toISOString(),
      lastActiveAt: new Date().toISOString(),
    }, body || {}))
  }),
  http.put('/api/account/avatar', () => HttpResponse.json({ avatarUrl: 'https://example.com/avatar.png' })),

  http.get('/api/prompts/shared', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') || 3)
    const items = [
      { id: 'p1', title: 'Marketing tagline generator', updatedAt: new Date().toISOString(), url: 'https://example.com/p/1' },
      { id: 'p2', title: 'Bug triage assistant', updatedAt: subHours(new Date(), 24).toISOString(), url: 'https://example.com/p/2' },
      { id: 'p3', title: 'Research summarizer', updatedAt: subHours(new Date(), 48).toISOString(), url: 'https://example.com/p/3' },
    ]
    return HttpResponse.json({ items: items.slice(0, limit) })
  }),
]


