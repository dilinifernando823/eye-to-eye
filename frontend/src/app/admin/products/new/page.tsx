'use client'

import ProductForm from '@/components/admin/ProductForm'
import { useCreateProduct } from '@/hooks/useAdminProducts'
import type { AdminProductFormValues } from '@/types/admin'

const EMPTY_VALUES: AdminProductFormValues = {
  name: '',
  description: '',
  category: '',
  brand: '',
  gender: '',
  frame_shape: '',
  frame_material: '',
  colour: '',
  is_active: true,
  is_featured: false,
  has_3d_model: false,
  gltf_model_url: '',
  variants: [{ lens_type: '', sku: '', price: 0, stock_quantity: 0 }],
}

export default function NewProductPage() {
  const createProduct = useCreateProduct()

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Add New Product</h1>
        <p className="text-gray-500 text-sm mt-0.5">Create a new product in your catalogue</p>
      </div>

      <ProductForm
        defaultValues={EMPTY_VALUES}
        submitLabel="Create Product"
        onSubmit={async (values) => {
          const product = await createProduct.mutateAsync(values)
          return { id: product.id }
        }}
      />
    </div>
  )
}
