'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Plus, CheckCircle, Trash2, Star, Glasses } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import {
  useMyPrescriptions,
  useSetActivePrescription,
  useDeletePrescription,
} from '@/hooks/usePrescriptions'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default function AccountPrescriptionsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { data: prescriptions, isLoading } = useMyPrescriptions()
  const setActive = useSetActivePrescription()
  const deletePrescription = useDeletePrescription()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/account/prescriptions')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const items = prescriptions ?? []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Account
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Prescriptions</h1>
            <Link
              href="/prescription"
              className="flex items-center gap-2 bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-800 transition-colors text-sm"
            >
              <Plus className="h-4 w-4" /> Add New
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-24 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-blue-50 rounded-full p-6 inline-flex mb-4">
              <FileText className="h-12 w-12 text-blue-300" />
            </div>
            <p className="text-xl font-semibold text-gray-900">No prescriptions saved yet</p>
            <p className="text-gray-500 mt-1 mb-5">Upload one to get a personalised lens recommendation</p>
            <Link href="/prescription" className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors">
              <Plus className="h-4 w-4" /> Upload Prescription
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((prescription) => (
              <div
                key={prescription.id}
                className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  prescription.is_active ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-100'
                }`}
              >
                <Link href={`/prescription/results/${prescription.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="bg-blue-50 rounded-xl p-3 flex-shrink-0">
                    <Glasses className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900">
                        {prescription.recommended_lens_types?.join(', ') ?? 'Prescription'}
                      </p>
                      {prescription.is_active && (
                        <Badge variant="info">Active</Badge>
                      )}
                      {prescription.has_match && (
                        <Badge variant="success">Frames Available</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {prescription.original_filename ?? 'Manual entry'} · {formatDate(prescription.created_at)}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {!prescription.is_active && (
                    <button
                      onClick={() => setActive.mutate(prescription.id)}
                      disabled={setActive.isPending}
                      className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <Star className="h-3.5 w-3.5" /> Set Active
                    </button>
                  )}
                  {prescription.is_active && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-green-600 px-3 py-2">
                      <CheckCircle className="h-3.5 w-3.5" /> In Use
                    </span>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Delete this prescription?')) {
                        deletePrescription.mutate(prescription.id)
                      }
                    }}
                    disabled={deletePrescription.isPending}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Delete prescription"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
