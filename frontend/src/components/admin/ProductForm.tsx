'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Plus } from 'lucide-react'
import VariantRow from './VariantRow'
import type { AdminProductFormValues } from '@/types/admin'

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z
    .enum(['spectacles', 'sunglasses', 'contact_lenses', ''])
    .refine((value) => value !== '', { message: 'Category is required' }),
  brand: z.string().min(1, 'Brand is required'),
  gender: z.string(),
  frame_shape: z.string(),
  frame_material: z.string(),
  colour: z.string().min(1, 'Colour is required'),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  has_3d_model: z.boolean(),
  gltf_model_url: z.string(),
  variants: z
    .array(
      z.object({
        id: z.number().optional(),
        lens_type: z.string().min(1, 'Required'),
        sku: z.string().min(1, 'Required'),
        price: z.number().min(0, 'Must be 0 or more'),
        stock_quantity: z.number().min(0, 'Must be 0 or more'),
      })
    )
    .min(1, 'Add at least one variant'),
})

const GENDERS = ['Unisex', 'Men', 'Women', 'Kids']
const FRAME_SHAPES = ['Rectangle', 'Round', 'Oval', 'Cat Eye', 'Aviator', 'Wayfarer', 'Geometric', 'Other']
const FRAME_MATERIALS = ['Metal', 'Acetate', 'Titanium', 'TR90', 'Wood', 'Mixed', 'Other']

interface ProductFormProps {
  defaultValues: AdminProductFormValues
  onSubmit: (values: AdminProductFormValues) => Promise<{ id: number }>
  submitLabel: string
}

export default function ProductForm({ defaultValues, onSubmit, submitLabel }: ProductFormProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isDirty },
  } = useForm<AdminProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const hasModel = watch('has_3d_model')

  const submit = async (values: AdminProductFormValues) => {
    setSubmitting(true)
    try {
      const product = await onSubmit(values)
      toast.success('Product saved')
      router.push(`/admin/products/${product.id}/images`)
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault()
        }
      }}
      className="space-y-6"
    >
      {/* Section 1 — Basic Info */}
      <section className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-[#1a1a2e] mb-4">Basic Info</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Name*
            </label>
            <input
              {...register('name')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description*
            </label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category*</label>
            <select
              {...register('category')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            >
              <option value="">Select category</option>
              <option value="spectacles">Spectacles</option>
              <option value="sunglasses">Sunglasses</option>
              <option value="contact_lenses">Contact Lenses</option>
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand*</label>
            <input
              {...register('brand')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
            {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
            <select
              {...register('gender')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            >
              <option value="">Select gender</option>
              {GENDERS.map((g) => (
                <option key={g} value={g.toLowerCase()}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Colour*</label>
            <input
              {...register('colour')}
              placeholder='e.g. "Black", "Tortoise Brown"'
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
            {errors.colour && (
              <p className="text-xs text-red-500 mt-1">{errors.colour.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Frame Shape</label>
            <select
              {...register('frame_shape')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            >
              <option value="">Select shape</option>
              {FRAME_SHAPES.map((shape) => (
                <option key={shape} value={shape}>
                  {shape}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Frame Material
            </label>
            <select
              {...register('frame_material')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            >
              <option value="">Select material</option>
              {FRAME_MATERIALS.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Section 2 — Visibility */}
      <section className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-[#1a1a2e] mb-4">Visibility</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('is_active')} className="sr-only peer" />
            <span className="relative w-10 h-5 rounded-full bg-gray-200 peer-checked:bg-[#e94560] transition-colors">
              <span className="absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </span>
            <span className="text-sm font-medium text-gray-700">Active (published)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('is_featured')} className="sr-only peer" />
            <span className="relative w-10 h-5 rounded-full bg-gray-200 peer-checked:bg-[#e94560] transition-colors">
              <span className="absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </span>
            <span className="text-sm font-medium text-gray-700">Featured on homepage</span>
          </label>
        </div>
      </section>

      {/* Section 3 — Variants */}
      <section className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#1a1a2e]">Product Variants</h2>
          <button
            type="button"
            onClick={() =>
              append({ lens_type: '', sku: '', price: 0, stock_quantity: 0 })
            }
            className="flex items-center gap-1.5 text-sm font-medium text-[#e94560] hover:underline"
          >
            <Plus className="h-4 w-4" /> Add Variant
          </button>
        </div>
        {errors.variants?.root && (
          <p className="text-xs text-red-500 mb-3">{errors.variants.root.message}</p>
        )}
        <div className="space-y-3">
          {fields.map((field, index) => (
            <VariantRow
              key={field.id}
              index={index}
              register={register}
              errors={errors}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
            />
          ))}
        </div>
      </section>

      {/* Section 4 — 3D / Virtual Try-On */}
      <section className="bg-white rounded-xl shadow-md p-6">
        <h2 className="font-bold text-[#1a1a2e] mb-4">3D / Virtual Try-On</h2>
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input type="checkbox" {...register('has_3d_model')} className="sr-only peer" />
          <span className="relative w-10 h-5 rounded-full bg-gray-200 peer-checked:bg-[#e94560] transition-colors">
            <span className="absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </span>
          <span className="text-sm font-medium text-gray-700">Has 3D Model for Try-On</span>
        </label>

        {hasModel && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              GLTF Model URL
            </label>
            <input
              {...register('gltf_model_url')}
              placeholder="https://res.cloudinary.com/.../model.glb"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          Upload the 3D model file to Cloudinary separately and paste the URL here. Mark one
          product image as the Virtual Try-On preview image in the Images tab after saving.
        </p>
      </section>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            if (isDirty && !window.confirm('Discard unsaved changes?')) return
            router.push('/admin/products')
          }}
          className="border border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-6 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
