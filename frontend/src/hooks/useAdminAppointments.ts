import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { AdminAppointment, PaginatedResponse } from '@/types/admin'

export interface AppointmentFilters {
  page?: number
  size?: number
  status?: string
  date_from?: string
  date_to?: string
}

export function useAdminAppointments(filters: AppointmentFilters) {
  return useQuery({
    queryKey: ['admin', 'appointments', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AdminAppointment>>(
        '/api/admin/appointments',
        { params: filters }
      )
      return data
    },
  })
}

export function useAdminAppointment(id: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'appointment', id],
    queryFn: async () => {
      const { data } = await api.get<AdminAppointment>(`/api/admin/appointments/${id}`)
      return data
    },
    enabled: id !== undefined,
  })
}

export function useUpdateAppointment(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { status?: string; notes?: string }) => {
      const { data } = await api.patch<AdminAppointment>(
        `/api/admin/appointments/${id}`,
        payload
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'appointment', id] })
    },
  })
}
