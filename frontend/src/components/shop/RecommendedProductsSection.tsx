'use client'

import { Sparkles, TrendingUp } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { useRecommendations } from '@/hooks/useRecommendations'

interface RecommendedProductsSectionProps {
  limit?: number
}

export default function RecommendedProductsSection({ limit = 8 }: RecommendedProductsSectionProps) {
  const { data, isLoading } = useRecommendations(limit)

  if (!isLoading && (!data || data.items.length === 0)) return null

  const heading = data?.source === 'personalised' ? 'Picked For You' : 'Most Popular Right Now'
  const Icon = data?.source === 'personalised' ? Sparkles : TrendingUp

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Icon className="h-6 w-6 text-blue-700" />
          <h2 className="text-3xl font-bold text-gray-900">{heading}</h2>
          {data?.source === 'personalised' && (
            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
              Based on your purchases
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.items.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  )
}
