import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { Prescription, PrescriptionListItem, PrescriptionValuesInput } from '@/types'

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

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
}

export function useUploadPrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<Prescription>('/api/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useManualPrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: PrescriptionValuesInput) => {
      const { data } = await api.post<Prescription>('/api/prescriptions/manual', values)
      return data
    },
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useUpdatePrescriptionValues(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: PrescriptionValuesInput) => {
      const { data } = await api.put<Prescription>(`/api/prescriptions/${id}/values`, values)
      return data
    },
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useSetActivePrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<Prescription>(`/api/prescriptions/${id}/set-active`)
      return data
    },
    onSuccess: () => invalidateAll(queryClient),
  })
}

export function useDeletePrescription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/prescriptions/${id}`)
    },
    onSuccess: () => invalidateAll(queryClient),
  })
}
