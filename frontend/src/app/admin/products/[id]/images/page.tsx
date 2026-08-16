'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Save, ImageIcon } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import ImageUploadZone from '@/components/admin/ImageUploadZone'
import ImageCard from '@/components/admin/ImageCard'
import ConfirmModal from '@/components/admin/ConfirmModal'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import EmptyState from '@/components/admin/EmptyState'
import {
  useProductImages,
  useSetPrimaryImage,
  useSetTryOnImage,
  useDeleteProductImage,
  useReorderProductImages,
  useAdminProduct,
} from '@/hooks/useAdminProducts'
import type { AdminProductImage } from '@/types/admin'

export default function ProductImagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const productId = Number(id)

  const { data: product } = useAdminProduct(productId)
  const { data: images, isLoading } = useProductImages(productId)
  const setPrimary = useSetPrimaryImage(productId)
  const setTryOn = useSetTryOnImage(productId)
  const deleteImage = useDeleteProductImage(productId)
  const reorder = useReorderProductImages(productId)

  const [orderedImages, setOrderedImages] = useState<AdminProductImage[]>([])
  const [orderChanged, setOrderChanged] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminProductImage | null>(null)

  useEffect(() => {
    if (images) {
      setOrderedImages(images)
      setOrderChanged(false)
    }
  }, [images])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setOrderedImages((prev) => {
      const oldIndex = prev.findIndex((img) => img.id === active.id)
      const newIndex = prev.findIndex((img) => img.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
    setOrderChanged(true)
  }

  const handleSaveOrder = async () => {
    try {
      await reorder.mutateAsync(
        orderedImages.map((image, index) => ({ id: image.id, display_order: index }))
      )
      toast.success('Order saved')
      setOrderChanged(false)
    } catch {
      toast.error('Failed to save order')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <Link
          href={`/admin/products/${productId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#e94560] mb-2"
        >
          <ChevronLeft className="h-4 w-4" /> Back to product
        </Link>
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Manage Images</h1>
        <p className="text-gray-500 text-sm mt-0.5">{product?.name}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        <div className="bg-white rounded-xl shadow-md p-5 h-fit">
          <h2 className="font-bold text-[#1a1a2e] mb-4">Upload Images</h2>
          <ImageUploadZone
            productId={productId}
            currentCount={orderedImages.length}
            onUploaded={(image) => setOrderedImages((prev) => [...prev, image])}
          />

          <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-800 leading-relaxed">
              The <strong>Try-On Preview</strong> image is shown in the product listing to
              indicate Virtual Try-On is available for this product. It does not need to be a 3D
              model — it can be a flat product photo used as the preview. The actual 3D rendering
              uses the GLTF model URL set in the product form.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1a1a2e]">
              Images {orderedImages.length > 0 && `(${orderedImages.length})`}
            </h2>
            {orderChanged && (
              <button
                onClick={handleSaveOrder}
                disabled={reorder.isPending}
                className="flex items-center gap-2 bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> Save Order
              </button>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : orderedImages.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md">
              <EmptyState
                icon={ImageIcon}
                title="No images yet"
                description="Upload images using the panel on the left."
              />
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedImages.map((img) => img.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {orderedImages.map((image) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      onSetPrimary={() => setPrimary.mutate(image.id)}
                      onSetTryOn={() => setTryOn.mutate(image.id)}
                      onDelete={() => setDeleteTarget(image)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete image?"
        message="This image will be permanently removed from Cloudinary and this product."
        confirmLabel="Delete"
        loading={deleteImage.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteImage.mutateAsync(deleteTarget.id)
            setOrderedImages((prev) => prev.filter((img) => img.id !== deleteTarget.id))
            toast.success('Image deleted')
          } catch {
            toast.error('Failed to delete image')
          } finally {
            setDeleteTarget(null)
          }
        }}
      />
    </div>
  )
}
