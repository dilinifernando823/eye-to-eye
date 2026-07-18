import { Star } from 'lucide-react'
import { mockTestimonials } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'

export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          <p className="text-gray-500 mt-2">Real reviews from real people</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockTestimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < t.star_rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>
              <p className="text-gray-700 leading-relaxed mb-4 text-sm">&ldquo;{t.review_text}&rdquo;</p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">
                      {t.customer_name.charAt(0)}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{t.customer_name}</p>
                </div>
                <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
