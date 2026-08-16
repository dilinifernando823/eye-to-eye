import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import type {
  AdminProduct,
  AdminProductFormValues,
  AdminProductImage,
  PaginatedResponse,
} from '@/types/admin'

export interface ProductFilters {
  page?: number
  size?: number
  search?: string
  category?: string
  status?: string
}

export function useAdminProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AdminProduct>>('/api/admin/products', {
        params: filters,
      })
      return data
    },
  })
}

export function useAdminProduct(id: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: async () => {
      const { data } = await api.get<AdminProduct>(`/api/admin/products/${id}`)
      return data
    },
    enabled: id !== undefined,
  })
}

function invalidateProducts(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AdminProductFormValues) => {
      const { data } = await api.post<AdminProduct>('/api/admin/products', payload)
      return data
    },
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: AdminProductFormValues) => {
      const { data } = await api.put<AdminProduct>(`/api/admin/products/${id}`, payload)
      return data
    },
    onSuccess: () => {
      invalidateProducts(queryClient)
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', id] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/api/admin/products/${id}`)
    },
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export function useToggleProductFeatured() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<AdminProduct>(`/api/admin/products/${id}/toggle-featured`)
      return data
    },
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export function useToggleProductActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.patch<AdminProduct>(`/api/admin/products/${id}/toggle-active`)
      return data
    },
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export function useBulkProductAction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { action: 'activate' | 'deactivate'; product_ids: number[] }) => {
      const { data } = await api.post<{ message: string }>(
        '/api/admin/products/bulk-action',
        payload
      )
      return data
    },
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export function useProductImages(productId: number | undefined) {
  return useQuery({
    queryKey: ['admin', 'product-images', productId],
    queryFn: async () => {
      const { data } = await api.get<AdminProductImage[]>(
        `/api/admin/products/${productId}/images`
      )
      return data
    },
    enabled: productId !== undefined,
  })
}

function invalidateImages(queryClient: ReturnType<typeof useQueryClient>, productId: number) {
  queryClient.invalidateQueries({ queryKey: ['admin', 'product-images', productId] })
}

export function useUploadProductImage(productId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<AdminProductImage>(
        `/api/admin/products/${productId}/images/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return data
    },
    onSuccess: () => invalidateImages(queryClient, productId),
  })
}

export function useSetPrimaryImage(productId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (imageId: number) => {
      const { data } = await api.patch<AdminProductImage>(
        `/api/admin/products/${productId}/images/${imageId}/primary`
      )
      return data
    },
    onSuccess: () => invalidateImages(queryClient, productId),
  })
}

export function useSetTryOnImage(productId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (imageId: number) => {
      const { data } = await api.patch<AdminProductImage>(
        `/api/admin/products/${productId}/images/${imageId}/tryon`
      )
      return data
    },
    onSuccess: () => invalidateImages(queryClient, productId),
  })
}

export function useReorderProductImages(productId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (items: { id: number; display_order: number }[]) => {
      const { data } = await api.patch<AdminProductImage[]>(
        `/api/admin/products/${productId}/images/reorder`,
        { items }
      )
      return data
    },
    onSuccess: () => invalidateImages(queryClient, productId),
  })
}

export function useDeleteProductImage(productId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (imageId: number) => {
      await api.delete(`/api/admin/products/${productId}/images/${imageId}`)
    },
    onSuccess: () => invalidateImages(queryClient, productId),
  })
}
