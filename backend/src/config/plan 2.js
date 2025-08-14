// Simple plan utilities for token caps

export function isProOrEnterprise(reqTier) {
  if (typeof reqTier === 'string') {
    return reqTier === 'pro' || reqTier === 'enterprise'
  }
  return true
}

export function getPlanCap(reqTier) {
  return isProOrEnterprise(reqTier) ? 2000 : 800
}


