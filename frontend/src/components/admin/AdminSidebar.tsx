'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingCart,
  Calendar,
  Users,
  Shield,
  Settings,
  LogOut,
  Eye,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [{ href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    title: 'Catalogue',
    items: [
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/products/new', label: 'Add Product', icon: PlusCircle },
    ],
  },
  {
    title: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
    ],
  },
  {
    title: 'People',
    items: [
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/admins', label: 'Admin Accounts', icon: Shield },
    ],
  },
  {
    title: 'System',
    items: [{ href: '/admin/settings', label: 'Settings', icon: Settings }],
  },
]

interface AdminSidebarProps {
  mobileOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearUser } = useAuthStore()

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // Ignore network errors — clearing local state still logs the user out client-side.
    }
    clearUser()
    router.push('/login')
  }

  const isActive = (href: string) =>
    href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 z-50 lg:z-auto h-screen w-[260px] flex flex-col flex-shrink-0 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: '#1a1a2e' }}
      >
        <div className="flex items-center justify-between gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg p-1.5" style={{ backgroundColor: '#e94560' }}>
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Eye To Eye</p>
              <p className="text-xs" style={{ color: '#a8dadc' }}>
                Admin Panel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-white/70 hover:bg-white/10"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href)
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                      style={
                        active
                          ? { backgroundColor: '#e94560', color: '#ffffff' }
                          : { color: '#cbd5e1' }
                      }
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-white/10 pt-4">
          <div className="px-3 mb-3">
            <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
            <p className="text-xs text-white/50 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
