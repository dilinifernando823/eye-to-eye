'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'
import api from '@/lib/api'
import type { AdminProductImage } from '@/types/admin'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = { 'image/jpeg': [], 'image/png': [], 'image/webp': [] }

interface UploadingFile {
  id: string
  name: string
  progress: number
}

interface ImageUploadZoneProps {
  productId: number
  currentCount: number
  maxImages?: number
  onUploaded: (image: AdminProductImage) => void
}

export default function ImageUploadZone({
  productId,
  currentCount,
  maxImages = 10,
  onUploaded,
}: ImageUploadZoneProps) {
  const [uploading, setUploading] = useState<UploadingFile[]>([])

  const uploadFile = useCallback(
    async (file: File) => {
      const uploadId = `${file.name}-${Date.now()}`
      setUploading((prev) => [...prev, { id: uploadId, name: file.name, progress: 0 }])

      try {
        const formData = new FormData()
        formData.append('file', file)

        const { data } = await api.post<AdminProductImage>(
          `/api/admin/products/${productId}/images/upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
              const progress = event.total ? Math.round((event.loaded / event.total) * 100) : 50
              setUploading((prev) =>
                prev.map((item) => (item.id === uploadId ? { ...item, progress } : item))
              )
            },
          }
        )
        onUploaded(data)
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      } finally {
        setUploading((prev) => prev.filter((item) => item.id !== uploadId))
      }
    },
    [productId, onUploaded]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: { file: File }[]) => {
      if (rejectedFiles.length > 0) {
        toast.error('Some files were rejected (must be JPG/PNG/WebP under 5MB)')
      }

      const remainingSlots = maxImages - currentCount - uploading.length
      if (remainingSlots <= 0) {
        toast.error(`Maximum ${maxImages} images per product`)
        return
      }

      const filesToUpload = acceptedFiles.slice(0, remainingSlots)
      if (filesToUpload.length < acceptedFiles.length) {
        toast.error(`Only ${remainingSlots} more image(s) can be added`)
      }

      filesToUpload.forEach((file) => uploadFile(file))
    },
    [currentCount, maxImages, uploading.length, uploadFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  })

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-[#e94560] bg-red-50' : 'border-gray-300 hover:border-[#e94560]'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-8 w-8 text-gray-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-[#1a1a2e]">
          {isDragActive ? 'Drop images here' : 'Drag & drop or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          JPG, PNG, WebP — max 5MB each — max {maxImages} images
        </p>
      </div>

      {uploading.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploading.map((file) => (
            <div key={file.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span className="truncate">{file.name}</span>
                <span>{file.progress}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e94560] transition-all duration-200"
                  style={{ width: `${file.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
