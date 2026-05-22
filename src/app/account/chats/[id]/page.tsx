'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: number
  sender: 'patient' | 'clinic'
  content: string
  createdAt: string
}

interface Session {
  id: number
  status: string
  clinic: { name: string; slug: string }
}

const POLL_MS = 3_000

export default function ChatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const lastCreatedAt = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load initial messages
  useEffect(() => {
    fetch(`/directory/api/patient/chats/${id}/messages`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.ok ? r.json() : null
      })
      .then((data) => {
        if (!data) return
        setSession(data.session)
        setMessages(data.messages ?? [])
        if (data.messages?.length > 0) {
          lastCreatedAt.current = data.messages[data.messages.length - 1].createdAt
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages
  const poll = useCallback(async () => {
    const params = lastCreatedAt.current ? `?since=${encodeURIComponent(lastCreatedAt.current)}` : ''
    try {
      const res = await fetch(`/directory/api/patient/chats/${id}/messages${params}`)
      if (!res.ok) return
      const data: { messages: Message[] } = await res.json()
      if (data.messages?.length > 0) {
        setMessages((prev) => [...prev, ...data.messages])
        lastCreatedAt.current = data.messages[data.messages.length - 1].createdAt
      }
    } catch { /* ignore */ }
  }, [id])

  useEffect(() => {
    if (!session) return
    pollRef.current = setInterval(poll, POLL_MS)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [session, poll])

  async function handleSend() {
    if (!draft.trim() || sending || !session || session.status !== 'active') return
    const content = draft.trim()
    setDraft('')
    setSending(true)
    try {
      const res = await fetch(`/directory/api/patient/chats/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error()
      const data: { message: Message } = await res.json()
      setMessages((prev) => [...prev, data.message])
      lastCreatedAt.current = data.message.createdAt
    } catch {
      toast.error('Failed to send — please try again')
      setDraft(content)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    )
  }

  if (notFound || !session) {
    return (
      <div className="max-w-lg space-y-4">
        <Link href="/directory/account/chats" className="flex items-center gap-1 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <p className="text-slate-400">Conversation not found.</p>
      </div>
    )
  }

  const isClosed = session.status !== 'active'

  return (
    <div className="max-w-2xl flex flex-col" style={{ height: 'calc(100dvh - 8rem)' }}>
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 mb-4">
        <Link href="/directory/account/chats" className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-sm font-semibold text-white">{session.clinic.name}</p>
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full',
            isClosed ? 'bg-slate-500/20 text-slate-400' : 'bg-green-500/20 text-green-400',
          )}>
            {session.status}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-white/5 border border-white/10 p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-8">No messages yet</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex flex-col gap-0.5', msg.sender === 'patient' ? 'items-end' : 'items-start')}
          >
            <span className="text-[10px] text-slate-500 px-1">
              {msg.sender === 'patient' ? 'You' : session.clinic.name}
            </span>
            <div className={cn(
              'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
              msg.sender === 'patient'
                ? 'bg-white text-slate-900 rounded-br-sm'
                : 'bg-white/10 text-white rounded-bl-sm',
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isClosed ? (
        <p className="mt-3 text-center text-xs text-slate-500">This consultation has been closed.</p>
      ) : (
        <div className="shrink-0 mt-3 flex items-center gap-2">
          <Input
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            autoFocus
          />
          <Button
            size="icon"
            className="shrink-0 bg-white text-slate-900 hover:bg-slate-100"
            disabled={!draft.trim() || sending}
            onClick={handleSend}
            aria-label="Send"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}
