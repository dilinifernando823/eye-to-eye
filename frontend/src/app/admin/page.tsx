import { DollarSign, ShoppingBag, Users, Calendar, TrendingUp, Eye } from 'lucide-react'
import { formatPrice, formatDate, getOrderStatusColor } from '@/lib/utils'

const stats = [
  { label: 'Total Sales', value: formatPrice(485200), icon: DollarSign, color: 'bg-blue-100 text-blue-700', change: '+12%' },
  { label: 'Total Orders', value: '127', icon: ShoppingBag, color: 'bg-green-100 text-green-700', change: '+8%' },
  { label: 'New Customers', value: '34', icon: Users, color: 'bg-purple-100 text-purple-700', change: '+21%' },
  { label: 'Appointments Today', value: '7', icon: Calendar, color: 'bg-amber-100 text-amber-700', change: '+3' },
]

const recentOrders = [
  { ref: 'ETE-00041', customer: 'Chamara Perera', date: '2024-03-15T10:00:00Z', total: 12000, status: 'delivered' as const },
  { ref: 'ETE-00040', customer: 'Nisha Fernando', date: '2024-03-14T10:00:00Z', total: 5500, status: 'processing' as const },
  { ref: 'ETE-00039', customer: 'Ravi W.', date: '2024-03-13T10:00:00Z', total: 8500, status: 'dispatched' as const },
  { ref: 'ETE-00038', customer: 'Amali Silva', date: '2024-03-12T10:00:00Z', total: 2500, status: 'pending' as const },
  { ref: 'ETE-00037', customer: 'Kasun De Silva', date: '2024-03-11T10:00:00Z', total: 14000, status: 'delivered' as const },
]

export default function AdminDashboard() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`${color} rounded-xl p-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sales chart placeholder */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Sales Overview</h2>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+12% this month</span>
            </div>
          </div>
          {/* Chart placeholder */}
          <div className="h-56 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-blue-200">
            <Eye className="h-10 w-10 text-blue-300 mb-3" />
            <p className="font-semibold text-blue-600">Sales Chart</p>
            <p className="text-sm text-blue-400 mt-1">Chart.js integration coming soon</p>
            <p className="text-xs text-blue-300 mt-1">Will display monthly revenue data</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4">This Week</h2>
          <div className="space-y-4">
            {[
              { label: 'Orders placed', value: '23', bar: 76 },
              { label: 'Eye tests booked', value: '11', bar: 48 },
              { label: 'New signups', value: '8', bar: 32 },
              { label: 'Returns', value: '2', bar: 8 },
            ].map(({ label, value, bar }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-blue-700 font-medium hover:text-blue-800">
            View All →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order Ref', 'Customer', 'Date', 'Total', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.ref} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold text-blue-700">{order.ref}</td>
                  <td className="px-5 py-3.5 text-gray-700">{order.customer}</td>
                  <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(order.date)}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button className="text-blue-700 hover:text-blue-800 font-medium text-xs">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
