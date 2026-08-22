'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  Search,
  Heart,
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
  Package,
  Glasses,
  LogOut,
  X,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import MobileMenu from './MobileMenu'
import CartDrawer from '@/components/cart/CartDrawer'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { totalItems, openCart } = useCartStore()
  const { isAuthenticated, user, clearUser } = useAuthStore()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/spectacles?search=${encodeURIComponent(searchQuery.trim())}`)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  const cartCount = totalItems()

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-blue-700 text-white rounded-lg p-1.5">
                <Eye className="h-5 w-5" />
              </div>
              <span className="font-bold text-blue-700 text-lg hidden sm:block">Eye To Eye</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {[
                { href: '/', label: 'Home' },
                { href: '/spectacles', label: 'Spectacles' },
                { href: '/sunglasses', label: 'Sunglasses' },
                { href: '/contact-lenses', label: 'Contact Lenses' },
                { href: '/appointments', label: 'Book Eye Test' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2 rounded-lg text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              <Link
                href="/account/wishlist"
                className="hidden sm:flex p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </Link>

              <button
                onClick={openCart}
                className="p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors relative"
                aria-label={`Cart (${cartCount} items)`}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              <div className="hidden lg:block relative" ref={userMenuRef}>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      <div className="bg-blue-100 text-blue-700 rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold">
                        {user?.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          My Account
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <Package className="h-4 w-4" />
                          My Orders
                        </Link>
                        <Link
                          href="/account/prescriptions"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <Glasses className="h-4 w-4" />
                          My Prescriptions
                        </Link>
                        <button
                          onClick={() => { clearUser(); setIsUserMenuOpen(false) }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white transition-all text-sm font-medium"
                  >
                    <User className="h-4 w-4" />
                    Login
                  </Link>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="border-t border-gray-200 bg-white py-3 px-4">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for spectacles, sunglasses, contact lenses..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors"
                aria-label="Close search"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </form>
          </div>
        )}
      </header>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <CartDrawer />
    </>
  )
}
