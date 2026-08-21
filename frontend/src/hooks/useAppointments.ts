import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Appointment } from '@/types'

export function useMyAppointments() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data } = await api.get<Appointment[]>('/api/appointments/')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete<{ message: string }>(`/api/appointments/${id}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}
