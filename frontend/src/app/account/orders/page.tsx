'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import type { Order } from '@/types'

const mockOrders: Order[] = [
  {
    id: 1,
    order_reference: 'ETE-00041',
    user_id: 1,
    status: 'delivered',
    subtotal: 12000,
    loyalty_discount: 0,
    total: 12000,
    loyalty_points_earned: 120,
    loyalty_points_used: 0,
    delivery_name: 'Chamara Perera',
    delivery_address: '45 Galle Road',
    delivery_city: 'Colombo',
    delivery_phone: '0712345678',
    prescription_url: null,
    created_at: '2024-03-15T10:00:00Z',
    items: [
      {
        id: 1,
        order_id: 1,
        variant_id: 1,
        quantity: 1,
        unit_price: 12000,
        variant: {
          id: 1,
          product_id: 1,
          lens_type: 'Crizal',
          sku: 'RB-TF-003',
          price: 12000,
          stock_quantity: 5,
          product: {
            id: 1,
            name: 'Classic Tortoise Frame',
            description: '',
            category: 'spectacles',
            brand: 'RayBan',
            gender: 'unisex',
            frame_shape: 'Rectangle',
            frame_material: 'Acetate',
            colour: 'Brown',
            has_3d_model: true,
            gltf_model_url: null,
            is_active: true,
            created_at: '2024-01-15T10:00:00Z',
            images: [{ id: 1, product_id: 1, image_url: 'https://picsum.photos/800/600?random=1', is_primary: true, display_order: 1 }],
            variants: [],
          },
        },
      },
    ],
  },
  {
    id: 2,
    order_reference: 'ETE-00038',
    user_id: 1,
    status: 'processing',
    subtotal: 5500,
    loyalty_discount: 0,
    total: 5500,
    loyalty_points_earned: 55,
    loyalty_points_used: 0,
    delivery_name: 'Chamara Perera',
    delivery_address: '45 Galle Road',
    delivery_city: 'Colombo',
    delivery_phone: '0712345678',
    prescription_url: null,
    created_at: '2024-03-20T10:00:00Z',
    items: [],
  },
]

const STATUS_BADGE: Record<Order['status'], 'warning' | 'info' | 'purple' | 'success' | 'error'> = {
  pending: 'warning',
  processing: 'info',
  dispatched: 'purple',
  delivered: 'success',
  cancelled: 'error',
}

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<number | null>(null)

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
        {mockOrders.length === 0 ? (
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
            {mockOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <Package className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.order_reference}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
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

                {expanded === order.id && order.items.length > 0 && (
                  <div className="border-t border-gray-100 px-5 pb-5">
                    <div className="pt-4 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                            <Image
                              src={item.variant.product.images[0]?.image_url ?? ''}
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
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
