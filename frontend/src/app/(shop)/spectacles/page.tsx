import ProductListingPage from '@/components/shop/ProductListingPage'

export const metadata = {
  title: 'Spectacles | Eye To Eye Opticians',
  description: 'Browse our collection of prescription spectacles and frames.',
}

export default function SpectaclesPage() {
  return (
    <ProductListingPage
      category="spectacles"
      title="Spectacles"
      description="Premium prescription frames in every style, shape, and material."
    />
  )
}
