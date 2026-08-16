import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { AdminOrderDetail, AdminOrderListItem, OrderStatus, PaginatedResponse } from '@/types/admin'

export interface OrderFilters {
  page?: number
  size?: number
  status?: string
  date_from?: string
  date_to?: string
  search?: string
}

export function useAdminOrders(filters: OrderFilters) {
  return useQuery({
    queryKey: ['admin', 'orders', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AdminOrderListItem>>(
        '/api/admin/orders',
        { params: filters }
      )
      return data
    },
  })
}

export function useAdminOrder(id: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: async () => {
      const { data } = await api.get<AdminOrderDetail>(`/api/admin/orders/${id}`)
      return data
    },
    enabled: id !== undefined,
  })
}

export function useUpdateOrderStatus(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (nextStatus: OrderStatus) => {
      const { data } = await api.patch<AdminOrderDetail>(`/api/admin/orders/${id}/status`, {
        status: nextStatus,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', id] })
    },
  })
}

export async function exportOrdersCsv(filters: OrderFilters): Promise<void> {
  const { data } = await api.get('/api/admin/orders/export', {
    params: filters,
    responseType: 'blob',
  })
  const blob = new Blob([data], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
