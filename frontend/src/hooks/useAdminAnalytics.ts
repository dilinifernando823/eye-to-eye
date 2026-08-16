import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { AdminAnalyticsSummary } from '@/types/admin'

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: async () => {
      const { data } = await api.get<AdminAnalyticsSummary>('/api/admin/analytics/summary')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
