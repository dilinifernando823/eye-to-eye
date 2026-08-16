'use client'

import Image from 'next/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Star, Eye, Trash2, GripVertical } from 'lucide-react'
import type { AdminProductImage } from '@/types/admin'

interface ImageCardProps {
  image: AdminProductImage
  onSetPrimary: () => void
  onSetTryOn: () => void
  onDelete: () => void
}

export default function ImageCard({ image, onSetPrimary, onSetTryOn, onDelete }: ImageCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
    >
      <div className="relative aspect-square bg-gray-50">
        <Image src={image.image_url} alt="" fill className="object-cover" sizes="200px" />

        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 bg-white/90 rounded-lg p-1 cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5 text-gray-500" />
        </button>

        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {image.is_primary && (
            <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
              <Star className="h-2.5 w-2.5 fill-current" /> PRIMARY
            </span>
          )}
          {image.is_virtual_try_on && (
            <span
              className="flex items-center gap-1 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#0f3460' }}
            >
              <Eye className="h-2.5 w-2.5" /> TRY-ON
            </span>
          )}
        </div>
      </div>

      <div className="p-2.5 grid grid-cols-3 gap-1.5">
        <button
          onClick={onSetPrimary}
          className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            image.is_primary
              ? 'bg-yellow-50 text-yellow-700'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${image.is_primary ? 'fill-current' : ''}`} />
          Primary
        </button>
        <button
          onClick={onSetTryOn}
          className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
            image.is_virtual_try_on ? 'text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
          style={image.is_virtual_try_on ? { backgroundColor: '#0f3460' } : undefined}
        >
          <Eye className="h-3.5 w-3.5" />
          Try-On
        </button>
        <button
          onClick={onDelete}
          className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
    </div>
  )
}
