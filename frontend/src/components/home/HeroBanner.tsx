import Link from 'next/link'
import { ArrowRight, Calendar } from 'lucide-react'
import Image from 'next/image'
export default function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-sky-500/20 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div className="text-center lg:text-left animate-fade-in">
            <p className="inline-block bg-blue-600/50 text-blue-200 text-sm font-medium px-4 py-1.5 rounded-full mb-5 border border-blue-500/40">
              Sri Lanka&apos;s Premium Optical Retailer
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              See The World{' '}
              <span className="text-sky-300">More Clearly</span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Premium eyewear for every style. Prescription spectacles, sunglasses, and contact
              lenses — now available online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/spectacles"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-800 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/appointments"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/60 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 hover:border-white transition-all duration-200"
              >
                <Calendar className="h-5 w-5" />
                Book Eye Test
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center lg:justify-start gap-8">
              {[
                { value: '10,000+', label: 'Happy Customers' },
                { value: '500+', label: 'Frame Styles' },
                { value: '15+', label: 'Years Trusted' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-blue-300 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Outer glow ring */}
              <div className="absolute inset-0 bg-sky-400/20 rounded-full blur-3xl scale-110" />
              {/* Main circle */}
              <div className="relative w-[480px] h-[480px] rounded-full border-2 border-white/20 overflow-hidden shadow-2xl">
                <Image
                  src="/images/heroimage.jpg"
                  alt="Eye To Eye Opticians — Premium Eyewear"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Subtle overlay to blend with hero gradient */}
                <div className="absolute inset-0 bg-blue-900/10 rounded-full" />
              </div>
              {/* Floating badges */}
              <div className="absolute top-6 -right-6 bg-white text-blue-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                Free Delivery
              </div>
              <div className="absolute bottom-6 -left-6 bg-sky-400 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                Virtual Try-On
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
