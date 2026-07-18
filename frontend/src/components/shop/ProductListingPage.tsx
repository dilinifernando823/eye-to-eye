'use client'

import { useState, useMemo } from 'react'
import { Filter, X } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import FilterSidebar, { FilterState, defaultFilters } from './FilterSidebar'
import ProductGrid from './ProductGrid'
import SortDropdown, { SortOption } from './SortDropdown'
import { getMinPrice } from '@/lib/utils'

interface ProductListingPageProps {
  category: 'spectacles' | 'sunglasses' | 'contact_lenses'
  title: string
  description: string
}

export default function ProductListingPage({
  category, title, description,
}: ProductListingPageProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters)
  const [sort, setSort] = useState<SortOption>('newest')
  const [showMobileFilter, setShowMobileFilter] = useState(false)

  const { products: categoryProducts, isLoading } = useProducts(category)

  const filtered = useMemo(() => {
    let products = categoryProducts

    const f = appliedFilters

    if (f.priceMin) {
      products = products.filter((p) => getMinPrice(p.variants) >= Number(f.priceMin))
    }
    if (f.priceMax) {
      products = products.filter((p) => getMinPrice(p.variants) <= Number(f.priceMax))
    }
    if (f.brands.length) {
      products = products.filter((p) => f.brands.includes(p.brand))
    }
    if (f.gender !== 'all') {
      products = products.filter((p) => p.gender === f.gender)
    }
    if (f.frameShapes.length) {
      products = products.filter((p) => f.frameShapes.includes(p.frame_shape))
    }
    if (f.frameMaterials.length) {
      products = products.filter((p) => f.frameMaterials.includes(p.frame_material))
    }
    if (f.colours.length) {
      products = products.filter((p) => f.colours.includes(p.colour))
    }

    // Sort
    return [...products].sort((a, b) => {
      if (sort === 'price_asc') return getMinPrice(a.variants) - getMinPrice(b.variants)
      if (sort === 'price_desc') return getMinPrice(b.variants) - getMinPrice(a.variants)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [categoryProducts, appliedFilters, sort])

  const handleApply = () => {
    setAppliedFilters(filters)
    setShowMobileFilter(false)
  }

  const handleClear = () => {
    setFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
  }

  const activeFilterCount = [
    appliedFilters.priceMin,
    appliedFilters.priceMax,
    ...appliedFilters.brands,
    appliedFilters.gender !== 'all' ? appliedFilters.gender : '',
    ...appliedFilters.frameShapes,
    ...appliedFilters.frameMaterials,
    ...appliedFilters.colours,
    ...appliedFilters.lensTypes,
    ...appliedFilters.materialTypes,
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop filter sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <FilterSidebar
                category={category}
                filters={filters}
                onChange={setFilters}
                onApply={handleApply}
                onClear={handleClear}
              />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile filter toggle */}
                <button
                  onClick={() => setShowMobileFilter(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-blue-700 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">{filtered.length}</span> products
                </p>
              </div>
              <SortDropdown value={sort} onChange={setSort} />
            </div>

            <ProductGrid products={filtered} isLoading={isLoading} />
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilter(false)}
          />
          <div className="relative ml-auto bg-white w-80 h-full overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setShowMobileFilter(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar
                category={category}
                filters={filters}
                onChange={setFilters}
                onApply={handleApply}
                onClear={handleClear}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
