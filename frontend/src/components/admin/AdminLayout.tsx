'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import AdminSidebar from './AdminSidebar'
import AdminTopBar from './AdminTopBar'
import ToastProvider from './ToastProvider'
import LoadingSpinner from './LoadingSpinner'

function useAuthHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    return unsubscribe
  }, [])

  return hydrated
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthStore()
  const hydrated = useAuthHydrated()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = isAuthenticated && user?.role === 'admin'

  useEffect(() => {
    if (hydrated && !isAdmin) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [hydrated, isAdmin, pathname, router])

  if (!hydrated || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <ToastProvider />
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
