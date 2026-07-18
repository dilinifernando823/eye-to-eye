import HeroBanner from '@/components/home/HeroBanner'
import CategorySection from '@/components/home/CategorySection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import TryOnPromo from '@/components/home/TryOnPromo'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import TestimonialsSection from '@/components/home/TestimonialsSection'

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategorySection />
      <FeaturedProducts />
      <TryOnPromo />
      <WhyChooseUs />
      <TestimonialsSection />
    </>
  )
}
