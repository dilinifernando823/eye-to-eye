'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useMyOrders, useOrder } from '@/hooks/useOrders'
import type { Order, OrderListItem } from '@/types'

const STATUS_BADGE: Record<Order['status'], 'warning' | 'info' | 'purple' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  dispatched: 'purple',
  delivered: 'success',
  cancelled: 'error',
}

function OrderItemsDetail({ orderId }: { orderId: number }) {
  const { data: order, isLoading } = useOrder(orderId)

  if (isLoading || !order) {
    return (
      <div className="border-t border-gray-100 px-5 pb-5 pt-4">
        <div className="h-14 bg-gray-50 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="border-t border-gray-100 px-5 pb-5">
      <div className="pt-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
              <Image
                src={item.variant.product.images[0]?.image_url ?? '/placeholder.jpg'}
                alt={item.variant.product.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900">{item.variant.product.name}</p>
              <p className="text-xs text-gray-500">{item.variant.lens_type} × {item.quantity}</p>
            </div>
            <p className="font-semibold text-sm text-gray-900">{formatPrice(item.unit_price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 space-y-1">
        <p>Delivering to: {order.delivery_name}, {order.delivery_address}, {order.delivery_city}</p>
        {order.loyalty_discount > 0 && (
          <p className="text-green-600">Loyalty discount applied: −{formatPrice(order.loyalty_discount)}</p>
        )}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [expanded, setExpanded] = useState<number | null>(null)
  const { data: orders, isLoading } = useMyOrders()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/account/orders')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const items: OrderListItem[] = orders ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Account
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-20 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-blue-50 rounded-full p-6 inline-flex mb-4">
              <Package className="h-12 w-12 text-blue-300" />
            </div>
            <p className="text-xl font-semibold text-gray-900">No orders yet</p>
            <p className="text-gray-500 mt-1 mb-5">Your order history will appear here</p>
            <Link href="/spectacles" className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <Package className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.order_reference}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(order.created_at)} · {order.items_count} item{order.items_count === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-blue-700">{formatPrice(order.total)}</p>
                    <Badge variant={STATUS_BADGE[order.status]} className="capitalize">
                      {order.status}
                    </Badge>
                    <button
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      className="flex items-center gap-1 text-sm text-blue-700 font-medium hover:text-blue-800"
                    >
                      {expanded === order.id ? (
                        <><ChevronUp className="h-4 w-4" /> Hide</>
                      ) : (
                        <><ChevronDown className="h-4 w-4" /> Details</>
                      )}
                    </button>
                  </div>
                </div>

                {expanded === order.id && <OrderItemsDetail orderId={order.id} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
