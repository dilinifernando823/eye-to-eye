'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { CheckCircle, ChevronLeft, XCircle } from 'lucide-react'
import { useAdminAppointment, useUpdateAppointment } from '@/hooks/useAdminAppointments'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import StatusBadge from '@/components/admin/StatusBadge'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { formatDate } from '@/lib/utils'

function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour = Number(hourStr)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${minuteStr} ${suffix}`
}

export default function AppointmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const appointmentId = Number(id)

  const { data: appointment, isLoading } = useAdminAppointment(appointmentId)
  const updateAppointment = useUpdateAppointment(appointmentId)

  const [notesDraft, setNotesDraft] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    status: string
    label: string
  } | null>(null)

  if (isLoading || !appointment) {
    return (
      <div className="p-6 lg:p-8">
        <LoadingSpinner />
      </div>
    )
  }

  const notesValue = notesDraft ?? appointment.notes ?? ''

  const handleStatusChange = async (nextStatus: string, notes?: string) => {
    try {
      await updateAppointment.mutateAsync({ status: nextStatus, ...(notes ? { notes } : {}) })
      toast.success('Appointment updated')
      setShowCancelForm(false)
      setCancelReason('')
    } catch {
      toast.error('Failed to update appointment')
    } finally {
      setPendingAction(null)
    }
  }

  const handleSaveNotes = async () => {
    try {
      await updateAppointment.mutateAsync({ notes: notesValue })
      toast.success('Notes saved')
    } catch {
      toast.error('Failed to save notes')
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <Link
        href="/admin/appointments"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#e94560] mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Appointments
      </Link>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-400 mb-1">Appointment #{appointment.id}</p>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-[#1a1a2e]">
              {formatDate(appointment.appointment_date)}
            </h1>
            <StatusBadge status={appointment.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-0.5">Time</p>
              <p className="font-medium text-[#1a1a2e]">
                {formatTime(appointment.appointment_time)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-[#1a1a2e] mb-3">Customer</h2>
          <Link
            href={`/admin/customers/${appointment.user_id}`}
            className="font-medium text-[#e94560] hover:underline"
          >
            {appointment.user.full_name}
          </Link>
          <p className="text-sm text-gray-500 mt-1">{appointment.user.email}</p>
          {appointment.user.phone && (
            <p className="text-sm text-gray-500">{appointment.user.phone}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-[#1a1a2e] mb-3">Actions</h2>

          {appointment.status === 'pending' && !showCancelForm && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPendingAction({ status: 'confirmed', label: 'Confirm this appointment?' })}
                className="flex items-center gap-2 bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <CheckCircle className="h-4 w-4" /> Confirm Appointment
              </button>
              <button
                onClick={() => setShowCancelForm(true)}
                className="flex items-center gap-2 border border-red-500 text-red-500 hover:bg-red-50 font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <XCircle className="h-4 w-4" /> Cancel Appointment
              </button>
            </div>
          )}

          {appointment.status === 'confirmed' && !showCancelForm && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPendingAction({ status: 'completed', label: 'Mark this appointment as completed?' })}
                className="flex items-center gap-2 bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <CheckCircle className="h-4 w-4" /> Mark as Completed
              </button>
              <button
                onClick={() => setShowCancelForm(true)}
                className="flex items-center gap-2 border border-red-500 text-red-500 hover:bg-red-50 font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <XCircle className="h-4 w-4" /> Cancel Appointment
              </button>
            </div>
          )}

          {showCancelForm && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm resize-none"
                placeholder="Let the customer know why this was cancelled..."
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelForm(false)}
                  className="border border-[#1a1a2e] text-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled', cancelReason)}
                  disabled={updateAppointment.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          )}

          {appointment.status === 'completed' && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
              Appointment Completed — no further actions.
            </p>
          )}
          {appointment.status === 'cancelled' && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
              Appointment Cancelled — no further actions.
            </p>
          )}
        </div>

        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="font-bold text-[#1a1a2e] mb-3">Notes</h2>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesDraft(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#e94560] text-sm resize-none mb-3"
              placeholder="No notes added"
            />
            <button
              onClick={handleSaveNotes}
              disabled={updateAppointment.isPending}
              className="bg-[#e94560] hover:bg-[#c73652] text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm disabled:opacity-60"
            >
              Save Notes
            </button>
          </div>
        )}

        {(appointment.status === 'completed' || appointment.status === 'cancelled') &&
          appointment.notes && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="font-bold text-[#1a1a2e] mb-2">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{appointment.notes}</p>
            </div>
          )}
      </div>

      <ConfirmModal
        open={pendingAction !== null}
        title="Update appointment?"
        message={pendingAction?.label ?? ''}
        confirmLabel="Confirm"
        danger={false}
        loading={updateAppointment.isPending}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => pendingAction && handleStatusChange(pendingAction.status)}
      />
    </div>
  )
}
