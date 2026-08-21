'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Heart,
  ShoppingCart,
  Camera,
  Truck,
  ChevronLeft,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatPrice, getPrimaryImage } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import {
  useAddToWishlist,
  useRemoveFromWishlist,
  useWishlistItemIdByVariant,
} from '@/hooks/useWishlist'
import type { Product, ProductVariant } from '@/types'
import VirtualTryOn from '@/components/ar/VirtualTryOn'
import Badge from '@/components/ui/Badge'

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tryOnPreviewImage = product.images.find((img) => img.is_virtual_try_on)
  const canTryOn = product.has_3d_model && !!tryOnPreviewImage

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants[0] ?? null
  )
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [showTryOn, setShowTryOn] = useState(
    canTryOn && searchParams.get('tryOn') === 'true'
  )
  const [addedToCart, setAddedToCart] = useState(false)

  const { addItem, openCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const wishlistItemIdByVariant = useWishlistItemIdByVariant()
  const wishlistItemId = selectedVariant
    ? wishlistItemIdByVariant.get(selectedVariant.id)
    : undefined
  const isWishlisted = wishlistItemId !== undefined
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/product/${product.id}`)
      return
    }
    if (!selectedVariant) return

    if (isWishlisted && wishlistItemId !== undefined) {
      removeFromWishlist.mutate(wishlistItemId)
    } else {
      addToWishlist.mutate(selectedVariant.id)
    }
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      productName: product.name,
      imageUrl: getPrimaryImage(product.images),
      lensType: selectedVariant.lens_type,
      price: selectedVariant.price,
      quantity,
      brand: product.brand,
    })
    setAddedToCart(true)
    openCart()
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const inStock = selectedVariant ? selectedVariant.stock_quantity > 0 : false

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
              <span>/</span>
              <Link href={`/${product.category.replace('_', '-')}`} className="hover:text-blue-700 transition-colors capitalize">
                {product.category.replace('_', ' ')}
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/${product.category.replace('_', '-')}`}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-6 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to {product.category.replace('_', ' ')}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* LEFT — Image gallery */}
            <div>
              <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm mb-3 aspect-square">
                <Image
                  src={product.images[activeImage]?.image_url ?? getPrimaryImage(product.images)}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  unoptimized
                />
                {canTryOn && (
                  <button
                    onClick={() => setShowTryOn(true)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm text-blue-700 border border-blue-200 font-semibold px-5 py-2.5 rounded-full shadow-md hover:bg-white hover:shadow-lg transition-all text-sm"
                  >
                    <Camera className="h-4 w-4" />
                    Virtual Try-On
                  </button>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(i)}
                      className={`relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        activeImage === i
                          ? 'border-blue-700 ring-2 ring-blue-300'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <Image src={img.image_url} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" unoptimized />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — Product details */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                {product.brand}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <Badge variant="info" className="capitalize">
                  {product.category.replace('_', ' ')}
                </Badge>
                {canTryOn && (
                  <Badge variant="success">Virtual Try-On Available</Badge>
                )}
              </div>

              <p className="text-3xl font-bold text-blue-700 mb-4">
                {selectedVariant ? formatPrice(selectedVariant.price) : '—'}
              </p>

              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

              {(product.frame_shape || product.frame_material) && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Category', value: product.category.replace('_', ' ') },
                    { label: 'Frame Shape', value: product.frame_shape },
                    { label: 'Material', value: product.frame_material },
                    { label: 'Colour', value: product.colour },
                    { label: 'Gender', value: product.gender },
                  ]
                    .filter((s) => s.value)
                    .map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        <p className="text-sm font-medium text-gray-900 capitalize">{value}</p>
                      </div>
                    ))}
                </div>
              )}

              <div className="mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-3">Select Lens Type</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      disabled={v.stock_quantity === 0}
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        selectedVariant?.id === v.id
                          ? 'border-blue-700 bg-blue-700 text-white'
                          : v.stock_quantity === 0
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {v.lens_type}
                      <span className="block text-xs opacity-75 mt-0.5">{formatPrice(v.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <p className="text-sm font-semibold text-gray-700">Quantity</p>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2.5 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="h-4 w-4 text-gray-600" />
                  </button>
                  <span className="px-5 py-2.5 font-semibold text-gray-900 border-x border-gray-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2.5 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                  {inStock
                    ? <><CheckCircle className="h-4 w-4" /> In Stock</>
                    : <><XCircle className="h-4 w-4" /> Out of Stock</>
                  }
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || !selectedVariant}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                  {addedToCart
                    ? <><CheckCircle className="h-5 w-5" /> Added!</>
                    : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
                  }
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`flex items-center justify-center gap-2 border-2 font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-blue-700 text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                  {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                </button>
              </div>

              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                <Truck className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-green-800">
                  <span className="font-semibold">Free delivery</span> on orders over LKR 5,000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTryOn && tryOnPreviewImage && (
        <VirtualTryOn
          productName={product.name}
          imageUrl={tryOnPreviewImage.image_url}
          onClose={() => setShowTryOn(false)}
        />
      )}
    </>
  )
}
