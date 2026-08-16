'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, Menu, Search, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'

function titleFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)
  const last = segments[segments.length - 1] ?? 'dashboard'
  if (last === 'admin') return 'Dashboard'
  if (!Number.isNaN(Number(last))) {
    return segments[segments.length - 2]?.replace(/-/g, ' ') ?? 'Detail'
  }
  return last.replace(/-/g, ' ')
}

interface AdminTopBarProps {
  onMenuClick: () => void
}

export default function AdminTopBar({ onMenuClick }: AdminTopBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearUser } = useAuthStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const segments = pathname.split('/').filter(Boolean)
  const title = titleFromPathname(pathname)

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout')
    } catch {
      // Ignore network errors — clearing local state still logs the user out client-side.
    }
    clearUser()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-[#1a1a2e]" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-[#1a1a2e] capitalize truncate">{title}</h1>
            <nav className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
              <Link href="/admin/dashboard" className="hover:text-[#e94560]">
                Admin
              </Link>
              {segments.slice(1).map((segment, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span>/</span>
                  <span className="capitalize">{segment.replace(/-/g, ' ')}</span>
                </span>
              ))}
            </nav>
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e94560]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-500" />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                {user?.full_name?.charAt(0).toUpperCase() ?? <UserIcon className="h-4 w-4" />}
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-[#1a1a2e] truncate">
                      {user?.full_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
