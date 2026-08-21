'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react'
import { formatPrice, getPrimaryImage } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist'
import type { WishlistItem } from '@/types'

export default function WishlistPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { addItem, openCart } = useCartStore()
  const { data: wishlist, isLoading } = useWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/account/wishlist')
    }
  }, [isAuthenticated, router])

  const handleAddToCart = (item: WishlistItem) => {
    addItem({
      variantId: item.variant.id,
      productId: item.variant.product.id,
      productName: item.variant.product.name,
      imageUrl: getPrimaryImage(item.variant.product.images),
      lensType: item.variant.lens_type,
      price: item.variant.price,
      quantity: 1,
      brand: item.variant.product.brand ?? '',
    })
    removeFromWishlist.mutate(item.id)
    openCart()
  }

  if (!isAuthenticated) {
    return null
  }

  const items = wishlist ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Account
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} saved items</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-72 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
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
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <Link href={`/product/${item.variant.product.id}`}>
                  <div className="relative h-48 bg-gray-50">
                    <Image
                      src={getPrimaryImage(item.variant.product.images)}
                      alt={item.variant.product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{item.variant.product.brand}</p>
                  <p className="font-semibold text-gray-900 mt-0.5 line-clamp-1">{item.variant.product.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.variant.lens_type}</p>
                  <p className="text-blue-700 font-bold mt-1">{formatPrice(item.variant.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.variant.stock_quantity === 0}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {item.variant.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button
                      onClick={() => removeFromWishlist.mutate(item.id)}
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
