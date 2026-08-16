'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, List } from 'lucide-react'
import { useAdminAppointments } from '@/hooks/useAdminAppointments'
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable'
import FilterBar from '@/components/admin/FilterBar'
import Pagination from '@/components/admin/Pagination'
import StatusBadge from '@/components/admin/StatusBadge'
import LoadingSpinner from '@/components/admin/LoadingSpinner'
import EmptyState from '@/components/admin/EmptyState'
import { formatDate } from '@/lib/utils'
import type { AdminAppointment } from '@/types/admin'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour = Number(hourStr)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 === 0 ? 12 : hour % 12
  return `${displayHour}:${minuteStr} ${suffix}`
}

export default function AdminAppointmentsPage() {
  const router = useRouter()
  const [view, setView] = useState<'calendar' | 'list'>('calendar')

  // List view state
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')

  // Calendar view state
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const listQuery = useAdminAppointments({
    page,
    size: 20,
    status: statusFilter || undefined,
  })

  const monthStart = `${year}-${pad(month + 1)}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const monthEnd = `${year}-${pad(month + 1)}-${pad(lastDay)}`

  const calendarQuery = useAdminAppointments({
    date_from: monthStart,
    date_to: monthEnd,
    size: 200,
  })

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, AdminAppointment[]>()
    for (const appt of calendarQuery.data?.items ?? []) {
      const list = map.get(appt.appointment_date) ?? []
      list.push(appt)
      map.set(appt.appointment_date, list)
    }
    return map
  }, [calendarQuery.data])

  const firstWeekday = new Date(year, month, 1).getDay()
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: lastDay }, (_, i) => i + 1),
  ]

  const goToMonth = (delta: number) => {
    const date = new Date(year, month + delta, 1)
    setYear(date.getFullYear())
    setMonth(date.getMonth())
    setSelectedDay(null)
  }

  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

  const columns: DataTableColumn<AdminAppointment>[] = [
    { header: 'Date', accessor: (appt) => formatDate(appt.appointment_date) },
    { header: 'Time', accessor: (appt) => formatTime(appt.appointment_time) },
    {
      header: 'Customer',
      accessor: (appt) => (
        <div>
          <p className="font-medium text-[#1a1a2e]">{appt.user.full_name}</p>
          <p className="text-xs text-gray-400">{appt.user.email}</p>
        </div>
      ),
    },
    { header: 'Status', accessor: (appt) => <StatusBadge status={appt.status} /> },
    {
      header: 'Notes',
      accessor: (appt) => (
        <span className="text-gray-500">
          {appt.notes ? (appt.notes.length > 40 ? `${appt.notes.slice(0, 40)}...` : appt.notes) : '—'}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (appt) => (
        <Link
          href={`/admin/appointments/${appt.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-sm font-medium text-[#e94560] hover:underline"
        >
          View
        </Link>
      ),
    },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Appointments</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage eye test bookings</p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-lg shadow-sm p-1 border border-gray-100">
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'calendar' ? 'bg-[#1a1a2e] text-white' : 'text-gray-500'
            }`}
          >
            <CalendarIcon className="h-4 w-4" /> Calendar
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'list' ? 'bg-[#1a1a2e] text-white' : 'text-gray-500'
            }`}
          >
            <List className="h-4 w-4" /> List
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <>
          <div className="mb-5">
            <FilterBar
              filters={[
                {
                  label: 'Status',
                  value: statusFilter,
                  onChange: (value) => {
                    setStatusFilter(value)
                    setPage(1)
                  },
                  options: [
                    { label: 'All Status', value: '' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Confirmed', value: 'confirmed' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Cancelled', value: 'cancelled' },
                  ],
                },
              ]}
            />
          </div>

          <DataTable
            columns={columns}
            data={listQuery.data?.items ?? []}
            keyExtractor={(appt) => appt.id}
            onRowClick={(appt) => router.push(`/admin/appointments/${appt.id}`)}
            isLoading={listQuery.isLoading}
            emptyIcon={CalendarIcon}
            emptyTitle="No appointments found"
          />

          {listQuery.data && (
            <Pagination
              page={listQuery.data.page}
              pages={listQuery.data.pages}
              total={listQuery.data.total}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => goToMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-[#1a1a2e]" />
            </button>
            <h2 className="font-bold text-[#1a1a2e]">
              {new Date(year, month).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <button
              onClick={() => goToMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-[#1a1a2e]" />
            </button>
          </div>

          {calendarQuery.isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-400 py-1"
                  >
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((day, i) => {
                  if (day === null) return <div key={`pad-${i}`} />
                  const key = `${year}-${pad(month + 1)}-${pad(day)}`
                  const dayAppointments = appointmentsByDay.get(key) ?? []
                  const isToday = key === todayKey
                  const isSelected = key === selectedDay

                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setSelectedDay((prev) => (prev === key ? null : key))
                      }
                      className={`aspect-square rounded-lg p-2 text-left transition-colors border ${
                        isSelected
                          ? 'border-[#e94560] bg-red-50'
                          : isToday
                          ? 'border-blue-100 bg-blue-50'
                          : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-sm font-medium text-[#1a1a2e]">{day}</p>
                      {dayAppointments.length > 0 && (
                        <p className="text-[10px] font-semibold mt-1" style={{ color: '#e94560' }}>
                          {dayAppointments.length} appt{dayAppointments.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedDay && (
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <h3 className="font-semibold text-[#1a1a2e] mb-3">
                    {formatDate(selectedDay)}
                  </h3>
                  {(appointmentsByDay.get(selectedDay) ?? []).length === 0 ? (
                    <EmptyState title="No appointments on this day" />
                  ) : (
                    <div className="space-y-2">
                      {(appointmentsByDay.get(selectedDay) ?? [])
                        .slice()
                        .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                        .map((appt) => (
                          <div
                            key={appt.id}
                            className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-[#1a1a2e] w-20">
                                {formatTime(appt.appointment_time)}
                              </span>
                              <span className="text-sm text-gray-600">{appt.user.full_name}</span>
                              <StatusBadge status={appt.status} />
                            </div>
                            <Link
                              href={`/admin/appointments/${appt.id}`}
                              className="text-sm font-medium text-[#e94560] hover:underline"
                            >
                              View
                            </Link>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
