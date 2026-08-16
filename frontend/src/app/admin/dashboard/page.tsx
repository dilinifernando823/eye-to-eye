'use client'

import Link from 'next/link'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import EmptyState from '@/components/admin/EmptyState'
import { formatPrice, formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  pending: '#facc15',
  processing: '#3b82f6',
  dispatched: '#0ea5e9',
  delivered: '#22c55e',
  cancelled: '#ef4444',
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminAnalytics()

  if (isLoading || !data) {
    return (
      <div className="p-6 lg:p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <StatCard
          label="Total Revenue (this month)"
          value={formatPrice(data.this_month_revenue)}
          icon={DollarSign}
          trendPct={data.revenue_trend_pct}
        />
        <StatCard
          label="Total Orders (this month)"
          value={String(data.this_month_orders)}
          icon={ShoppingCart}
          trendPct={data.orders_trend_pct}
        />
        <StatCard
          label="New Customers (this month)"
          value={String(data.new_customers_this_month)}
          icon={Users}
          trendPct={data.customers_trend_pct}
        />
        <StatCard
          label="Appointments Booked (this month)"
          value={String(data.appointments_this_month)}
          icon={Calendar}
          trendPct={data.appointments_trend_pct}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-md p-5">
          <h2 className="font-bold text-[#1a1a2e] mb-4">Revenue — Last 30 Days</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.daily_revenue_last_30_days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(value: string) => value.slice(5)}
                interval={4}
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} width={70} />
              <Tooltip
                formatter={(value) => formatPrice(Number(value))}
                labelFormatter={(label) => formatDate(String(label))}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#e94560"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="font-bold text-[#1a1a2e] mb-4">Orders by Status</h2>
          {data.orders_by_status.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.orders_by_status}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {data.orders_by_status.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status] ?? '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  formatter={(value: string) => (
                    <span className="capitalize text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1a1a2e]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-[#e94560]">
              View All
            </Link>
          </div>
          {data.recent_orders.length === 0 ? (
            <EmptyState title="No orders yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {data.recent_orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-semibold text-[#1a1a2e] hover:text-[#e94560]"
                        >
                          {order.order_reference}
                        </Link>
                        <p className="text-xs text-gray-400">{order.customer_name}</p>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[#1a1a2e]">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1a1a2e]">Popular Products</h2>
            <Link href="/admin/products" className="text-sm font-medium text-[#e94560]">
              View All
            </Link>
          </div>
          {data.popular_products.length === 0 ? (
            <EmptyState title="No sales yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {data.popular_products.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="font-semibold text-[#1a1a2e] hover:text-[#e94560]"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-gray-400 capitalize">
                          {product.category.replace('_', ' ')}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-600">
                        {product.units_sold} sold
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[#1a1a2e]">
                        {formatPrice(product.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
