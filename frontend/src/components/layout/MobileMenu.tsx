'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { X, Home, Glasses, Sun, Eye, Calendar, User, ShoppingBag, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/spectacles', label: 'Spectacles', icon: Glasses },
  { href: '/sunglasses', label: 'Sunglasses', icon: Sun },
  { href: '/contact-lenses', label: 'Contact Lenses', icon: Eye },
  { href: '/appointments', label: 'Book Eye Test', icon: Calendar },
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { isAuthenticated, user, clearUser } = useAuthStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white w-80 h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/" onClick={onClose} className="flex items-center gap-2">
            <div className="bg-blue-700 text-white rounded-lg p-1.5">
              <Eye className="h-5 w-5" />
            </div>
            <span className="font-bold text-blue-700 text-lg">Eye To Eye</span>
          </Link>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-1">
            {isAuthenticated ? (
              <>
                <p className="px-4 py-2 text-sm text-gray-500">
                  Hello, {user?.full_name?.split(' ')[0]}
                </p>
                <Link
                  href="/account"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                >
                  <User className="h-5 w-5" />
                  My Account
                </Link>
                <Link
                  href="/account/orders"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                >
                  <ShoppingBag className="h-5 w-5" />
                  My Orders
                </Link>
                <Link
                  href="/account/prescriptions"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                >
                  <Glasses className="h-5 w-5" />
                  My Prescriptions
                </Link>
                <button
                  onClick={() => { clearUser(); onClose() }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                >
                  <User className="h-5 w-5" />
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-700 text-white hover:bg-blue-800 transition-colors font-medium"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  )
}
