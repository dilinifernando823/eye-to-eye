import ProductListingPage from '@/components/shop/ProductListingPage'

export const metadata = {
  title: 'Sunglasses | Eye To Eye Opticians',
  description: 'Browse our collection of sunglasses with UV protection.',
}

export default function SunglassesPage() {
  return (
    <ProductListingPage
      category="sunglasses"
      title="Sunglasses"
      description="Protect your eyes in style — polarized and UV400 options available."
    />
  )
}
