import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Prescription, PrescriptionListItem } from '@/types'

export function useMyPrescriptions() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionListItem[]>('/api/prescriptions/')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useActivePrescription() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['prescriptions', 'active'],
    queryFn: async () => {
      try {
        const { data } = await api.get<Prescription>('/api/prescriptions/active')
        return data
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          return null
        }
        throw err
      }
    },
    enabled: isAuthenticated,
  })
}

export function usePrescription(id: number | undefined) {
  return useQuery({
    queryKey: ['prescriptions', id],
    queryFn: async () => {
      const { data } = await api.get<Prescription>(`/api/prescriptions/${id}`)
      return data
    },
    enabled: id !== undefined,
  })
}
