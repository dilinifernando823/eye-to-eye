'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Clock, CheckCircle } from 'lucide-react'
import { appointmentSchema, type AppointmentFormData } from '@/lib/validations'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import Input from '@/components/ui/Input'
import api from '@/lib/api'
import { getErrorMessage } from '@/lib/errors'
import type { TimeSlot } from '@/types'

function formatTimeLabel(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour = Number(hourStr)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${minuteStr} ${suffix}`
}

export default function AppointmentsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [selectedTime, setSelectedTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmed, setConfirmed] = useState<{ date: string; time: string } | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/appointments')
    }
  }, [isAuthenticated, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { notes: '' },
  })

  const selectedDate = watch('appointment_date')

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['appointment-slots', selectedDate],
    queryFn: async () => {
      const { data } = await api.get<TimeSlot[]>('/api/appointments/slots', {
        params: { date: selectedDate },
      })
      return data
    },
    enabled: !!selectedDate,
  })

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    setValue('appointment_time', time, { shouldValidate: true })
  }

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await api.post('/api/appointments/', data)
      setConfirmed({ date: data.appointment_date, time: data.appointment_time })
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err, 'Failed to book appointment. Please try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full p-5 inline-flex mb-5">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-500 mb-5">We&apos;ve booked your eye test. See you soon!</p>
          <div className="bg-blue-50 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">{formatDate(confirmed.date)}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">{formatTimeLabel(confirmed.time)}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            We&apos;ll send a reminder to your email 24 hours before your appointment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 rounded-xl p-2">
              <Calendar className="h-6 w-6 text-blue-700" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Book an Eye Test</h1>
          </div>
          <p className="text-gray-500">
            Schedule a comprehensive eye examination with our qualified optometrists.
            Appointments available Monday–Saturday.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* What to expect */}
        <div className="bg-blue-50 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">What to Expect</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Comprehensive vision assessment (30–45 minutes)</li>
            <li>✓ Eye health screening</li>
            <li>✓ Updated prescription if needed</li>
            <li>✓ Expert frame-fitting advice</li>
          </ul>
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Date */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-700" />
              Select Date
            </h3>
            <Input
              type="date"
              min={today}
              {...register('appointment_date')}
              onChange={(e) => {
                register('appointment_date').onChange(e)
                setSelectedTime('')
                setValue('appointment_time', '')
              }}
              error={errors.appointment_date?.message}
            />
          </div>

          {/* Time slots */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-700" />
              Select Time Slot
            </h3>
            {errors.appointment_time && (
              <p className="text-sm text-red-600 mb-3">{errors.appointment_time.message}</p>
            )}
            {!selectedDate && (
              <p className="text-sm text-gray-400 mb-3">Please select a date first</p>
            )}
            {selectedDate && slotsLoading && (
              <p className="text-sm text-gray-400 mb-3">Loading available slots...</p>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(slots ?? []).map(({ time, available }) => (
                <button
                  key={time}
                  type="button"
                  disabled={!available}
                  onClick={() => handleTimeSelect(time)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                    selectedTime === time
                      ? 'bg-blue-700 border-blue-700 text-white'
                      : !available
                      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {formatTimeLabel(time)}
                  {!available && (
                    <span className="block text-xs opacity-60">Booked</span>
                  )}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('appointment_time')} />
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Additional Notes (Optional)</h3>
            <textarea
              {...register('notes')}
              placeholder="Any specific concerns or conditions you'd like us to know about..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-70 text-white font-semibold py-4 rounded-xl transition-colors text-base shadow-md hover:shadow-lg"
          >
            {isSubmitting ? 'Booking...' : (
              <><Calendar className="h-5 w-5" /> Book Appointment</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
