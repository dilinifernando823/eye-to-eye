'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  User,
  Package,
  Heart,
  Gift,
  Calendar,
  LogOut,
  Save,
  ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { profileSchema, type ProfileFormData } from '@/lib/validations'
import Input from '@/components/ui/Input'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'

const navItems = [
  { href: '/account', label: 'My Profile', icon: User },
  { href: '/account/orders', label: 'My Orders', icon: Package },
  { href: '/account/wishlist', label: 'My Wishlist', icon: Heart },
  { href: '/account/loyalty', label: 'Loyalty Points', icon: Gift },
  { href: '/account/appointments', label: 'My Appointments', icon: Calendar },
  { href: '/appointments', label: 'Book Appointment', icon: Calendar },
]

export default function AccountPage() {
  const { user, clearUser, setUser } = useAuthStore()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? '',
      phone: user?.phone ?? '',
      delivery_address: user?.delivery_address ?? '',
      city: user?.city ?? '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    setSaveError('')
    try {
      const { data: updated } = await api.put('/api/auth/me', data)
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, 'Failed to save changes. Please try again.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    clearUser()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.full_name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Profile card */}
              <div className="bg-gradient-to-br from-blue-700 to-blue-800 p-5 text-white">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
                  {user?.full_name?.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold">{user?.full_name}</p>
                <p className="text-blue-200 text-sm">{user?.email}</p>
              </div>

              <nav className="p-2">
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      {label}
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">My Profile</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    {...register('full_name')}
                    error={errors.full_name?.message}
                  />
                  <Input
                    label="Phone Number"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                </div>
                <Input
                  label="Delivery Address"
                  {...register('delivery_address')}
                  error={errors.delivery_address?.message}
                />
                <Input
                  label="City"
                  {...register('city')}
                  error={errors.city?.message}
                />

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-70 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saved && (
                    <p className="text-green-600 text-sm font-medium">Changes saved!</p>
                  )}
                  {saveError && (
                    <p className="text-red-600 text-sm font-medium">{saveError}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
              {[
                { href: '/account/orders', icon: Package, label: 'View Orders', color: 'text-blue-700 bg-blue-50' },
                { href: '/account/wishlist', icon: Heart, label: 'My Wishlist', color: 'text-pink-700 bg-pink-50' },
                { href: '/account/loyalty', icon: Gift, label: 'Loyalty Points', color: 'text-purple-700 bg-purple-50' },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3 hover:shadow-md transition-all group"
                >
                  <div className={`${color} rounded-xl p-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{label}</span>
                  <ChevronRight className="h-4 w-4 text-gray-400 ml-auto group-hover:text-blue-700 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
