'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { Calendar, Clock, ArrowLeft, PlusCircle, FileText } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useMyAppointments, useCancelAppointment } from '@/hooks/useAppointments'
import { formatDate, getAppointmentStatusColor, canCancelAppointment } from '@/lib/utils'
import { getErrorMessage } from '@/lib/errors'
import type { Appointment } from '@/types'

type FilterTab = 'all' | 'upcoming' | 'past' | 'cancelled'

function formatTimeLabel(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour = Number(hourStr)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${minuteStr} ${suffix}`
}

function matchesTab(appointment: Appointment, tab: FilterTab): boolean {
  const isUpcoming =
    (appointment.status === 'pending' || appointment.status === 'confirmed') &&
    new Date(`${appointment.appointment_date}T${appointment.appointment_time}`) >= new Date()

  switch (tab) {
    case 'upcoming':
      return isUpcoming
    case 'past':
      return appointment.status === 'completed' || (!isUpcoming && appointment.status !== 'cancelled')
    case 'cancelled':
      return appointment.status === 'cancelled'
    default:
      return true
  }
}

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
]

export default function MyAppointmentsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [tab, setTab] = useState<FilterTab>('upcoming')
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const { data: appointments, isLoading } = useMyAppointments()
  const cancelAppointment = useCancelAppointment()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/account/appointments')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const items = (appointments ?? []).filter((a) => matchesTab(a, tab))

  const handleCancel = async (id: number) => {
    setCancellingId(id)
    try {
      await cancelAppointment.mutateAsync(id)
      toast.success('Appointment cancelled')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Could not cancel appointment'))
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/account" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-700 mb-3 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Account
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
            <Link
              href="/appointments"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <PlusCircle className="h-4 w-4" /> Book Appointment
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-blue-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 h-24 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-blue-50 rounded-full p-6 inline-flex mb-4">
              <Calendar className="h-12 w-12 text-blue-300" />
            </div>
            <p className="text-xl font-semibold text-gray-900">
              {tab === 'all' ? 'No appointments yet' : `No ${tab} appointments`}
            </p>
            <p className="text-gray-500 mt-1 mb-5">Book an eye test to see it appear here</p>
            <Link href="/appointments" className="inline-flex items-center gap-2 bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-800 transition-colors">
              Book an Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((appointment) => {
              const cancellable = canCancelAppointment(
                appointment.appointment_date,
                appointment.appointment_time,
                appointment.status
              )
              return (
                <div key={appointment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 rounded-xl p-3">
                        <Calendar className="h-5 w-5 text-blue-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{formatDate(appointment.appointment_date)}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {formatTimeLabel(appointment.appointment_time)}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium capitalize self-start sm:self-center ${getAppointmentStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>

                  {appointment.notes && (
                    <p className="mt-3 text-sm text-gray-500 flex items-start gap-1.5">
                      <FileText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      {appointment.notes}
                    </p>
                  )}

                  {cancellable && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        disabled={cancellingId === appointment.id}
                        className="text-sm font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
                      >
                        {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel Appointment'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
