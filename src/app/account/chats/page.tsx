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
        <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-medium text-gray-900">Consultations</h1>

      {sessions.length === 0 ? (
        <div className="rounded-lg bg-white border border-gray-200 px-6 py-10 text-center">
          <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">No consultations yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const last = s.messages[0]
            return (
              <Link
                key={s.id}
                href={`/account/chats/${s.id}`}
                className="block rounded-lg bg-white border border-gray-200 px-5 py-4 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{s.clinic.name}</p>
                    {last ? (
                      <p className="text-xs text-gray-600 truncate mt-0.5">
                        {last.sender === 'clinic' ? `${s.clinic.name}: ` : 'You: '}{last.content}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600 mt-0.5">No messages</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">{format(new Date(s.createdAt), 'd MMM yyyy')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
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
