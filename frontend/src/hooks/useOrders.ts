import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Order, OrderListItem } from '@/types'

export function useMyOrders() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get<OrderListItem[]>('/api/orders/')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useOrder(id: number | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data } = await api.get<Order>(`/api/orders/${id}`)
      return data
    },
    enabled: id !== undefined,
  })
}
