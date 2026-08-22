'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, PenLine, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useManualPrescription } from '@/hooks/usePrescriptions'
import { getErrorMessage } from '@/lib/errors'
import Input from '@/components/ui/Input'
import type { PrescriptionValuesInput } from '@/types'

const EMPTY_VALUES: PrescriptionValuesInput = {
  right_sph: '',
  right_cyl: '',
  right_axis: '',
  right_add: '',
  left_sph: '',
  left_cyl: '',
  left_axis: '',
  left_add: '',
  pd: '',
}

export default function ManualPrescriptionPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [values, setValues] = useState<PrescriptionValuesInput>(EMPTY_VALUES)
  const [error, setError] = useState('')

  const createManual = useManualPrescription()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/prescription/manual')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const setField = (field: keyof PrescriptionValuesInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const payload = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v ? v : null])
      ) as PrescriptionValuesInput
      const prescription = await createManual.mutateAsync(payload)
      router.push(`/prescription/results/${prescription.id}`)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save your prescription. Please try again.'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/prescription" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Upload
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <PenLine className="h-6 w-6 text-blue-700" /> Enter Prescription Manually
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter the values exactly as shown on your prescription slip.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Right Eye (OD)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input label="SPH" placeholder="-2.50" value={values.right_sph ?? ''} onChange={setField('right_sph')} />
              <Input label="CYL" placeholder="-0.75" value={values.right_cyl ?? ''} onChange={setField('right_cyl')} />
              <Input label="Axis" placeholder="90" value={values.right_axis ?? ''} onChange={setField('right_axis')} />
              <Input label="ADD" placeholder="+1.50" value={values.right_add ?? ''} onChange={setField('right_add')} />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Left Eye (OS)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input label="SPH" placeholder="-2.25" value={values.left_sph ?? ''} onChange={setField('left_sph')} />
              <Input label="CYL" placeholder="-0.50" value={values.left_cyl ?? ''} onChange={setField('left_cyl')} />
              <Input label="Axis" placeholder="85" value={values.left_axis ?? ''} onChange={setField('left_axis')} />
              <Input label="ADD" placeholder="+1.50" value={values.left_add ?? ''} onChange={setField('left_add')} />
            </div>
          </div>

          <Input
            label="Pupillary Distance (PD, mm)"
            placeholder="64"
            value={values.pd ?? ''}
            onChange={setField('pd')}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={createManual.isPending}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {createManual.isPending ? 'Saving...' : 'Get Lens Recommendation'}
            {!createManual.isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
