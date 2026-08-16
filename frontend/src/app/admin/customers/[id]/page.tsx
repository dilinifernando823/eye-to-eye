'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Star } from 'lucide-react'
import {
  useAdminCustomer,
  useUpdateCustomer,
  useAdjustLoyaltyPoints,
} from '@/hooks/useAdminCustomers'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import StatusBadge from '@/components/admin/StatusBadge'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { formatDate, formatDateTime, formatPrice } from '@/lib/utils'

type Tab = 'profile' | 'orders' | 'appointments' | 'loyalty'

const TRANSACTION_LABELS: Record<string, string> = {
  earned_purchase: 'Purchase Reward',
  earned_appointment: 'Appointment Reward',
  earned_referral: 'Referral Reward',
  redeemed: 'Redeemed',
  manual_adjustment: 'Manual Adjustment',
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const customerId = Number(id)

  const { data, isLoading } = useAdminCustomer(customerId)
  const updateCustomer = useUpdateCustomer(customerId)
  const adjustLoyalty = useAdjustLoyaltyPoints(customerId)

  const [tab, setTab] = useState<Tab>('profile')
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    delivery_address: '',
    city: '',
  })
  const [deactivateConfirm, setDeactivateConfirm] = useState(false)
  const [pointsInput, setPointsInput] = useState('')
  const [reasonInput, setReasonInput] = useState('')

  useEffect(() => {
    if (data) {
      setForm({
        full_name: data.customer.full_name,
        phone: data.customer.phone ?? '',
        delivery_address: data.customer.delivery_address ?? '',
        city: data.customer.city ?? '',
      })
    }
  }, [data])

  if (isLoading || !data) {
    return (
      <div className="p-6 lg:p-8">
        <LoadingSpinner />
      </div>
    )
  }

  const { customer, orders, appointments, loyalty_transactions } = data

  const handleSaveProfile = async () => {
    try {
      await updateCustomer.mutateAsync(form)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const handleToggleActive = async () => {
    try {
      await updateCustomer.mutateAsync({ is_active: !customer.is_active })
      toast.success(customer.is_active ? 'Customer deactivated' : 'Customer reactivated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setDeactivateConfirm(false)
    }
  }

  const handleAdjustPoints = async () => {
    const points = Number(pointsInput)
    if (!points || !reasonInput.trim()) {
      toast.error('Enter a point amount and reason')
      return
    }
    try {
      await adjustLoyalty.mutateAsync({ points, description: reasonInput })
      toast.success('Loyalty points adjusted')
      setPointsInput('')
      setReasonInput('')
    } catch {
      toast.error('Failed to adjust points')
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile', label: 'Profile' },
    { key: 'orders', label: `Orders (${orders.length})` },
    { key: 'appointments', label: `Appointments (${appointments.length})` },
    { key: 'loyalty', label: 'Loyalty' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#e94560] mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Customers
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">{customer.full_name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{customer.email}</p>
        </div>
        <StatusBadge status={customer.is_active ? 'active' : 'inactive'} />
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-[#e94560] text-[#e94560]'
                : 'border-transparent text-gray-500 hover:text-[#1a1a2e]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name*
              </label>
              <input
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Delivery Address
              </label>
              <textarea
                value={form.delivery_address}
                onChange={(e) => setForm({ ...form, delivery_address: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              onClick={() => setDeactivateConfirm(true)}
              className={`text-sm font-medium ${
                customer.is_active ? 'text-red-500 hover:underline' : 'text-green-600 hover:underline'
              }`}
            >
              {customer.is_active ? 'Deactivate Account' : 'Reactivate Account'}
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={updateCustomer.isPending}
              className="bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {orders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono font-semibold text-[#1a1a2e] hover:text-[#e94560]"
                      >
                        {order.order_reference}
                      </Link>
                      <p className="text-xs text-gray-400">{formatDateTime(order.created_at)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{order.items_count} items</td>
                    <td className="px-5 py-3.5 font-semibold text-[#1a1a2e]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'appointments' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {appointments.length === 0 ? (
            <EmptyState title="No appointments yet" />
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/appointments/${appt.id}`}
                        className="font-medium text-[#1a1a2e] hover:text-[#e94560]"
                      >
                        {formatDate(appt.appointment_date)}
                      </Link>
                      <p className="text-xs text-gray-400">{appt.appointment_time.slice(0, 5)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{appt.notes || '—'}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={appt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'loyalty' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500 mb-2">Current Balance</p>
              <p className="flex items-center gap-2 text-3xl font-bold text-[#1a1a2e]">
                <Star className="h-6 w-6 text-yellow-400 fill-current" />
                {customer.loyalty_balance.toLocaleString()} points
              </p>
              <p className="text-sm text-gray-400 mt-1">
                &asymp; {formatPrice(customer.loyalty_balance * 0.1)} redeemable value
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm font-semibold text-[#1a1a2e] mb-3">Manual Adjustment</p>
              <div className="space-y-3">
                <div>
                  <input
                    type="number"
                    value={pointsInput}
                    onChange={(e) => setPointsInput(e.target.value)}
                    placeholder="Points to add / deduct"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Enter a negative number to deduct points
                  </p>
                </div>
                <textarea
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Reason for adjustment"
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm resize-none"
                />
                <button
                  onClick={handleAdjustPoints}
                  disabled={adjustLoyalty.isPending}
                  className="w-full bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
                >
                  Apply Adjustment
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#1a1a2e]">Transaction History</h2>
            </div>
            {loyalty_transactions.length === 0 ? (
              <EmptyState title="No transactions yet" />
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {loyalty_transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-6 py-3.5 text-gray-500 whitespace-nowrap">
                        {formatDateTime(txn.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        {TRANSACTION_LABELS[txn.transaction_type] ?? txn.transaction_type}
                      </td>
                      <td
                        className={`px-4 py-3.5 font-semibold text-right ${
                          txn.points >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {txn.points >= 0 ? '+' : ''}
                        {txn.points}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{txn.description ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={deactivateConfirm}
        title={customer.is_active ? 'Deactivate this customer?' : 'Reactivate this customer?'}
        message={
          customer.is_active
            ? 'They will not be able to log in until reactivated.'
            : 'They will be able to log in again.'
        }
        confirmLabel={customer.is_active ? 'Deactivate' : 'Reactivate'}
        danger={customer.is_active}
        loading={updateCustomer.isPending}
        onCancel={() => setDeactivateConfirm(false)}
        onConfirm={handleToggleActive}
      />
    </div>
  )
}
