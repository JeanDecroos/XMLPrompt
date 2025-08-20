import React, { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { 
  usePlan, 
  useUsage, 
  useInvoices, 
  use2FAStatus, 
  useSessions, 
  useProfile, 
  useSharedPrompts 
} from '../features/profile/api'

/**
 * DataPreloader component that loads all necessary data in the background
 * This reduces loading states and improves user experience
 */
export default function DataPreloader() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Preload all data queries
  const planQuery = usePlan()
  const usageQuery = useUsage()
  const invoicesQuery = useInvoices(5)
  const twoFAQuery = use2FAStatus()
  const sessionsQuery = useSessions()
  const profileQuery = useProfile()
  const sharedPromptsQuery = useSharedPrompts(3)

  useEffect(() => {
    if (!isAuthenticated || !user) return

    // Prefetch all data to reduce loading states
    const prefetchData = async () => {
      try {
        // Prefetch all queries in parallel
        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: ['billing', 'plan'],
            queryFn: planQuery.refetch
          }),
          queryClient.prefetchQuery({
            queryKey: ['billing', 'usage'],
            queryFn: usageQuery.refetch
          }),
          queryClient.prefetchQuery({
            queryKey: ['billing', 'invoices', 5],
            queryFn: invoicesQuery.refetch
          }),
          queryClient.prefetchQuery({
            queryKey: ['security', '2fa'],
            queryFn: twoFAQuery.refetch
          }),
          queryClient.prefetchQuery({
            queryKey: ['security', 'sessions'],
            queryFn: sessionsQuery.refetch
          }),
          queryClient.prefetchQuery({
            queryKey: ['account', 'profile'],
            queryFn: profileQuery.refetch
          }),
          queryClient.prefetchQuery({
            queryKey: ['prompts', 'shared', 3],
            queryFn: sharedPromptsQuery.refetch
          })
        ])
      } catch (error) {
        console.warn('Some data prefetching failed:', error)
      }
    }

    // Prefetch data after a short delay to not block initial render
    const timer = setTimeout(prefetchData, 100)
    return () => clearTimeout(timer)
  }, [isAuthenticated, user, queryClient])

  // This component doesn't render anything visible
  return null
}
