import HeroBanner from '@/components/home/HeroBanner'
import CategorySection from '@/components/home/CategorySection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import RecommendedProductsSection from '@/components/shop/RecommendedProductsSection'
import TryOnPromo from '@/components/home/TryOnPromo'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import TestimonialsSection from '@/components/home/TestimonialsSection'

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategorySection />
      <FeaturedProducts />
      <RecommendedProductsSection limit={8} />
      <TryOnPromo />
      <WhyChooseUs />
      <TestimonialsSection />
    </>
  )
}
