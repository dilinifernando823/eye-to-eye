'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { X, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import CartItem from './CartItem'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

export default function CartDrawer() {
  const { items, isOpen, closeCart, totalItems, totalPrice } = useCartStore()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />
      <div
        ref={drawerRef}
        className="relative bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slide-in-right"
        role="dialog"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-700" />
            <h2 className="font-semibold text-gray-900">
              Cart ({totalItems()} {totalItems() === 1 ? 'item' : 'items'})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="bg-blue-50 rounded-full p-6 mb-4">
                <ShoppingBag className="h-10 w-10 text-blue-300" />
              </div>
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">Add some eyewear to get started</p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={item.variantId} item={item} />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(totalPrice())}</span>
            </div>
            <Link href="/cart" onClick={closeCart} className="block">
              <Button variant="secondary" className="w-full">
                View Cart
              </Button>
            </Link>
            <Link href="/checkout" onClick={closeCart} className="block">
              <Button className="w-full">
                Checkout
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
