'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { PlusCircle, Shield, Trash2 } from 'lucide-react'
import { useAdminAccounts, useDeleteAdminAccount } from '@/hooks/useAdminAccounts'
import { useAuthStore } from '@/store/authStore'
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { formatDate } from '@/lib/utils'
import type { AdminAccount } from '@/types/admin'

export default function AdminAccountsPage() {
  const { data: admins, isLoading } = useAdminAccounts()
  const deleteAdmin = useDeleteAdminAccount()
  const { user } = useAuthStore()
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null)

  const columns: DataTableColumn<AdminAccount>[] = [
    {
      header: 'Admin',
      accessor: (admin) => (
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: '#1a1a2e' }}
          >
            {admin.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-[#1a1a2e]">{admin.full_name}</p>
            <p className="text-xs text-gray-400">{admin.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Created', accessor: (admin) => formatDate(admin.created_at) },
    {
      header: 'Status',
      accessor: (admin) => <StatusBadge status={admin.is_active ? 'active' : 'inactive'} />,
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (admin) => {
        const isSelf = admin.id === user?.id
        return (
          <button
            onClick={() => !isSelf && setDeleteTarget(admin)}
            disabled={isSelf}
            title={isSelf ? 'Cannot delete your own account' : undefined}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Delete admin"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )
      },
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Admin Accounts</h1>
          <p className="text-gray-500 text-sm mt-0.5">{admins?.length ?? 0} admin accounts</p>
        </div>
        <Link
          href="/admin/admins/new"
          className="flex items-center gap-2 bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <PlusCircle className="h-4 w-4" /> Add Admin Account
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={admins ?? []}
        keyExtractor={(admin) => admin.id}
        isLoading={isLoading}
        emptyIcon={Shield}
        emptyTitle="No admin accounts"
      />

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete admin account?"
        message={`"${deleteTarget?.full_name}" will permanently lose admin access.`}
        confirmLabel="Delete"
        loading={deleteAdmin.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteAdmin.mutateAsync(deleteTarget.id)
            toast.success('Admin account deleted')
          } catch {
            toast.error('Failed to delete admin account')
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </div>
  )
}
