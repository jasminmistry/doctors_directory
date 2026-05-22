'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { MessageSquare, Loader2 } from 'lucide-react'

interface ChatSession {
  id: number
  status: string
  createdAt: string
  clinic: { name: string; slug: string; city: string | null }
  messages: { content: string; sender: string; createdAt: string }[]
}

export default function AccountChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/directory/api/patient/chats')
      .then((r) => r.ok ? r.json() : { sessions: [] })
      .then((d) => setSessions(d.sessions ?? []))
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
      <h1 className="text-xl font-bold text-white">Consultations</h1>

      {sessions.length === 0 ? (
        <div className="rounded-xl bg-white/5 border border-white/10 px-6 py-10 text-center">
          <MessageSquare className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No consultations yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const last = s.messages[0]
            return (
              <Link
                key={s.id}
                href={`/directory/account/chats/${s.id}`}
                className="block rounded-xl bg-white/5 border border-white/10 px-5 py-4 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{s.clinic.name}</p>
                    {last ? (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {last.sender === 'clinic' ? `${s.clinic.name}: ` : 'You: '}{last.content}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-0.5">No messages</p>
                    )}
                    <p className="text-xs text-slate-600 mt-1">{format(new Date(s.createdAt), 'd MMM yyyy')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    s.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {s.status}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
