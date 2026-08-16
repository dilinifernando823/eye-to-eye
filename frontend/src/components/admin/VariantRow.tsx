import { Trash2 } from 'lucide-react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { AdminProductFormValues } from '@/types/admin'

interface VariantRowProps {
  index: number
  register: UseFormRegister<AdminProductFormValues>
  errors: FieldErrors<AdminProductFormValues>
  onRemove: () => void
  canRemove: boolean
}

export default function VariantRow({ index, register, errors, onRemove, canRemove }: VariantRowProps) {
  const variantErrors = errors.variants?.[index]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 items-start bg-gray-50 rounded-lg p-3">
      <div>
        <input
          {...register(`variants.${index}.lens_type`)}
          placeholder="Lens Type (e.g. Single Vision)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
        />
        {variantErrors?.lens_type && (
          <p className="text-xs text-red-500 mt-1">{variantErrors.lens_type.message}</p>
        )}
      </div>
      <div>
        <input
          {...register(`variants.${index}.sku`)}
          placeholder="SKU"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
        />
        {variantErrors?.sku && (
          <p className="text-xs text-red-500 mt-1">{variantErrors.sku.message}</p>
        )}
      </div>
      <div>
        <input
          type="number"
          step="0.01"
          min={0}
          {...register(`variants.${index}.price`, { valueAsNumber: true })}
          placeholder="Price"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
        />
        {variantErrors?.price && (
          <p className="text-xs text-red-500 mt-1">{variantErrors.price.message}</p>
        )}
      </div>
      <div>
        <input
          type="number"
          min={0}
          {...register(`variants.${index}.stock_quantity`, { valueAsNumber: true })}
          placeholder="Stock"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
        />
        {variantErrors?.stock_quantity && (
          <p className="text-xs text-red-500 mt-1">{variantErrors.stock_quantity.message}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        className="p-2 rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Remove variant"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}
