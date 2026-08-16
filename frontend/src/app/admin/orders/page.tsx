'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Download, FileText, ShoppingCart } from 'lucide-react'
import { useAdminOrders, exportOrdersCsv, type OrderFilters } from '@/hooks/useAdminOrders'
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable'
import SearchInput from '@/components/admin/SearchInput'
import FilterBar from '@/components/admin/FilterBar'
import Pagination from '@/components/admin/Pagination'
import StatusBadge from '@/components/admin/StatusBadge'
import { formatPrice, formatDateTime } from '@/lib/utils'
import type { AdminOrderListItem } from '@/types/admin'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<OrderFilters>({ page: 1, size: 20 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [exporting, setExporting] = useState(false)

  const { data, isLoading } = useAdminOrders({
    ...filters,
    search: search || undefined,
    status: statusFilter || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  })

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportOrdersCsv({
        search: search || undefined,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      })
    } catch {
      toast.error('Failed to export orders')
    } finally {
      setExporting(false)
    }
  }

  const columns: DataTableColumn<AdminOrderListItem>[] = [
    {
      header: 'Order Ref',
      accessor: (order) => (
        <span className="font-mono font-semibold text-[#1a1a2e]">{order.order_reference}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: (order) => (
        <div>
          <p className="font-medium text-[#1a1a2e]">{order.customer_name}</p>
          <p className="text-xs text-gray-400">{order.customer_email}</p>
        </div>
      ),
    },
    {
      header: 'Date',
      accessor: (order) => (
        <span className="text-gray-500 whitespace-nowrap">{formatDateTime(order.created_at)}</span>
      ),
    },
    {
      header: 'Items',
      accessor: (order) => <span className="text-gray-600">{order.items_count}</span>,
    },
    {
      header: 'Total',
      accessor: (order) => (
        <span className="font-semibold text-[#1a1a2e]">{formatPrice(order.total)}</span>
      ),
    },
    { header: 'Status', accessor: (order) => <StatusBadge status={order.status} /> },
    {
      header: 'Prescription',
      align: 'center',
      accessor: (order) =>
        order.has_prescription ? (
          <FileText className="h-4 w-4 text-[#0f3460] mx-auto" />
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (order) => (
        <Link
          href={`/admin/orders/${order.id}`}
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.total ?? 0} total orders</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 border border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
        >
          <Download className="h-4 w-4" /> {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value)
            setFilters((prev) => ({ ...prev, page: 1 }))
          }}
          placeholder="Search by order ref or customer..."
        />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar
            filters={[
              {
                label: 'Status',
                value: statusFilter,
                onChange: (value) => {
                  setStatusFilter(value)
                  setFilters((prev) => ({ ...prev, page: 1 }))
                },
                options: [
                  { label: 'All Status', value: '' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Processing', value: 'processing' },
                  { label: 'Dispatched', value: 'dispatched' },
                  { label: 'Delivered', value: 'delivered' },
                  { label: 'Cancelled', value: 'cancelled' },
                ],
              },
            ]}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value)
              setFilters((prev) => ({ ...prev, page: 1 }))
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
          <span className="text-gray-400 text-sm">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value)
              setFilters((prev) => ({ ...prev, page: 1 }))
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(order) => order.id}
        onRowClick={(order) => router.push(`/admin/orders/${order.id}`)}
        isLoading={isLoading}
        emptyIcon={ShoppingCart}
        emptyTitle="No orders found"
        emptyDescription="Try adjusting your filters."
      />

      {data && (
        <Pagination
          page={data.page}
          pages={data.pages}
          total={data.total}
          onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        />
      )}
    </div>
  )
}
