'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronRight } from 'lucide-react'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'
import type { Order } from '@/types'

const STATUS_OPTIONS: Order['status'][] = ['pending', 'processing', 'dispatched', 'delivered', 'cancelled']

const mockOrders: Order[] = [
  {
    id: 1, order_reference: 'ETE-00041', user_id: 1, status: 'delivered',
    subtotal: 12000, loyalty_discount: 0, total: 12000, loyalty_points_earned: 120,
    loyalty_points_used: 0, delivery_name: 'Chamara Perera', delivery_address: '45 Galle Road',
    delivery_city: 'Colombo', delivery_phone: '0712345678', prescription_url: null,
    created_at: '2024-03-15T10:00:00Z', items: [],
  },
  {
    id: 2, order_reference: 'ETE-00040', user_id: 2, status: 'processing',
    subtotal: 5500, loyalty_discount: 0, total: 5500, loyalty_points_earned: 55,
    loyalty_points_used: 0, delivery_name: 'Nisha Fernando', delivery_address: '12 Kandy Road',
    delivery_city: 'Kandy', delivery_phone: '0723456789', prescription_url: null,
    created_at: '2024-03-14T10:00:00Z', items: [],
  },
  {
    id: 3, order_reference: 'ETE-00039', user_id: 3, status: 'dispatched',
    subtotal: 8500, loyalty_discount: 500, total: 8000, loyalty_points_earned: 80,
    loyalty_points_used: 100, delivery_name: 'Ravi Wickramasinghe', delivery_address: '7 Temple Road',
    delivery_city: 'Galle', delivery_phone: '0734567890', prescription_url: null,
    created_at: '2024-03-13T10:00:00Z', items: [],
  },
  {
    id: 4, order_reference: 'ETE-00038', user_id: 1, status: 'pending',
    subtotal: 2500, loyalty_discount: 0, total: 2850, loyalty_points_earned: 25,
    loyalty_points_used: 0, delivery_name: 'Amali Silva', delivery_address: '33 Beach Road',
    delivery_city: 'Negombo', delivery_phone: '0745678901', prescription_url: null,
    created_at: '2024-03-12T10:00:00Z', items: [],
  },
]

const FILTER_TABS = ['All', 'Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'] as const

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<string>('All')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [statuses, setStatuses] = useState<Record<number, Order['status']>>(
    Object.fromEntries(mockOrders.map((o) => [o.id, o.status]))
  )

  const filtered = mockOrders.filter((o) =>
    activeTab === 'All' ? true : o.status === activeTab.toLowerCase()
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5">{mockOrders.length} total orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Ref', 'Customer', 'Date', 'Total', 'Status', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3.5 font-semibold text-blue-700">{order.order_reference}</td>
                    <td className="px-4 py-3.5 text-gray-700">{order.delivery_name}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={statuses[order.id]}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation()
                          setStatuses((prev) => ({ ...prev, [order.id]: e.target.value as Order['status'] }))
                        }}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize cursor-pointer ${getOrderStatusColor(statuses[order.id])}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-white text-gray-900 capitalize">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="text-blue-700 hover:text-blue-800 p-1">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selectedOrder && (
          <div className="w-72 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex-shrink-0 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Reference</p>
                <p className="font-semibold text-blue-700">{selectedOrder.order_reference}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Customer</p>
                <p className="font-medium text-gray-900">{selectedOrder.delivery_name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Delivery Address</p>
                <p className="text-gray-700">{selectedOrder.delivery_address}, {selectedOrder.delivery_city}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Phone</p>
                <p className="text-gray-700">{selectedOrder.delivery_phone}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Date</p>
                <p className="text-gray-700">{formatDate(selectedOrder.created_at)}</p>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.loyalty_discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Loyalty Discount</span>
                    <span>-{formatPrice(selectedOrder.loyalty_discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 mt-1">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
