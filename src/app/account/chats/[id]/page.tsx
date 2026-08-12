'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { IconArrowNarrowLeft, IconLoader2, IconSend } from '@tabler/icons-react'

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
  const [paneHeight, setPaneHeight] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const lastCreatedAt = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevMsgCountRef = useRef(0)

  // Pin the card to the actual remaining viewport space (measured, not
  // guessed) so the reply input always stays visible without needing to
  // scroll the page — the fixed "8rem" chrome offset varies between mobile
  // (topbar) and desktop (no topbar).
  useEffect(() => {
    function recalc() {
      const el = containerRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top
      setPaneHeight(window.innerHeight - top - 16)
    }
    recalc()
    window.addEventListener('resize', recalc)

    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('resize', recalc)
      document.documentElement.style.overflow = prevOverflow
    }
  }, [loading, notFound])

  useEffect(() => {
    fetch(`/directory/api/patient/chats/${id}/messages/`)
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

  // Scroll the messages pane itself only — never scrollIntoView(), which walks
  // up every scrollable ancestor (including the page) and lands the whole
  // page at the bottom instead of just the chat thread.
  useEffect(() => {
    const newCount = messages.length
    const prevCount = prevMsgCountRef.current
    prevMsgCountRef.current = newCount

    if (newCount === 0) return

    const el = messagesContainerRef.current
    if (!el) return

    if (prevCount === 0) {
      el.scrollTop = el.scrollHeight
    } else if (newCount > prevCount) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const poll = useCallback(async () => {
    const params = lastCreatedAt.current ? `?since=${encodeURIComponent(lastCreatedAt.current)}` : ''
    try {
      const res = await fetch(`/directory/api/patient/chats/${id}/messages/${params}`)
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
      const res = await fetch(`/directory/api/patient/chats/${id}/messages/`, {
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
        <IconLoader2 stroke={1.5} className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  if (notFound || !session) {
    return (
      <div className="max-w-lg space-y-4">
        <Link href="/account/chats" className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
          <IconArrowNarrowLeft stroke={1.5} className="h-3.5 w-3.5" /> Back
        </Link>
        <p className="text-gray-600">Conversation not found.</p>
      </div>
    )
  }

  const isClosed = session.status !== 'active'

  return (
    <div
      ref={containerRef}
      className="max-w-2xl flex flex-col"
      style={paneHeight ? { height: paneHeight } : { height: 'calc(100dvh - 8rem)' }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 mb-4">
        <Link href="/account/chats" className="text-gray-600 hover:text-gray-900">
          <IconArrowNarrowLeft stroke={1.5} className="h-4 w-4" />
        </Link>
        <div>
          <p className="text-sm font-semibold text-gray-900">{session.clinic.name}</p>
          <span className={cn(
            'text-[10px] px-2 py-0.5 rounded-full',
            isClosed ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700',
          )}>
            {isClosed ? 'Closed' : 'Active'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className={cn(
          'flex-1 overflow-y-auto rounded-lg bg-white border border-gray-200 p-4 min-h-0',
          messages.length === 0 ? 'flex items-center justify-center' : 'flex flex-col gap-3',
        )}
      >
        {messages.length === 0 && (
          <p className="text-xs text-gray-600 text-center">No messages yet</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn('flex flex-col gap-0.5', msg.sender === 'patient' ? 'items-end' : 'items-start')}
          >
            <span className="text-[10px] text-gray-600 px-1">
              {msg.sender === 'patient' ? 'You' : session.clinic.name}
            </span>
            <div className={cn(
              'max-w-[80%] rounded-lg px-3.5 py-2 text-sm',
              msg.sender === 'patient'
                ? 'bg-black text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-900 rounded-bl-sm',
            )}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      {isClosed ? (
        <p className="mt-3 text-center text-xs text-gray-600">This consultation has been closed.</p>
      ) : (
        <div className="shrink-0 mt-3 flex items-center gap-2">
          <Input
            className="flex-1 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            autoFocus
          />
          <Button
            size="icon"
            className="shrink-0 text-white hover:bg-neutral-800"
            disabled={!draft.trim() || sending}
            onClick={handleSend}
            aria-label="Send"
          >
            {sending ? <IconLoader2 stroke={1.5} className="h-4 w-4 animate-spin" /> : <IconSend stroke={1.5} className="h-4 w-4 text-white" />}
          </Button>
        </div>
      )}
    </div>
  )
}
