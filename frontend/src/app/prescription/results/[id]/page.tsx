'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, AlertCircle, Glasses, Pencil, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePrescription, useUpdatePrescriptionValues } from '@/hooks/usePrescriptions'
import { formatPrice, getPrimaryImage } from '@/lib/utils'
import { getErrorMessage } from '@/lib/errors'
import Input from '@/components/ui/Input'
import type { PrescriptionValuesInput } from '@/types'

export default function PrescriptionResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const prescriptionId = Number(id)
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { data: prescription, isLoading } = usePrescription(prescriptionId)
  const updateValues = useUpdatePrescriptionValues(prescriptionId)

  const [isEditing, setIsEditing] = useState(false)
  const [values, setValues] = useState<PrescriptionValuesInput>({})
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=/prescription/results/${id}`)
    }
  }, [isAuthenticated, router, id])

  useEffect(() => {
    if (prescription) {
      setValues({
        right_sph: prescription.right_sph,
        right_cyl: prescription.right_cyl,
        right_axis: prescription.right_axis,
        right_add: prescription.right_add,
        left_sph: prescription.left_sph,
        left_cyl: prescription.left_cyl,
        left_axis: prescription.left_axis,
        left_add: prescription.left_add,
        pd: prescription.pd,
      })
    }
  }, [prescription])

  if (!isAuthenticated) {
    return null
  }

  const setField = (field: keyof PrescriptionValuesInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSave = async () => {
    setError('')
    try {
      const payload = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v ? v : null])
      ) as PrescriptionValuesInput
      await updateValues.mutateAsync(payload)
      setIsEditing(false)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update your prescription. Please try again.'))
    }
  }

  if (isLoading || !prescription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const eyeRow = (label: string, sph: string | null, cyl: string | null, axis: string | null, add: string | null) => (
    <div className="grid grid-cols-5 gap-2 text-sm py-2">
      <span className="font-semibold text-gray-700">{label}</span>
      <span className="text-gray-900 font-mono text-center">{sph || '—'}</span>
      <span className="text-gray-900 font-mono text-center">{cyl || '—'}</span>
      <span className="text-gray-900 font-mono text-center">{axis || '—'}</span>
      <span className="text-gray-900 font-mono text-center">{add || '—'}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/account/prescriptions" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> My Prescriptions
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Your Lens Recommendation</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Recommendation banner */}
        <div className={`rounded-2xl p-6 border ${prescription.has_match ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-start gap-3">
            {prescription.has_match ? (
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-gray-900 flex items-center gap-2">
                <Glasses className="h-4 w-4" />
                Recommended: {prescription.recommended_lens_types?.join(', ') ?? 'Not determined'}
              </p>
              <p className="text-sm text-gray-600 mt-1">{prescription.lens_recommendation_reason}</p>
              {prescription.advice_message && (
                <p className="text-sm text-gray-700 mt-2 font-medium">{prescription.advice_message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Extracted values */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Prescription Values</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-sm text-blue-700 font-medium hover:text-blue-800"
              >
                <Pencil className="h-3.5 w-3.5" /> Correct Values
              </button>
            )}
          </div>

          {!isEditing ? (
            <div>
              <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-400 uppercase pb-1 border-b border-gray-100">
                <span>Eye</span>
                <span className="text-center">SPH</span>
                <span className="text-center">CYL</span>
                <span className="text-center">Axis</span>
                <span className="text-center">ADD</span>
              </div>
              {eyeRow('Right (OD)', prescription.right_sph, prescription.right_cyl, prescription.right_axis, prescription.right_add)}
              {eyeRow('Left (OS)', prescription.left_sph, prescription.left_cyl, prescription.left_axis, prescription.left_add)}
              <p className="text-sm text-gray-500 mt-3">PD: <span className="font-mono text-gray-900">{prescription.pd || '—'}</span></p>
              {!prescription.ocr_success && prescription.file_url && (
                <p className="text-xs text-amber-600 mt-3">
                  We couldn&apos;t automatically read all values from your file — please correct them above if needed.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Right Eye (OD)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input label="SPH" value={values.right_sph ?? ''} onChange={setField('right_sph')} />
                  <Input label="CYL" value={values.right_cyl ?? ''} onChange={setField('right_cyl')} />
                  <Input label="Axis" value={values.right_axis ?? ''} onChange={setField('right_axis')} />
                  <Input label="ADD" value={values.right_add ?? ''} onChange={setField('right_add')} />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Left Eye (OS)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input label="SPH" value={values.left_sph ?? ''} onChange={setField('left_sph')} />
                  <Input label="CYL" value={values.left_cyl ?? ''} onChange={setField('left_cyl')} />
                  <Input label="Axis" value={values.left_axis ?? ''} onChange={setField('left_axis')} />
                  <Input label="ADD" value={values.left_add ?? ''} onChange={setField('left_add')} />
                </div>
              </div>
              <Input label="Pupillary Distance (PD, mm)" value={values.pd ?? ''} onChange={setField('pd')} />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setIsEditing(false); setError('') }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={updateValues.isPending}
                  className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  {updateValues.isPending ? 'Saving...' : 'Save & Recalculate'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Matching frames */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-700" />
            Frames With Your Recommended Lenses
          </h2>
          {prescription.matching_variants.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <p className="text-gray-500">No frames currently in stock with this lens type.</p>
              <Link href="/spectacles" className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm mt-3 hover:text-blue-800">
                Browse All Frames
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {prescription.matching_variants.map((variant) => (
                <Link
                  key={variant.id}
                  href={`/product/${variant.product_id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group"
                >
                  <div className="relative aspect-square bg-gray-50">
                    <Image
                      src={getPrimaryImage(variant.product.images)}
                      alt={variant.product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      unoptimized
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-400">{variant.product.brand}</p>
                    <p className="font-medium text-sm text-gray-900 line-clamp-1">{variant.product.name}</p>
                    <p className="font-bold text-blue-700 text-sm mt-1">{formatPrice(variant.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
