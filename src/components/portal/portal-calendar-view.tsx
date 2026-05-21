'use client'

import { useEffect, useState, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { BookingCalendar, type CalendarBooking } from '@/components/calendar/booking-calendar'
import { NewBookingModal, type NewBookingData } from '@/components/calendar/new-booking-modal'

export function PortalCalendarView() {
  const [bookings, setBookings] = useState<CalendarBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const [newBookingDate, setNewBookingDate] = useState<Date | undefined>(undefined)
  const [editingBooking, setEditingBooking] = useState<CalendarBooking | null>(null)

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch('/directory/api/portal/bookings', { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to load bookings')
        return
      }
      const data = await res.json()
      setBookings(data.bookings ?? [])
    } catch {
      setError('Failed to load bookings')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  async function handleCreateBooking(data: NewBookingData) {
    const res = await fetch('/directory/api/portal/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Failed to create booking')
    setBookings((prev) => [...prev, json.booking as CalendarBooking].sort(
      (a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime()
    ))
  }

  async function handleEditBooking(data: NewBookingData) {
    if (!editingBooking) return
    const res = await fetch(`/directory/api/portal/bookings/${editingBooking.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? 'Failed to update booking')
    setBookings((prev) => prev.map((b) => b.id === editingBooking.id ? (json.booking as CalendarBooking) : b)
      .sort((a, b) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime()))
    setEditingBooking(null)
  }

  async function handleDeleteBooking(booking: CalendarBooking) {
    const res = await fetch(`/directory/api/portal/bookings/${booking.id}`, { method: 'DELETE' })
    if (!res.ok) return
    setBookings((prev) => prev.filter((b) => b.id !== booking.id))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
    )
  }

  return (
    <>
      <BookingCalendar
        bookings={bookings}
        onRefresh={() => fetchBookings(true)}
        refreshing={refreshing}
        showSyncBadge
        onNewBooking={() => { setNewBookingDate(undefined); setShowNewModal(true) }}
        onSlotClick={(date) => { setNewBookingDate(date); setShowNewModal(true) }}
        onEditBooking={setEditingBooking}
        onDeleteBooking={handleDeleteBooking}
      />
      {showNewModal && (
        <NewBookingModal
          onClose={() => setShowNewModal(false)}
          onSave={handleCreateBooking}
          defaultDate={newBookingDate}
        />
      )}
      {editingBooking && (
        <NewBookingModal
          onClose={() => setEditingBooking(null)}
          onSave={handleEditBooking}
          initialData={{
            id: editingBooking.id,
            patientName: editingBooking.patientName,
            patientPhone: editingBooking.patientPhone,
            patientEmail: editingBooking.patientEmail ?? '',
            treatment: editingBooking.treatment ?? '',
            notes: editingBooking.notes ?? '',
            slotStart: editingBooking.slotStart,
            slotEnd: editingBooking.slotEnd,
            status: editingBooking.status,
          }}
        />
      )}
    </>
  )
}
