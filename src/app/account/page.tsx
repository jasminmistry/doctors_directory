'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  CalendarDays, MessageSquare, UserCircle, ArrowRight,
  Search, Video, Star, ChevronRight, HelpCircle,
} from 'lucide-react'
import { isFuture, addMinutes } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import { capitalize, cn } from '@/lib/utils'

// Bookings are always shown in the clinic's own timezone, never the visitor's
// browser timezone — every clinic in this directory is UK-based.
const CLINIC_TIMEZONE = 'Europe/London'

interface PatientMe {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
}

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

interface ChatSession {
  id: number
  clinicId: number
  status: string
  createdAt: string
  clinic: { name: string; slug: string }
  messages: { content: string; sender: string; createdAt: string }[]
}

function NextActions() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-900">What would you like to do?</p>
      <div className="space-y-2">
        <Link
          href="/search"
          className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-700 hover:border-[#e0e0e0]  hover:bg-gray-50 transition-colors"
        >
          <Search className="h-4 w-4 text-gray-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">Find a clinic or practitioner</p>
            <p className="text-xs text-gray-600 mt-0.5">Search by treatment, location, or name</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
        </Link>
        <Link
          href="/account/bookings"
          className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-700 hover:border-[#e0e0e0]  hover:bg-gray-50 transition-colors"
        >
          <CalendarDays className="h-4 w-4 text-gray-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">View my bookings</p>
            <p className="text-xs text-gray-600 mt-0.5">Upcoming appointments and history</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
        </Link>
        <Link
          href="/search"
          className="flex items-center gap-3 rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-700 hover:border-[#e0e0e0]  hover:bg-gray-50 transition-colors"
        >
          <MessageSquare className="h-4 w-4 text-gray-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">Book a consultation</p>
            <p className="text-xs text-gray-600 mt-0.5">Find a clinic, open their profile, and start a chat</p>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
        </Link>
      </div>
    </div>
  )
}

export default function AccountDashboardPage() {
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === '1'
  const [patient, setPatient] = useState<PatientMe | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [bookingTotal, setBookingTotal] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)

  useEffect(() => {
    fetch('/directory/api/patient/me/').then((r) => r.ok ? r.json() : null).then(setPatient)
    fetch('/directory/api/patient/bookings/').then((r) => r.ok ? r.json() : null).then((d) => {
      const all: Booking[] = d?.bookings ?? []
      setBookingTotal(all.length)
      setBookings(all.slice(0, 3))
    })
    fetch('/directory/api/patient/chats/').then((r) => r.ok ? r.json() : null).then((d) => {
      const all: ChatSession[] = d?.sessions ?? []
      setSessionTotal(all.length)
      setSessions(all.slice(0, 3))
    })
  }, [])

  // Find an upcoming video call within the join window (15 min before → 1 hr after)
  const upcomingCall = bookings.find((b) => {
    if (!b.videoCallJoinUrl || b.status === 'cancelled') return false
    const start = new Date(b.slotStart)
    const end = new Date(b.slotEnd)
    const now = new Date()
    return now >= addMinutes(start, -15) && now <= addMinutes(end, 60)
  })

  // Soonest upcoming in-person/non-call booking
  const nextBooking = bookings.find((b) => b.status !== 'cancelled' && isFuture(new Date(b.slotStart)))

  const hasActivity = bookingTotal > 0 || sessionTotal > 0

  return (
    <div className="mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-gray-900">
          {isNew ? 'Welcome' : 'Welcome back'}{patient?.firstName ? `, ${patient.firstName}` : ''}
        </h1>
        <p className="text-sm text-gray-600 mt-1">{patient?.email ?? ''}</p>
      </div>

      {/* Join call — prominent CTA when in join window */}
      {upcomingCall && (
        <a
          href={upcomingCall.videoCallJoinUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg bg-green-600 hover:bg-green-700 transition-colors px-5 py-4 text-white"
        >
          <Video className="h-5 w-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Your video call is ready to join</p>
            <p className="text-xs text-green-100 mt-0.5">
              {upcomingCall.clinic.name} · {upcomingCall.treatment ?? 'Consultation'}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-green-200" />
        </a>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CalendarDays, label: 'Bookings', count: bookingTotal, href: '/account/bookings' },
          { icon: MessageSquare, label: 'Consultations', count: sessionTotal, href: '/account/chats' },
          { icon: UserCircle, label: 'Profile', count: null, href: '/account/profile' },
        ].map(({ icon: Icon, label, count, href }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-lg bg-white border border-gray-200 px-4 py-5 hover:border-gray-400 transition-colors"
          >
            <Icon className="h-5 w-5 text-gray-600" />
            {count !== null && <span className="text-2xl font-medium text-gray-900">{count}</span>}
            <span className="text-xs text-gray-600">{label}</span>
          </Link>
        ))}
      </div>

      {/* Next appointment callout */}
      {nextBooking && !upcomingCall && (
        <Link
          href={`/account/bookings/${nextBooking.id}`}
          className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3.5 hover:bg-blue-100 transition-colors"
        >
          <CalendarDays className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-900">
              Next: {nextBooking.clinic.name}
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              {nextBooking.treatment ?? 'Appointment'} ·{' '}
              {formatInTimeZone(nextBooking.slotStart, CLINIC_TIMEZONE, 'd MMM yyyy, HH:mm')}
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-blue-400 shrink-0" />
        </Link>
      )}

      {/* Recent bookings */}
      {bookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Recent Bookings</h2>
            <Link href="/account/bookings" className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/account/bookings/${b.id}`}
                className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-4 py-3 hover:border-gray-400 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{b.clinic.name}</p>
                  <p className="text-xs text-gray-600">
                    {b.treatment ?? 'Appointment'} ·{' '}
                    {formatInTimeZone(b.slotStart, CLINIC_TIMEZONE, 'd MMM yyyy, HH:mm')}
                  </p>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                )}>
                  {capitalize(b.status)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent consultations */}
      {sessions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Recent Consultations</h2>
            <Link href="/account/chats" className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/account/chats/${s.id}`}
                className="flex items-center justify-between rounded-lg bg-white border border-gray-200 px-4 py-3 hover:border-gray-400 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{s.clinic.name}</p>
                  <p className="text-xs text-gray-600 truncate max-w-[280px]">
                    {s.messages[0]?.content ?? 'No messages yet'}
                  </p>
                </div>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600',
                )}>
                  {s.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!hasActivity && (
        <div className="space-y-4">
          <div className="rounded-lg bg-white border border-gray-200 px-6 py-8 text-center">
            <Star className="mx-auto h-8 w-8 text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-700">Your account is ready</p>
            <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
              Search for a clinic or practitioner, open their profile, and click <strong className="text-gray-600">Chat</strong> to start a consultation. Bookings and consultations will appear here once you&apos;ve connected with a provider.
            </p>
          </div>
          <NextActions />
          {/* Support guidance */}
          <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-4">
            <HelpCircle className="h-4 w-4 text-gray-600 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-medium text-gray-700">Expected to see a consultation here?</p>
              <p>Chat sessions are created when you start a conversation from a clinic&apos;s profile page. If you started a chat but don&apos;t see it, it may have expired (sessions last 24 hours) or you may have been using a different email address. Try starting a new conversation from the clinic&apos;s profile.</p>
            </div>
          </div>
        </div>
      )}

      {/* Next actions for returning users with activity */}
      {hasActivity && (
        <section>
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Quick actions</h2>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              Find a clinic
            </Link>
            <Link
              href="/account/bookings"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              My bookings
            </Link>
            <Link
              href="/account/chats"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              My consultations
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
