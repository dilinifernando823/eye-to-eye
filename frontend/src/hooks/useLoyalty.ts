import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { LoyaltyTransaction } from '@/types'

interface LoyaltyBalance {
  balance: number
  total_earned: number
  total_redeemed: number
  redeemable_value: number
  earn_rate: number
  redeem_rate: number
}

export function useLoyaltyBalance() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['loyalty', 'balance'],
    queryFn: async () => {
      const { data } = await api.get<LoyaltyBalance>('/api/loyalty/balance')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useLoyaltyTransactions() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['loyalty', 'transactions'],
    queryFn: async () => {
      const { data } = await api.get<LoyaltyTransaction[]>('/api/loyalty/transactions')
      return data
    },
    enabled: isAuthenticated,
  })
}
