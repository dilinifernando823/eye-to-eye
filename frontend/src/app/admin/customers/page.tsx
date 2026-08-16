'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Users } from 'lucide-react'
import { useAdminCustomers } from '@/hooks/useAdminCustomers'
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable'
import SearchInput from '@/components/admin/SearchInput'
import Pagination from '@/components/admin/Pagination'
import StatusBadge from '@/components/admin/StatusBadge'
import { formatDate, formatPrice } from '@/lib/utils'
import type { AdminCustomer } from '@/types/admin'

const AVATAR_COLORS = [
  'bg-red-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-purple-400',
  'bg-amber-400',
  'bg-pink-400',
  'bg-indigo-400',
]

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeOnly, setActiveOnly] = useState(false)

  const { data, isLoading } = useAdminCustomers({
    page,
    size: 20,
    search: search || undefined,
    is_active: activeOnly ? true : undefined,
  })

  const columns: DataTableColumn<AdminCustomer>[] = [
    {
      header: 'Customer',
      accessor: (customer) => (
        <div className="flex items-center gap-3">
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${avatarColor(customer.full_name)}`}
          >
            {customer.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-[#1a1a2e]">{customer.full_name}</p>
            <p className="text-xs text-gray-400">{customer.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: (customer) => <span className="text-gray-500">{customer.phone ?? '—'}</span>,
    },
    { header: 'Joined', accessor: (customer) => formatDate(customer.created_at) },
    {
      header: 'Orders',
      align: 'center',
      accessor: (customer) => (
        <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-1 rounded-full">
          {customer.total_orders}
        </span>
      ),
    },
    {
      header: 'Total Spent',
      accessor: (customer) => (
        <span className="font-semibold text-[#1a1a2e]">{formatPrice(customer.total_spent)}</span>
      ),
    },
    {
      header: 'Loyalty Pts',
      accessor: (customer) => (
        <span className="flex items-center gap-1 text-gray-600">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" /> {customer.loyalty_balance}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (customer) => <StatusBadge status={customer.is_active ? 'active' : 'inactive'} />,
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (customer) => (
        <Link
          href={`/admin/customers/${customer.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-medium text-[#e94560] hover:underline"
        >
          View
        </Link>
      ),
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Customers</h1>
        <p className="text-gray-500 text-sm mt-0.5">{data?.total ?? 0} total customers</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Search by name or email..."
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => {
              setActiveOnly(e.target.checked)
              setPage(1)
            }}
            className="rounded border-gray-300"
          />
          Active only
        </label>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(customer) => customer.id}
        onRowClick={(customer) => router.push(`/admin/customers/${customer.id}`)}
        isLoading={isLoading}
        emptyIcon={Users}
        emptyTitle="No customers found"
      />

      {data && (
        <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
      )}
    </div>
  )
}
