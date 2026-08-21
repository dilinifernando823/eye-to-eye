import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Product } from '@/types'

interface RecommendationsResponse {
  source: 'personalised' | 'popular'
  items: Product[]
}

export function useRecommendations(limit = 8) {
  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: async () => {
      const { data } = await api.get<RecommendationsResponse>('/api/recommendations/', {
        params: { limit },
      })
      return data
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useSimilarProducts(productId: number, limit = 4) {
  return useQuery({
    queryKey: ['similar-products', productId, limit],
    queryFn: async () => {
      const { data } = await api.get<{ items: Product[] }>(
        `/api/recommendations/similar/${productId}`,
        { params: { limit } }
      )
      return data
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
    retry: false,
  })
}
