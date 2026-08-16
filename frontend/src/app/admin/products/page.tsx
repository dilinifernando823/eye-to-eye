'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { Edit, ImageIcon, PlusCircle, Trash2, Package } from 'lucide-react'
import {
  useAdminProducts,
  useToggleProductFeatured,
  useToggleProductActive,
  useDeleteProduct,
  useBulkProductAction,
} from '@/hooks/useAdminProducts'
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable'
import SearchInput from '@/components/admin/SearchInput'
import FilterBar from '@/components/admin/FilterBar'
import Pagination from '@/components/admin/Pagination'
import StatusBadge from '@/components/admin/StatusBadge'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { formatPrice, getPrimaryImage } from '@/lib/utils'
import type { AdminProduct } from '@/types/admin'

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null)

  const { data, isLoading } = useAdminProducts({
    page,
    size: 20,
    search: search || undefined,
    category: category || undefined,
    status: statusFilter || undefined,
  })
  const toggleFeatured = useToggleProductFeatured()
  const toggleActive = useToggleProductActive()
  const deleteProduct = useDeleteProduct()
  const bulkAction = useBulkProductAction()

  const products = data?.items ?? []

  const priceRange = (product: AdminProduct) => {
    if (product.variants.length === 0) return '—'
    const prices = product.variants.map((v) => v.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`
  }

  const stockTotal = (product: AdminProduct) =>
    product.variants.reduce((sum, v) => sum + v.stock_quantity, 0)

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))
    )
  }

  const handleBulk = async (action: 'activate' | 'deactivate') => {
    try {
      await bulkAction.mutateAsync({ action, product_ids: Array.from(selectedIds) })
      toast.success('Products updated')
      setSelectedIds(new Set())
    } catch {
      toast.error('Something went wrong')
    }
  }

  const columns: DataTableColumn<AdminProduct>[] = [
    {
      header: 'Image',
      accessor: (product) => (
        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={getPrimaryImage(product.images)}
            alt={product.name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ),
    },
    {
      header: 'Name',
      accessor: (product) => (
        <p className="font-medium text-[#1a1a2e] line-clamp-1 max-w-[200px]">{product.name}</p>
      ),
    },
    {
      header: 'Category',
      accessor: (product) => (
        <span className="text-gray-500 capitalize">{product.category.replace('_', ' ')}</span>
      ),
    },
    { header: 'Brand', accessor: (product) => <span className="text-gray-500">{product.brand}</span> },
    { header: 'Price Range', accessor: priceRange },
    { header: 'Stock', accessor: (product) => stockTotal(product) },
    {
      header: 'Status',
      accessor: (product) => <StatusBadge status={product.is_active ? 'active' : 'inactive'} />,
    },
    {
      header: 'Featured',
      accessor: (product) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFeatured.mutate(product.id)
          }}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            product.is_featured ? '' : 'bg-gray-200'
          }`}
          style={product.is_featured ? { backgroundColor: '#e94560' } : undefined}
          aria-label="Toggle featured"
        >
          <span
            className={`absolute top-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform ${
              product.is_featured ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (product) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/admin/products/${product.id}`}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1a1a2e]"
            aria-label="Edit"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/products/${product.id}/images`}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1a1a2e]"
            aria-label="Images"
          >
            <ImageIcon className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setDeleteTarget(product)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{data?.total ?? 0} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <PlusCircle className="h-4 w-4" /> Add New Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          placeholder="Search by name or brand..."
        />
        <div className="flex items-center gap-3">
          <FilterBar
            filters={[
              {
                label: 'Category',
                value: category,
                onChange: (value) => {
                  setCategory(value)
                  setPage(1)
                },
                options: [
                  { label: 'All Categories', value: '' },
                  { label: 'Spectacles', value: 'spectacles' },
                  { label: 'Sunglasses', value: 'sunglasses' },
                  { label: 'Contact Lenses', value: 'contact_lenses' },
                ],
              },
              {
                label: 'Status',
                value: statusFilter,
                onChange: (value) => {
                  setStatusFilter(value)
                  setPage(1)
                },
                options: [
                  { label: 'All Status', value: '' },
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ],
              },
            ]}
          />
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-white border border-gray-100 rounded-lg px-4 py-3">
          <p className="text-sm text-gray-600">{selectedIds.size} selected</p>
          <button
            onClick={() => handleBulk('activate')}
            className="text-sm font-medium text-green-700 hover:underline"
          >
            Bulk Activate
          </button>
          <button
            onClick={() => handleBulk('deactivate')}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Bulk Deactivate
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(product) => product.id}
        isLoading={isLoading}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        emptyIcon={Package}
        emptyTitle="No products found"
        emptyDescription="Try adjusting your search or filters."
      />

      {data && (
        <Pagination page={data.page} pages={data.pages} total={data.total} onPageChange={setPage} />
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="Deactivate product?"
        message={`"${deleteTarget?.name}" will be hidden from the storefront. You can reactivate it later.`}
        confirmLabel="Deactivate"
        loading={deleteProduct.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteProduct.mutateAsync(deleteTarget.id)
            toast.success('Product deactivated')
          } catch {
            toast.error('Something went wrong')
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </div>
  )
}
