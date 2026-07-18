'use client'

import Image from 'next/image'
import { Trash2, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { formatPrice } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore()

  const handleDecrease = () => {
    if (item.quantity <= 1) {
      removeItem(item.variantId)
    } else {
      updateQuantity(item.variantId, item.quantity - 1)
    }
  }

  const handleIncrease = () => {
    updateQuantity(item.variantId, item.quantity + 1)
  }

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0">
      <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
        <Image
          src={item.imageUrl}
          alt={item.productName}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{item.brand}</p>
        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{item.productName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{item.lensType}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={handleDecrease}
              className="px-2 py-1 hover:bg-gray-100 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3 text-gray-600" />
            </button>
            <span className="px-3 py-1 text-sm font-medium text-gray-900 border-x border-gray-200 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrease}
              className="px-2 py-1 hover:bg-gray-100 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3 text-gray-600" />
            </button>
          </div>
          <p className="font-semibold text-blue-700 text-sm">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>
      </div>
      <button
        onClick={() => removeItem(item.variantId)}
        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 self-start mt-1"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
