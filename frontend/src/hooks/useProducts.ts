import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { mockProducts } from '@/lib/mockData'
import type { Product } from '@/types'

export function useProducts(category?: Product['category']) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const params = category ? { category } : {}
      const { data } = await api.get<Product[]>('/api/products', { params })
      return data
    },
    placeholderData: category
      ? mockProducts.filter((p) => p.category === category)
      : mockProducts,
  })

  return { products: data ?? mockProducts, isLoading, error }
}

export function useFeaturedProducts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await api.get<Product[]>('/api/products/featured')
      return data
    },
    placeholderData: mockProducts.slice(0, 6),
  })

  return { products: data ?? [], isLoading, error }
}

export function useProduct(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/api/products/${id}`)
      return data
    },
    placeholderData: mockProducts.find((p) => p.id === id),
  })

  return { product: data, isLoading, error }
}
