'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, Eye } from 'lucide-react'
import type { Product } from '@/types'
import { formatPrice, getMinPrice, getPrimaryImage } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const primaryImage = getPrimaryImage(product.images)
  const secondaryImage = product.images.find((img) => !img.is_primary)?.image_url
  const minPrice = getMinPrice(product.variants)
  const displayImage = isHovered && secondaryImage ? secondaryImage : primaryImage
  const hasTryOn = product.has_3d_model && product.images.some((img) => img.is_virtual_try_on)

  return (
    <div
      className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 border border-gray-100 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative h-56 bg-gray-50 overflow-hidden">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {hasTryOn && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(`/product/${product.id}?tryOn=true`)
                }}
                className="inline-flex items-center gap-1 bg-blue-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-blue-800 transition-colors"
              >
                <Eye className="h-3 w-3" />
                Try On
              </button>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => {
              e.preventDefault()
              setIsWishlisted((prev) => !prev)
            }}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:shadow transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              className={`h-4 w-4 transition-colors duration-200 ${
                isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </Link>

      <Link href={`/product/${product.id}`} className="block p-4">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mb-1">
          {product.brand}
        </p>
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors">
          {product.name}
        </h3>
        {product.frame_shape && (
          <p className="text-xs text-gray-400 mb-2">{product.frame_shape} · {product.gender}</p>
        )}
        <p className="text-blue-700 font-bold">
          From {formatPrice(minPrice)}
        </p>
      </Link>
    </div>
  )
}
