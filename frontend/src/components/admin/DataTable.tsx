import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { SkeletonRow } from './LoadingSpinner'
import EmptyState from './EmptyState'

export interface DataTableColumn<T> {
  header: string
  accessor: (row: T) => ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  onRowClick?: (row: T) => void
  isLoading?: boolean
  emptyIcon?: LucideIcon
  emptyTitle?: string
  emptyDescription?: string
  selectable?: boolean
  selectedIds?: Set<number>
  onToggleSelect?: (id: number) => void
  onToggleSelectAll?: () => void
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyIcon,
  emptyTitle = 'No records found',
  emptyDescription,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: DataTableProps<T>) {
  const alignClass = (align?: 'left' | 'right' | 'center') =>
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100" style={{ backgroundColor: '#f1f5f9' }}>
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      !!selectedIds && data.length > 0 && selectedIds.size === data.length
                    }
                    onChange={onToggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${alignClass(column.align)}`}
                  style={{ color: '#1a1a2e' }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length + (selectable ? 1 : 0)} />
              ))}

            {!isLoading &&
              data.map((row) => {
                const id = keyExtractor(row)
                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-gray-50 last:border-0 transition-colors ${
                      onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''
                    }`}
                  >
                    {selectable && (
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds?.has(id as number) ?? false}
                          onChange={() => onToggleSelect?.(id as number)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.header}
                        className={`px-4 py-3.5 ${alignClass(column.align)} ${column.className ?? ''}`}
                      >
                        {column.accessor(row)}
                      </td>
                    ))}
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      {!isLoading && data.length === 0 && (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      )}
    </div>
  )
}
