import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { WishlistItem } from '@/types'

export function useWishlist() {
  const { isAuthenticated } = useAuthStore()

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const { data } = await api.get<WishlistItem[]>('/api/wishlist/')
      return data
    },
    enabled: isAuthenticated,
  })
}

export function useWishlistVariantIds(): Set<number> {
  const { data } = useWishlist()
  return useMemo(() => new Set((data ?? []).map((item) => item.variant_id)), [data])
}

/** Maps variant_id -> wishlist item id, so callers can remove-by-variant. */
export function useWishlistItemIdByVariant(): Map<number, number> {
  const { data } = useWishlist()
  return useMemo(
    () => new Map((data ?? []).map((item) => [item.variant_id, item.id])),
    [data]
  )
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variantId: number) => {
      const { data } = await api.post<WishlistItem>('/api/wishlist/', {
        variant_id: variantId,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (itemId: number) => {
      await api.delete(`/api/wishlist/${itemId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    },
  })
}

