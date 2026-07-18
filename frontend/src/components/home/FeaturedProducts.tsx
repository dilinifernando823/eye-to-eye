'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductCard from '@/components/shop/ProductCard'
import { SkeletonCard } from '@/components/ui/LoadingSpinner'
import { useFeaturedProducts } from '@/hooks/useProducts'

export default function FeaturedProducts() {
  const { products, isLoading } = useFeaturedProducts()

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Collection</h2>
            <p className="text-gray-500 mt-2">Handpicked styles for every face</p>
          </div>
          <Link
            href="/spectacles"
            className="hidden sm:flex items-center gap-1 text-blue-700 font-semibold hover:gap-2 transition-all duration-200 text-sm"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible scrollbar-none">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="min-w-[260px] sm:min-w-0">
                  <SkeletonCard />
                </div>
              ))
            : products.map((product) => (
                <div key={product.id} className="min-w-[260px] sm:min-w-0">
                  <ProductCard product={product} />
                </div>
              ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href="/spectacles"
            className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
