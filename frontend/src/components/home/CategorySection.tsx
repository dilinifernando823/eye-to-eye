import Link from 'next/link'
import { Glasses, Sun, Eye, ArrowRight } from 'lucide-react'

const categories = [
  {
    href: '/spectacles',
    icon: Glasses,
    label: 'Spectacles',
    description: 'Prescription frames in every style',
    bg: 'from-blue-600 to-blue-800',
    lightBg: 'bg-blue-50',
    iconBg: 'bg-blue-700',
    count: '200+ styles',
  },
  {
    href: '/sunglasses',
    icon: Sun,
    label: 'Sunglasses',
    description: 'UV protection, polarized lenses',
    bg: 'from-amber-500 to-orange-600',
    lightBg: 'bg-amber-50',
    iconBg: 'bg-amber-600',
    count: '150+ styles',
  },
  {
    href: '/contact-lenses',
    icon: Eye,
    label: 'Contact Lenses',
    description: 'Daily, monthly and yearly options',
    bg: 'from-teal-500 to-cyan-600',
    lightBg: 'bg-teal-50',
    iconBg: 'bg-teal-600',
    count: '50+ options',
  },
]

export default function CategorySection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
          <p className="text-gray-500 mt-2">Find exactly what you need</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(({ href, icon: Icon, label, description, bg, lightBg, iconBg, count }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className={`${lightBg} rounded-xl p-4 inline-flex mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className={`${iconBg} rounded-lg p-2.5`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{label}</h3>
              <p className="text-gray-500 text-sm mb-1">{description}</p>
              <p className="text-xs text-gray-400 mb-4">{count}</p>
              <div className="flex items-center text-blue-700 font-semibold text-sm group-hover:gap-2 gap-1 transition-all duration-200">
                Shop Now <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
