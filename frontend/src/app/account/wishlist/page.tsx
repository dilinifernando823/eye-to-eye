'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { mockProducts } from '@/lib/mockData'
import { formatPrice, getMinPrice, getPrimaryImage } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useState } from 'react'

export default function WishlistPage() {
  // Mock: show first 3 products as wishlisted
  const [wishlisted, setWishlisted] = useState(mockProducts.slice(0, 3))
  const { addItem, openCart } = useCartStore()

  const removeFromWishlist = (productId: number) => {
    setWishlisted((prev) => prev.filter((p) => p.id !== productId))
  }

  const handleAddToCart = (product: (typeof mockProducts)[0]) => {
    const variant = product.variants[0]
    if (!variant) return
    addItem({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      imageUrl: getPrimaryImage(product.images),
      lensType: variant.lens_type,
      price: variant.price,
      quantity: 1,
      brand: product.brand,
    })
    openCart()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Account
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 text-sm mt-1">{wishlisted.length} saved items</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlisted.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-pink-50 rounded-full p-6 inline-flex mb-4">
              <Heart className="h-12 w-12 text-pink-300" />
            </div>
            <p className="text-xl font-semibold text-gray-900">Your wishlist is empty</p>
            <p className="text-gray-500 mt-1 mb-5">Save items you love by clicking the heart icon</p>
            <Link href="/spectacles" className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {wishlisted.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Link href={`/product/${product.id}`}>
                  <div className="relative h-48 bg-gray-50">
                    <Image
                      src={getPrimaryImage(product.images)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{product.brand}</p>
                  <p className="font-semibold text-gray-900 mt-0.5 line-clamp-1">{product.name}</p>
                  <p className="text-blue-700 font-bold mt-1">From {formatPrice(getMinPrice(product.variants))}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
