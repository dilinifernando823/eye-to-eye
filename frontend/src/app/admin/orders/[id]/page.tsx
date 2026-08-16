'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { ChevronLeft, FileText, Star } from 'lucide-react'
import { useAdminOrder, useUpdateOrderStatus } from '@/hooks/useAdminOrders'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import StatusBadge from '@/components/admin/StatusBadge'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { formatPrice, formatDateTime } from '@/lib/utils'
import type { OrderStatus } from '@/types/admin'

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['dispatched', 'cancelled'],
  dispatched: ['delivered'],
  delivered: [],
  cancelled: [],
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const orderId = Number(id)

  const { data: order, isLoading } = useAdminOrder(orderId)
  const updateStatus = useUpdateOrderStatus(orderId)
  const [nextStatus, setNextStatus] = useState<OrderStatus | ''>('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isLoading || !order) {
    return (
      <div className="p-6 lg:p-8">
        <LoadingSpinner />
      </div>
    )
  }

  const options = ALLOWED_TRANSITIONS[order.status]

  const handleConfirm = async () => {
    if (!nextStatus) return
    try {
      await updateStatus.mutateAsync(nextStatus)
      toast.success('Order status updated')
      setNextStatus('')
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setConfirmOpen(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#e94560] mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-[#1a1a2e] font-mono">
                  {order.order_reference}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Placed {formatDateTime(order.created_at)}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#1a1a2e]">Order Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.product_image_url && (
                              <Image
                                src={item.product_image_url}
                                alt={item.product_name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[#1a1a2e]">{item.product_name}</p>
                            <p className="text-xs text-gray-400">{item.lens_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-center">×{item.quantity}</td>
                      <td className="px-4 py-4 text-gray-500 text-right whitespace-nowrap">
                        {formatPrice(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-[#1a1a2e] whitespace-nowrap">
                        {formatPrice(item.unit_price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.loyalty_discount > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Loyalty Discount</span>
                  <span>−{formatPrice(order.loyalty_discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-[#1a1a2e] text-base pt-1.5 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {order.prescription_url && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-[#1a1a2e]">Prescription</h2>
                <a
                  href={order.prescription_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-[#e94560] hover:underline"
                >
                  <FileText className="h-4 w-4" /> View Prescription
                </a>
              </div>
              {order.prescription_notes && (
                <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 whitespace-pre-wrap font-mono">
                  {order.prescription_notes}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-bold text-[#1a1a2e] mb-3">Update Status</h2>
            <p className="text-sm text-gray-500 mb-3">
              Current: <StatusBadge status={order.status} />
            </p>
            {options.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                No further status updates allowed.
              </p>
            ) : (
              <>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm capitalize"
                >
                  <option value="">Select new status</option>
                  {options.map((option) => (
                    <option key={option} value={option} className="capitalize">
                      {option}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setConfirmOpen(true)}
                  disabled={!nextStatus}
                  className="w-full bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  Update Status
                </button>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-bold text-[#1a1a2e] mb-3">Customer</h2>
            <Link
              href={`/admin/customers/${order.user_id}`}
              className="font-medium text-[#e94560] hover:underline"
            >
              {order.customer_name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">{order.customer_email}</p>
            {order.customer_phone && (
              <p className="text-sm text-gray-500">{order.customer_phone}</p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-bold text-[#1a1a2e] mb-3">Delivery Address</h2>
            <p className="text-sm text-gray-700">{order.delivery_name}</p>
            <p className="text-sm text-gray-500">{order.delivery_address}</p>
            <p className="text-sm text-gray-500">{order.delivery_city}</p>
            <p className="text-sm text-gray-500">{order.delivery_phone}</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-bold text-[#1a1a2e] mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" /> Loyalty Points
            </h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Points earned</span>
                <span className="font-medium text-green-600">
                  +{order.loyalty_points_earned} pts
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Points redeemed</span>
                <span className="font-medium text-red-500">
                  −{order.loyalty_points_used} pts
                </span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1.5 border-t border-gray-100">
                <span>Discount applied</span>
                <span className="font-medium">{formatPrice(order.loyalty_discount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Update order status?"
        message={`Update order ${order.order_reference} to "${nextStatus}"?`}
        confirmLabel="Update"
        danger={false}
        loading={updateStatus.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
