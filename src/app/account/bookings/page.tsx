'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { CalendarDays, Loader2, Video } from 'lucide-react'

interface Booking {
  id: number
  treatment: string | null
  slotStart: string
  slotEnd: string
  status: string
  videoCallJoinUrl: string | null
  videoCallMeetingId: string | null
  clinic: { name: string; slug: string; city: string | null }
}

export default function AccountBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/directory/api/patient/bookings')
      .then((r) => r.ok ? r.json() : { bookings: [] })
      .then((d) => setBookings(d.bookings ?? []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-white">Bookings</h1>

      {bookings.length === 0 ? (
        <div className="rounded-xl bg-white/5 border border-white/10 px-6 py-10 text-center">
          <CalendarDays className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No bookings yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/directory/account/bookings/${b.id}`}
              className="block rounded-xl bg-white/5 border border-white/10 px-5 py-4 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{b.clinic.name}</p>
                    {b.videoCallMeetingId && (
                      <span className="flex items-center gap-1 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full shrink-0">
                        <Video className="h-2.5 w-2.5" />
                        Video
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {b.treatment ?? 'Appointment'} · {format(new Date(b.slotStart), 'd MMM yyyy, HH:mm')}
                  </p>
                  {b.clinic.city && (
                    <p className="text-xs text-slate-500 mt-0.5">{b.clinic.city}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                  b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {b.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
