'use client'

import { useState, useMemo } from 'react'
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  parseISO,
  isToday,
  setHours,
  setMinutes,
  differenceInMinutes,
} from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, List, RefreshCw, Plus, Pencil, Trash2, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CalendarBooking {
  id: number
  patientName: string
  patientPhone: string
  patientEmail: string | null
  treatment: string | null
  notes: string | null
  slotStart: string
  slotEnd: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  coreBookingId: string | null
  syncedFromCore: boolean
}

interface BookingCalendarProps {
  bookings: CalendarBooking[]
  onRefresh?: () => void
  refreshing?: boolean
  showSyncBadge?: boolean
  onNewBooking?: () => void
  onSlotClick?: (date: Date) => void
  onEditBooking?: (booking: CalendarBooking) => void
  onDeleteBooking?: (booking: CalendarBooking) => void
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-blue-100 border-blue-300 text-blue-800',
  pending: 'bg-amber-100 border-amber-300 text-amber-800',
  completed: 'bg-emerald-100 border-emerald-300 text-emerald-800',
  cancelled: 'bg-gray-100 border-gray-300 text-gray-500 line-through',
  no_show: 'bg-red-100 border-red-300 text-red-700',
}

type ViewMode = 'month' | 'week' | 'list'

export function BookingCalendar({ bookings, onRefresh, refreshing, showSyncBadge, onNewBooking, onSlotClick, onEditBooking, onDeleteBooking }: BookingCalendarProps) {
  const [view, setView] = useState<ViewMode>('week')
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState<CalendarBooking | null>(null)

  // --- Week view ---
  const weekStart = startOfWeek(cursor, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(cursor, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // --- Month view ---
  const monthStart = startOfMonth(cursor)
  const monthEnd = endOfMonth(cursor)
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd })

  function bookingsForDay(day: Date) {
    return bookings.filter((b) => isSameDay(parseISO(b.slotStart), day))
  }

  function navigate(dir: 1 | -1) {
    if (view === 'week' || view === 'list') {
      setCursor(dir === 1 ? addWeeks(cursor, 1) : subWeeks(cursor, 1))
    } else {
      setCursor(dir === 1 ? addMonths(cursor, 1) : subMonths(cursor, 1))
    }
  }

  const title =
    view === 'month'
      ? format(cursor, 'MMMM yyyy')
      : `${format(weekStart, 'd MMM')} – ${format(weekEnd, 'd MMM yyyy')}`

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[180px] text-center text-sm font-semibold text-gray-800">{title}</span>
          <button
            onClick={() => navigate(1)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCursor(new Date())}
            className="ml-1 text-xs text-gray-500 h-7 px-2"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {onNewBooking && (
            <Button
              size="sm"
              onClick={onNewBooking}
              className="h-7 bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold px-3"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              New Appointment
            </Button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-40"
              aria-label="Sync from Core"
              title="Sync from Consentz Core"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </button>
          )}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {(['week', 'month', 'list'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 transition-colors capitalize',
                  view === v ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50',
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div>
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthDays.map((day, i) => {
              const dayBookings = bookingsForDay(day)
              const inMonth = isSameMonth(day, cursor)
              return (
                <div
                  key={i}
                  className={cn(
                    'min-h-[80px] border-b border-r border-gray-100 p-1',
                    !inMonth && 'bg-gray-50',
                    isToday(day) && 'bg-blue-50/60',
                  )}
                >
                  <p className={cn(
                    'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isToday(day) ? 'bg-blue-600 text-white' : inMonth ? 'text-gray-700' : 'text-gray-300',
                  )}>
                    {format(day, 'd')}
                  </p>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 2).map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelected(b)}
                        className={cn(
                          'w-full truncate rounded border px-1 py-0.5 text-left text-[10px] font-medium transition-opacity hover:opacity-80',
                          STATUS_STYLES[b.status],
                        )}
                      >
                        {format(parseISO(b.slotStart), 'HH:mm')} {b.patientName}
                      </button>
                    ))}
                    {dayBookings.length > 2 && (
                      <p className="pl-1 text-[10px] text-gray-400">+{dayBookings.length - 2} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <WeekView days={weekDays} bookings={bookings} onSelect={setSelected} onSlotClick={onSlotClick} />
      )}

      {/* List view */}
      {view === 'list' && (
        <ListViewWeek days={weekDays} bookings={bookings} onSelect={setSelected} />
      )}

      {/* Booking detail panel */}
      {selected && (
        <BookingDetail
          booking={selected}
          showSyncBadge={showSyncBadge}
          onClose={() => setSelected(null)}
          onEdit={onEditBooking ? () => { onEditBooking(selected); setSelected(null) } : undefined}
          onDelete={onDeleteBooking ? () => { onDeleteBooking(selected); setSelected(null) } : undefined}
        />
      )}
    </div>
  )
}

