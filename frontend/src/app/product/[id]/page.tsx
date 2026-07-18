import { notFound } from 'next/navigation'
import type { Product } from '@/types'
import ProductDetailClient from './ProductDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getProduct(id: string): Promise<Product | null> {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    cache: 'no-store',
  })

  if (!response.ok) return null
  return response.json()
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  return <ProductDetailClient product={product} />
}
