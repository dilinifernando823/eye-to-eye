'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'
import { useCreateAdminAccount } from '@/hooks/useAdminAccounts'

const schema = z
  .object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type FormValues = z.infer<typeof schema>

function passwordStrength(password: string): { label: string; color: string; width: string } {
  if (password.length < 8) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' }

  const hasLetters = /[a-zA-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)

  if (hasLetters && hasNumbers && hasSymbols) {
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
  }
  if ((hasLetters && hasNumbers) || hasSymbols) {
    return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/3' }
  }
  return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' }
}

export default function NewAdminPage() {
  const router = useRouter()
  const createAdmin = useCreateAdminAccount()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const password = watch('password') ?? ''
  const strength = password ? passwordStrength(password) : null

  const onSubmit = async (values: FormValues) => {
    try {
      await createAdmin.mutateAsync({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
      })
      toast.success('Admin account created')
      router.push('/admin/admins')
    } catch {
      toast.error('Failed to create admin account')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Add Admin Account</h1>
        <p className="text-gray-500 text-sm mt-0.5">Grant another user admin access</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name*</label>
          <input
            {...register('full_name')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
          {errors.full_name && (
            <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email*</label>
          <input
            type="email"
            {...register('email')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password*</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {strength && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${strength.color} ${strength.width} transition-all`} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{strength.label}</p>
            </div>
          )}
          {errors.password && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Confirm Password*
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            {...register('confirm_password')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm"
          />
          {errors.confirm_password && (
            <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/admin/admins')}
            className="border border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
          >
            {isSubmitting ? 'Creating...' : 'Create Admin Account'}
          </button>
        </div>
      </form>
    </div>
  )
}
