'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, MessageSquare, UserCircle, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

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
  status: string
  videoCallJoinUrl: string | null
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

export default function AccountDashboardPage() {
  const [patient, setPatient] = useState<PatientMe | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])

  useEffect(() => {
    fetch('/directory/api/patient/me').then((r) => r.ok ? r.json() : null).then(setPatient)
    fetch('/directory/api/patient/bookings').then((r) => r.ok ? r.json() : null).then((d) => setBookings(d?.bookings?.slice(0, 3) ?? []))
    fetch('/directory/api/patient/chats').then((r) => r.ok ? r.json() : null).then((d) => setSessions(d?.sessions?.slice(0, 3) ?? []))
  }, [])

  const displayName = patient
    ? [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.email
    : '...'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back{patient?.firstName ? `, ${patient.firstName}` : ''}</h1>
        <p className="text-sm text-slate-400 mt-1">{patient?.email ?? ''}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CalendarDays, label: 'Bookings', count: bookings.length, href: '/account/bookings' },
          { icon: MessageSquare, label: 'Consultations', count: sessions.length, href: '/account/chats' },
          { icon: UserCircle, label: 'Profile', count: null, href: '/account/profile' },
        ].map(({ icon: Icon, label, count, href }) => (
          <Link
            key={href}
            href={`/directory${href}`}
            className="flex flex-col items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-5 hover:bg-white/10 transition-colors"
          >
            <Icon className="h-5 w-5 text-slate-400" />
            {count !== null && (
              <span className="text-2xl font-bold text-white">{count}</span>
            )}
            <span className="text-xs text-slate-400">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent bookings */}
      {bookings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Recent Bookings</h2>
            <Link href="/directory/account/bookings" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {bookings.map((b) => (
              <Link
                key={b.id}
                href={`/directory/account/bookings/${b.id}`}
                className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{b.clinic.name}</p>
                  <p className="text-xs text-slate-400">{b.treatment ?? 'Appointment'} · {format(new Date(b.slotStart), 'd MMM yyyy, HH:mm')}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {b.status}
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
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">Recent Consultations</h2>
            <Link href="/directory/account/chats" className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/directory/account/chats/${s.id}`}
                className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">{s.clinic.name}</p>
                  <p className="text-xs text-slate-400 truncate max-w-[280px]">
                    {s.messages[0]?.content ?? 'No messages yet'}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {s.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {bookings.length === 0 && sessions.length === 0 && (
        <div className="rounded-xl bg-white/5 border border-white/10 px-6 py-10 text-center">
          <p className="text-slate-400 text-sm">No activity yet.</p>
          <p className="text-slate-500 text-xs mt-1">Book a consultation or appointment to get started.</p>
        </div>
      )}
    </div>
  )
}
