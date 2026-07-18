import ProductListingPage from '@/components/shop/ProductListingPage'

export const metadata = {
  title: 'Contact Lenses | Eye To Eye Opticians',
  description: 'Browse daily, monthly and yearly contact lenses.',
}

export default function ContactLensesPage() {
  return (
    <ProductListingPage
      category="contact_lenses"
      title="Contact Lenses"
      description="Comfortable, high-clarity lenses for every lifestyle."
    />
  )
}
