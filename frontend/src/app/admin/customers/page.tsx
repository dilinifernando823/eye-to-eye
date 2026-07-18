import { Users, Mail, Phone, MapPin, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { User } from '@/types'

const mockCustomers: User[] = [
  { id: 1, email: 'chamara@example.com', full_name: 'Chamara Perera', phone: '0712345678', role: 'customer', delivery_address: '45 Galle Road', city: 'Colombo', created_at: '2024-01-15T10:00:00Z' },
  { id: 2, email: 'nisha@example.com', full_name: 'Nisha Fernando', phone: '0723456789', role: 'customer', delivery_address: '12 Kandy Road', city: 'Kandy', created_at: '2024-01-20T10:00:00Z' },
  { id: 3, email: 'ravi@example.com', full_name: 'Ravi Wickramasinghe', phone: '0734567890', role: 'customer', delivery_address: '7 Temple Road', city: 'Galle', created_at: '2024-02-05T10:00:00Z' },
  { id: 4, email: 'amali@example.com', full_name: 'Amali Silva', phone: '0745678901', role: 'customer', delivery_address: '33 Beach Road', city: 'Negombo', created_at: '2024-02-15T10:00:00Z' },
  { id: 5, email: 'admin@eyetoeye.lk', full_name: 'Admin User', phone: '0112345678', role: 'admin', delivery_address: '123 Galle Road', city: 'Colombo', created_at: '2024-01-01T10:00:00Z' },
]

export default function AdminCustomersPage() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 text-sm mt-0.5">{mockCustomers.length} registered users</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Customers', value: mockCustomers.filter((u) => u.role === 'customer').length, icon: Users, color: 'bg-blue-50 text-blue-700' },
          { label: 'Admin Users', value: mockCustomers.filter((u) => u.role === 'admin').length, icon: Shield, color: 'bg-purple-50 text-purple-700' },
          { label: 'New This Month', value: 3, icon: Users, color: 'bg-green-50 text-green-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`${color} rounded-xl p-3`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Name', 'Email', 'Phone', 'Location', 'Role', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-xs">
                          {customer.full_name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900">{customer.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Mail className="h-3.5 w-3.5" />
                      {customer.email}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-500 whitespace-nowrap">
                      <Phone className="h-3.5 w-3.5" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-gray-500 whitespace-nowrap">
                      <MapPin className="h-3.5 w-3.5" />
                      {customer.city}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={customer.role === 'admin' ? 'purple' : 'info'} className="capitalize">
                      {customer.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                    {formatDate(customer.created_at)}
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
