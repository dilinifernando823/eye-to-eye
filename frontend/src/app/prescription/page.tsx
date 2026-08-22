'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Upload, FileText, CheckCircle, PenLine, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUploadPrescription } from '@/hooks/usePrescriptions'
import { getErrorMessage } from '@/lib/errors'

export default function PrescriptionUploadPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = useUploadPrescription()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/prescription')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const handleFileChange = (selected: File | null) => {
    if (selected && ['application/pdf', 'image/jpeg', 'image/png'].includes(selected.type)) {
      setFile(selected)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setError('')
    try {
      const prescription = await upload.mutateAsync(file)
      router.push(`/prescription/results/${prescription.id}`)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to process your prescription. Please try again.'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Upload Your Prescription</h1>
          <p className="text-gray-500 text-sm">
            We&apos;ll read your prescription and recommend the right lens type for you.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-700" />
            Prescription File
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Upload a photo or scan of your prescription — PDF, JPG, or PNG.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileChange(e.dataTransfer.files[0]) }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">{file.name}</span>
              </div>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-700">Drop your prescription here</p>
                <p className="text-sm text-gray-400 mt-1">or click to browse — PDF, JPG, PNG</p>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mt-4">
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || upload.isPending}
            className="w-full mt-5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {upload.isPending ? 'Analysing Prescription...' : 'Upload & Analyse'}
            {!upload.isPending && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">Don&apos;t have a scan? Enter your values manually.</p>
          <Link
            href="/prescription/manual"
            className="inline-flex items-center gap-2 text-blue-700 font-semibold text-sm hover:text-blue-800"
          >
            <PenLine className="h-4 w-4" /> Enter Prescription Manually
          </Link>
        </div>
      </div>
    </div>
  )
}
