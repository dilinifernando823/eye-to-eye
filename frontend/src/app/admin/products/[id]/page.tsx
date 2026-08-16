'use client'

import { use } from 'react'
import Link from 'next/link'
import { ImageIcon } from 'lucide-react'
import ProductForm from '@/components/admin/ProductForm'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import { useAdminProduct, useUpdateProduct } from '@/hooks/useAdminProducts'
import type { AdminProductFormValues } from '@/types/admin'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const productId = Number(id)

  const { data: product, isLoading } = useAdminProduct(productId)
  const updateProduct = useUpdateProduct(productId)

  if (isLoading || !product) {
    return (
      <div className="p-6 lg:p-8">
        <LoadingSpinner />
      </div>
    )
  }

  const defaultValues: AdminProductFormValues = {
    name: product.name,
    description: product.description ?? '',
    category: product.category,
    brand: product.brand ?? '',
    gender: product.gender ?? '',
    frame_shape: product.frame_shape ?? '',
    frame_material: product.frame_material ?? '',
    colour: product.colour ?? '',
    is_active: product.is_active,
    is_featured: product.is_featured,
    has_3d_model: product.has_3d_model,
    gltf_model_url: product.gltf_model_url ?? '',
    variants: product.variants.map((variant) => ({
      id: variant.id,
      lens_type: variant.lens_type,
      sku: variant.sku,
      price: variant.price,
      stock_quantity: variant.stock_quantity,
    })),
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">{product.name}</p>
        </div>
        <Link
          href={`/admin/products/${productId}/images`}
          className="flex items-center gap-2 border border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <ImageIcon className="h-4 w-4" /> Manage Images
        </Link>
      </div>

      <ProductForm
        key={product.id}
        defaultValues={defaultValues}
        submitLabel="Save Changes"
        onSubmit={async (values) => {
          const updated = await updateProduct.mutateAsync(values)
          return { id: updated.id }
        }}
      />
    </div>
  )
}
