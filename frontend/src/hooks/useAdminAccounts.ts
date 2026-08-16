import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { AdminAccount } from '@/types/admin'

export function useAdminAccounts() {
  return useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: async () => {
      const { data } = await api.get<AdminAccount[]>('/api/admin/admins')
      return data
    },
  })
}

export function useCreateAdminAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { full_name: string; email: string; password: string }) => {
      const { data } = await api.post<AdminAccount>('/api/admin/admins', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] })
    },
  })
}

export function useDeleteAdminAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/admins/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] })
    },
  })
}
