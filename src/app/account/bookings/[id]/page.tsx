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
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  if (notFound || !booking) {
    return (
      <div className="max-w-lg space-y-4">
        <Link href="/account/bookings" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
        </Link>
        <p className="text-gray-500">Booking not found.</p>
      </div>
    )
  }

  const isVideoCall = Boolean(booking.videoCallMeetingId)
  const canJoin = isVideoCall && booking.videoCallJoinUrl && booking.status !== 'cancelled'

  return (
    <div className="max-w-lg space-y-6">
      <Link href="/account/bookings" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
      </Link>

      <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{booking.clinic.name}</h1>
            <p className="text-sm text-gray-500">{booking.treatment ?? 'Appointment'}</p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full shrink-0 font-medium ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-600' :
            booking.status === 'completed' ? 'bg-blue-100 text-black' :
            'bg-gray-100 text-gray-500'
          }`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <CalendarDays className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Date & time</p>
              <p className="text-sm text-gray-900">{format(new Date(booking.slotStart), 'd MMM yyyy')}</p>
              <p className="text-sm text-gray-900">
                {format(new Date(booking.slotStart), 'HH:mm')} – {format(new Date(booking.slotEnd), 'HH:mm')}
              </p>
            </div>
          </div>

          {booking.clinic.city && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Location</p>
                <p className="text-sm text-gray-900">{booking.clinic.city}</p>
              </div>
            </div>
          )}
        </div>

        {isVideoCall && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-900">Video consultation</p>
            </div>
            {canJoin ? (
              <a href={booking.videoCallJoinUrl!} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-gray-900 hover:bg-gray-700 text-white gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Join video call
                </Button>
              </a>
            ) : (
              <p className="text-xs text-gray-500">The join link will appear here when your appointment starts.</p>
            )}
          </div>
        )}

        {booking.notes && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-700">{booking.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
