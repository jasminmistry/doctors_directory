'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Loader2, Video, ExternalLink, CalendarDays, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Booking {
  id: number
  treatment: string | null
  slotStart: string
  slotEnd: string
  status: string
  notes: string | null
  videoCallMeetingId: string | null
  videoCallJoinUrl: string | null
  clinic: { id: number; name: string; slug: string; city: string | null }
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/directory/api/patient/bookings/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.ok ? r.json() : null
      })
      .then((d) => d && setBooking(d.booking))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  if (notFound || !booking) {
    return (
      <div className="max-w-lg space-y-4">
        <Link href="/directory/account/bookings" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
        </Link>
        <p className="text-slate-400">Booking not found.</p>
      </div>
    )
  }

  const isVideoCall = Boolean(booking.videoCallMeetingId)
  const canJoin = isVideoCall && booking.videoCallJoinUrl && booking.status !== 'cancelled'

  return (
    <div className="max-w-lg space-y-6">
      <Link href="/directory/account/bookings" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
      </Link>

      <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-white">{booking.clinic.name}</h1>
            <p className="text-sm text-slate-400">{booking.treatment ?? 'Appointment'}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-medium ${
            booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
            booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
            booking.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Date & time</p>
              <p className="text-sm text-white">{format(new Date(booking.slotStart), 'd MMM yyyy')}</p>
              <p className="text-sm text-white">
                {format(new Date(booking.slotStart), 'HH:mm')} – {format(new Date(booking.slotEnd), 'HH:mm')}
              </p>
            </div>
          </div>

          {booking.clinic.city && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm text-white">{booking.clinic.city}</p>
              </div>
            </div>
          )}
        </div>

        {isVideoCall && (
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-blue-400" />
              <p className="text-sm font-medium text-blue-300">Video consultation</p>
            </div>
            {canJoin ? (
              <a href={booking.videoCallJoinUrl!} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Join video call
                </Button>
              </a>
            ) : (
              <p className="text-xs text-slate-400">The join link will appear here when your appointment starts.</p>
            )}
          </div>
        )}

        {booking.notes && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Notes</p>
            <p className="text-sm text-slate-300">{booking.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
