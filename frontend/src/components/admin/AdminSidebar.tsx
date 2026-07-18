'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Calendar,
  Users,
  LogOut,
  Eye,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/customers', label: 'Customers', icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { clearUser } = useAuthStore()

  const handleLogout = () => {
    clearUser()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-blue-950 flex flex-col flex-shrink-0 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-blue-900">
        <div className="bg-blue-600 rounded-lg p-1.5">
          <Eye className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">Eye To Eye</p>
          <p className="text-blue-400 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-300 hover:bg-blue-900 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 border-t border-blue-900 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-300 hover:bg-red-900/30 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
