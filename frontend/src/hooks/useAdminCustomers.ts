import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { AdminCustomer, AdminCustomerDetail, PaginatedResponse } from '@/types/admin'

export interface CustomerFilters {
  page?: number
  size?: number
  search?: string
  is_active?: boolean
}

export function useAdminCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: ['admin', 'customers', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AdminCustomer>>('/api/admin/customers', {
        params: filters,
      })
      return data
    },
  })
}

export function useAdminCustomer(id: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: async () => {
      const { data } = await api.get<AdminCustomerDetail>(`/api/admin/customers/${id}`)
      return data
    },
    enabled: id !== undefined,
  })
}

export function useUpdateCustomer(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      full_name?: string
      phone?: string
      delivery_address?: string
      city?: string
      is_active?: boolean
    }) => {
      const { data } = await api.patch<AdminCustomer>(`/api/admin/customers/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'customer', id] })
    },
  })
}

export function useAdjustLoyaltyPoints(customerId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { points: number; description: string }) => {
      const { data } = await api.post(
        `/api/admin/customers/${customerId}/loyalty/adjust`,
        payload
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customerId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] })
    },
  })
}