// ── Week grid (hourly rows 07:00–21:00) ────────────────────────────────────
const HOUR_START = 7
const HOUR_END = 21
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const GRID_HEIGHT = 48 // px per hour

function WeekView({
  days,
  bookings,
  onSelect,
  onSlotClick,
}: {
  days: Date[]
  bookings: CalendarBooking[]
  onSelect: (b: CalendarBooking) => void
  onSlotClick?: (date: Date) => void
}) {
  return (
    <div className="overflow-auto max-h-[640px]">
      <div className="flex">
        {/* Time gutter */}
        <div className="w-12 shrink-0 border-r border-gray-100">
          <div className="h-8 border-b border-gray-100" /> {/* header spacer */}
          {HOURS.map((h) => (
            <div key={h} className="flex items-start justify-end pr-2" style={{ height: GRID_HEIGHT }}>
              <span className="text-[10px] text-gray-400 -translate-y-2">{String(h).padStart(2, '0')}:00</span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dayBookings = bookings.filter((b) => isSameDay(parseISO(b.slotStart), day))
          return (
            <div key={day.toISOString()} className="flex-1 min-w-0 border-r border-gray-100 last:border-r-0">
              {/* Day header */}
              <div className={cn(
                'h-8 flex flex-col items-center justify-center border-b border-gray-100 text-xs',
                isToday(day) && 'bg-blue-50',
              )}>
                <span className="text-gray-400">{format(day, 'EEE')}</span>
                <span className={cn(
                  'font-semibold',
                  isToday(day) ? 'text-blue-600' : 'text-gray-700',
                )}>{format(day, 'd')}</span>
              </div>

              {/* Hour cells */}
              <div className="relative">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className={cn('border-b border-gray-50', onSlotClick && 'cursor-pointer hover:bg-blue-50/40 transition-colors')}
                    style={{ height: GRID_HEIGHT }}
                    onClick={() => onSlotClick?.(setMinutes(setHours(day, h), 0))}
                  />
                ))}

                {/* Bookings positioned absolutely */}
                {dayBookings.map((b) => {
                  const start = parseISO(b.slotStart)
                  const end = parseISO(b.slotEnd)
                  const topMinutes = (start.getHours() - HOUR_START) * 60 + start.getMinutes()
                  const durationMinutes = Math.max(differenceInMinutes(end, start), 15)
                  const top = (topMinutes / 60) * GRID_HEIGHT
                  const height = Math.max((durationMinutes / 60) * GRID_HEIGHT, 20)

                  return (
                    <button
                      key={b.id}
                      onClick={() => onSelect(b)}
                      style={{ top, height, left: 2, right: 2 }}
                      className={cn(
                        'absolute overflow-hidden rounded border px-1 py-0.5 text-left text-[10px] font-medium transition-opacity hover:opacity-80',
                        STATUS_STYLES[b.status],
                      )}
                    >
                      <span className="block truncate">{format(start, 'HH:mm')} {b.patientName}</span>
                      {b.treatment && <span className="block truncate opacity-70">{b.treatment}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── List view ────────────────────────────────────────────────────────────────
function ListViewWeek({
  days,
  bookings,
  onSelect,
}: {
  days: Date[]
  bookings: CalendarBooking[]
  onSelect: (b: CalendarBooking) => void
}) {
  const grouped = days.map((day) => ({
    day,
    bookings: bookings
      .filter((b) => isSameDay(parseISO(b.slotStart), day))
      .sort((a, b) => parseISO(a.slotStart).getTime() - parseISO(b.slotStart).getTime()),
  })).filter((g) => g.bookings.length > 0)

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <CalendarDays className="h-8 w-8 text-gray-200" />
        <p className="text-sm text-gray-400">No bookings this week</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {grouped.map(({ day, bookings: dayBookings }) => (
        <div key={day.toISOString()}>
          <div className={cn(
            'px-4 py-2 text-xs font-semibold text-gray-500',
            isToday(day) && 'bg-blue-50 text-blue-700',
          )}>
            {isToday(day) ? 'Today — ' : ''}{format(day, 'EEEE, d MMMM')}
          </div>
          {dayBookings.map((b) => (
            <button
              key={b.id}
              onClick={() => onSelect(b)}
              className="w-full flex items-center gap-4 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-16 shrink-0 text-sm font-medium text-gray-700">
                {format(parseISO(b.slotStart), 'HH:mm')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{b.patientName}</p>
                {b.treatment && <p className="text-xs text-gray-400 truncate">{b.treatment}</p>}
              </div>
              <span className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
                STATUS_STYLES[b.status],
              )}>
                {b.status.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Booking detail modal ──────────────────────────────────────────────────────
function BookingDetail({
  booking,
  onClose,
  showSyncBadge,
  onEdit,
  onDelete,
}: {
  booking: CalendarBooking
  onClose: () => void
  showSyncBadge?: boolean
  onEdit?: () => void
  onDelete?: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{booking.patientName}</h3>
            {booking.treatment && <p className="text-xs text-gray-500 mt-0.5">{booking.treatment}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {showSyncBadge && booking.syncedFromCore && (
              <span className="rounded-full bg-violet-100 border border-violet-200 px-2 py-0.5 text-[10px] font-medium text-violet-700">
                Core Synced
              </span>
            )}
            <span className={cn(
              'rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
              STATUS_STYLES[booking.status],
            )}>
              {booking.status.replace('_', ' ')}
            </span>
            <button onClick={onClose} className="ml-1 text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Details */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 text-xs">
          <div>
            <dt className="text-gray-400 mb-0.5">Start</dt>
            <dd className="font-medium text-gray-800">{format(parseISO(booking.slotStart), 'EEE d MMM, HH:mm')}</dd>
          </div>
          <div>
            <dt className="text-gray-400 mb-0.5">End</dt>
            <dd className="font-medium text-gray-800">{format(parseISO(booking.slotEnd), 'HH:mm')}</dd>
          </div>
          {booking.patientPhone && (
            <div>
              <dt className="text-gray-400 mb-0.5">Phone</dt>
              <dd><a href={`tel:${booking.patientPhone}`} className="text-blue-600 hover:underline">{booking.patientPhone}</a></dd>
            </div>
          )}
          {booking.patientEmail && (
            <div className={booking.patientPhone ? '' : 'col-span-2'}>
              <dt className="text-gray-400 mb-0.5">Email</dt>
              <dd><a href={`mailto:${booking.patientEmail}`} className="text-blue-600 hover:underline truncate block">{booking.patientEmail}</a></dd>
            </div>
          )}
          {booking.notes && (
            <div className="col-span-2">
              <dt className="text-gray-400 mb-0.5">Notes</dt>
              <dd className="text-gray-700">{booking.notes}</dd>
            </div>
          )}
        </dl>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-2 border-t border-gray-100 px-5 py-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {onDelete && !confirming && (
              <button
                onClick={() => setConfirming(true)}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
            {confirming && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-gray-500">Are you sure?</span>
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={deleting}
                  onClick={() => { setDeleting(true); onDelete?.() }}
                  className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {deleting && <Loader2 className="h-3 w-3 animate-spin" />}
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
