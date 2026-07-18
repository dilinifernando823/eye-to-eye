import { Truck, RotateCcw, UserCheck, ShieldCheck } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free island-wide delivery on all orders over LKR 5,000.',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: '30-day hassle-free returns on all frames and accessories.',
    color: 'text-green-700',
    bg: 'bg-green-50',
  },
  {
    icon: UserCheck,
    title: 'Expert Advice',
    description: 'Qualified optometrists on hand to guide your selection.',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Pay in-store securely. Online checkout stores your details safely.',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Why Choose Eye To Eye?</h2>
          <p className="text-gray-500 mt-2">We put your vision first</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className={`${bg} rounded-2xl p-4 inline-flex mb-4`}>
                <Icon className={`h-7 w-7 ${color}`} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
