// Profile Service (mock API)
// Replace the internals with real API calls when endpoints are available

export const ProfileService = {
  async getOverview(userId) {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 200))

    const now = new Date()
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Mocked response shape designed for easy replacement with a real API
    return {
      plan: {
        name: 'Premium',
        tier: 'pro',
        billingCycle: 'Monthly',
        nextRenewal: in30Days.toISOString(),
        priceEUR: 3,
        features: [
          'Unlimited prompts',
          'Advanced AI enhancements',
          'Priority support',
        ],
      },
      quota: {
        enabled: true,
        prompts: { used: 12, limit: 1000 },
        enrichments: { used: 8, limit: 1000 },
        storage: null, // Optional; set to null to hide
        modelsAvailable: ['GPT-4o', 'Claude-3.5-Sonnet', 'Gemini 2.5 Pro'],
      },
      security: {
        twoFactorEnabled: false,
        memberSince: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString(),
        lastActive: now.toISOString(),
        sessions: [
          {
            id: 'sess_mac_safari',
            device: 'MacBook Air · Safari',
            location: 'Antwerp, BE',
            lastActive: now.toISOString(),
            current: true,
          },
          {
            id: 'sess_iphone',
            device: 'iPhone 14 · Mobile Safari',
            location: 'Antwerp, BE',
            lastActive: new Date(now.getTime() - 3600 * 1000).toISOString(),
            current: false,
          },
        ],
      },
      recent: {
        sharedPrompts: [
          { id: 'p1', title: 'Marketing tagline generator', updatedAt: now.toISOString() },
          { id: 'p2', title: 'Bug triage assistant', updatedAt: new Date(now.getTime() - 86400000).toISOString() },
          { id: 'p3', title: 'Research summarizer', updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString() },
        ],
      },
    }
  },

  async toggleTwoFactor(userId, enable) {
    await new Promise((r) => setTimeout(r, 300))
    return { success: true, enabled: enable }
  },

  async revokeSession(userId, sessionId) {
    await new Promise((r) => setTimeout(r, 200))
    return { success: true, sessionId }
  },
}

export default ProfileService


