import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Banner, SiteSettings } from '@/types/admin'

export function useAdminSettings() {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const { data } = await api.get<SiteSettings>('/api/admin/settings')
      return data
    },
  })
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<SiteSettings>) => {
      const { data } = await api.patch<SiteSettings>('/api/admin/settings', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
  })
}

export function useAdminBanners() {
  return useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: async () => {
      const { data } = await api.get<Banner[]>('/api/admin/banners')
      return data
    },
  })
}

function invalidateBanners(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] })
}

export function useCreateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      file: File
      title?: string
      subtitle?: string
      cta_text?: string
      cta_link?: string
    }) => {
      const formData = new FormData()
      formData.append('file', payload.file)
      if (payload.title) formData.append('title', payload.title)
      if (payload.subtitle) formData.append('subtitle', payload.subtitle)
      if (payload.cta_text) formData.append('cta_text', payload.cta_text)
      if (payload.cta_link) formData.append('cta_link', payload.cta_link)

      const { data } = await api.post<Banner>('/api/admin/banners', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => invalidateBanners(queryClient),
  })
}

export function useUpdateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: number
      title?: string
      subtitle?: string
      cta_text?: string
      cta_link?: string
      is_active?: boolean
    }) => {
      const { data } = await api.patch<Banner>(`/api/admin/banners/${id}`, payload)
      return data
    },
    onSuccess: () => invalidateBanners(queryClient),
  })
}

export function useReorderBanners() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (items: { id: number; display_order: number }[]) => {
      const { data } = await api.patch<Banner[]>('/api/admin/banners/reorder', { items })
      return data
    },
    onSuccess: () => invalidateBanners(queryClient),
  })
}

export function useDeleteBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/banners/${id}`)
    },
    onSuccess: () => invalidateBanners(queryClient),
  })
}
