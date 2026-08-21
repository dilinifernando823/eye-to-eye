'use client'

import ProductCard from '@/components/shop/ProductCard'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { useSimilarProducts } from '@/hooks/useRecommendations'

interface SimilarProductsSectionProps {
  productId: number
  limit?: number
}

export default function SimilarProductsSection({ productId, limit = 4 }: SimilarProductsSectionProps) {
  const { data, isLoading } = useSimilarProducts(productId, limit)

  if (!isLoading && (!data || data.items.length === 0)) return null

  return (
    <section className="py-10 border-t border-gray-100 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  )
}
