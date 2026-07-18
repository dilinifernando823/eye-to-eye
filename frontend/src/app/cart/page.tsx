'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore()

  const subtotal = totalPrice()
  const deliveryFee = subtotal >= 5000 ? 0 : 350
  const total = subtotal + deliveryFee

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="bg-blue-50 rounded-full p-8 inline-flex mb-6">
            <ShoppingBag className="h-16 w-16 text-blue-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven&apos;t added any products yet. Start browsing our collection!
          </p>
          <Link
            href="/spectacles"
            className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5"
              >
                <div className="flex gap-4">
                  <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">{item.brand}</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{item.productName}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.lensType}</p>
                    <p className="text-sm text-gray-600 mt-1">Unit: {formatPrice(item.price)}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                        <span className="px-4 py-2 text-sm font-semibold text-gray-900 border-x border-gray-200 min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="px-3 py-2 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-blue-700">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/spectacles"
              className="inline-flex items-center gap-2 text-blue-700 font-medium hover:text-blue-800 text-sm transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    <span>{formatPrice(deliveryFee)}</span>
                  )}
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-gray-400">
                    Add {formatPrice(5000 - subtotal)} more for free delivery
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <span className="font-bold text-xl text-blue-700">{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-5">
                <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </Link>

              <div className="flex items-center gap-2 mt-4 justify-center text-xs text-gray-500">
                <Truck className="h-3.5 w-3.5" />
                {deliveryFee === 0 ? 'Free delivery on this order!' : 'Pay in-store upon delivery'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
