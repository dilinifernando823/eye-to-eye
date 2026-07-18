import Link from 'next/link'
import { Eye, Share2, MessageCircle, MapPin, Phone, Mail, Clock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 text-white rounded-lg p-1.5">
                <Eye className="h-5 w-5" />
              </div>
              <span className="font-bold text-white text-lg">Eye To Eye</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Sri Lanka&apos;s trusted optical retailer. Premium eyewear for every lifestyle — prescription spectacles, sunglasses, and contact lenses.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 hover:bg-pink-600 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Share2 className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-800 hover:bg-green-600 rounded-lg transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/spectacles', label: 'Spectacles' },
                { href: '/sunglasses', label: 'Sunglasses' },
                { href: '/contact-lenses', label: 'Contact Lenses' },
                { href: '/appointments', label: 'Book Eye Test' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              {[
                { href: '/account', label: 'My Account' },
                { href: '/account/orders', label: 'My Orders' },
                { href: '/appointments', label: 'Book Appointment' },
                { href: '/account/loyalty', label: 'Loyalty Points' },
                { href: '/account/wishlist', label: 'My Wishlist' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">
                  123 Galle Road, Colombo 03,<br />Sri Lanka
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="text-sm text-gray-400">info@eyetoeye.lk</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">
                  Mon–Fri: 9:00 AM – 6:00 PM<br />
                  Sat: 9:00 AM – 5:00 PM<br />
                  Sun: Closed
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Eye To Eye Opticians. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
