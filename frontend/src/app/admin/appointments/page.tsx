'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { Appointment } from '@/types'

const mockAppointments: Appointment[] = [
  { id: 1, user_id: 1, appointment_date: '2024-03-22', appointment_time: '9:00 AM', status: 'pending', notes: 'First visit, long-distance issue', created_at: '2024-03-18T10:00:00Z' },
  { id: 2, user_id: 2, appointment_date: '2024-03-22', appointment_time: '10:00 AM', status: 'confirmed', notes: '', created_at: '2024-03-17T10:00:00Z' },
  { id: 3, user_id: 3, appointment_date: '2024-03-23', appointment_time: '2:00 PM', status: 'completed', notes: 'Follow-up for new prescription', created_at: '2024-03-15T10:00:00Z' },
  { id: 4, user_id: 4, appointment_date: '2024-03-24', appointment_time: '11:00 AM', status: 'cancelled', notes: '', created_at: '2024-03-14T10:00:00Z' },
]

const customerNames: Record<number, string> = {
  1: 'Chamara Perera',
  2: 'Nisha Fernando',
  3: 'Ravi Wickramasinghe',
  4: 'Amali Silva',
}

const STATUS_BADGE: Record<Appointment['status'], 'warning' | 'info' | 'success' | 'error'> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
}

const FILTER_TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const

export default function AdminAppointmentsPage() {
  const [activeTab, setActiveTab] = useState<string>('All')
  const [statuses, setStatuses] = useState<Record<number, Appointment['status']>>(
    Object.fromEntries(mockAppointments.map((a) => [a.id, a.status]))
  )

  const filtered = mockAppointments.filter((a) =>
    activeTab === 'All' ? true : statuses[a.id] === activeTab.toLowerCase()
  )

  const confirm = (id: number) =>
    setStatuses((prev) => ({ ...prev, [id]: 'confirmed' }))

  const cancel = (id: number) =>
    setStatuses((prev) => ({ ...prev, [id]: 'cancelled' }))

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 text-sm mt-0.5">{mockAppointments.length} total appointments</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-blue-700 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Customer', 'Date', 'Time', 'Status', 'Notes', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt) => (
                <tr key={appt.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-900">{customerNames[appt.user_id]}</td>
                  <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(appt.appointment_date)}</td>
                  <td className="px-4 py-3.5 text-gray-600">{appt.appointment_time}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={STATUS_BADGE[statuses[appt.id]]} className="capitalize">
                      {statuses[appt.id]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 max-w-[200px]">
                    <p className="line-clamp-1">{appt.notes || '—'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      {statuses[appt.id] === 'pending' && (
                        <button
                          onClick={() => confirm(appt.id)}
                          className="flex items-center gap-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Confirm
                        </button>
                      )}
                      {(statuses[appt.id] === 'pending' || statuses[appt.id] === 'confirmed') && (
                        <button
                          onClick={() => cancel(appt.id)}
                          className="flex items-center gap-1 text-xs bg-red-100 hover:bg-red-200 text-red-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
