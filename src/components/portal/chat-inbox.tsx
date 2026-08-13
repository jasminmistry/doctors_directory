'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { CHAT_MESSAGE_MAX_LENGTH } from '@/lib/consentz-chat'
import { format, isToday } from 'date-fns'
import { IconChevronLeft, IconLoader2, IconMessage, IconSend } from '@tabler/icons-react'

interface ChatMessage {
  id: number
  sender: 'patient' | 'clinic'
  content: string
  createdAt: string
}

interface ChatSession {
  id: number
  patientName: string | null
  patientEmail: string | null
  patientPhone: string | null
  status: 'active' | 'closed'
  updatedAt: string
  unread: number
  messages: { content: string; sender: string; createdAt: string }[]
}

const POLL_INTERVAL_MS = 3_000
// Matches the portal layout's bottom padding (p-10 on the main content
// wrapper in PortalLayoutClient) so the pane stops short of the viewport
// edge instead of covering it — window.innerHeight alone doesn't know
// about that padding.
const LAYOUT_BOTTOM_GAP = 40

function StatusBadge({ status }: { status?: 'active' | 'closed' }) {
  if (!status) return null
  const isActive = status === 'active'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-medium',
        isActive ? 'text-green-600' : 'text-gray-600',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-green-500' : 'bg-gray-300')} />
      {isActive ? 'Active' : 'Closed'}
    </span>
  )
}

export function ChatInbox() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paneHeight, setPaneHeight] = useState<number | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevMsgCountRef = useRef(0)
  // Synchronous guard — `sending` state is only safe to check-then-set across
  // renders, not within the same tick, so a fast double Enter/click could
  // otherwise send the same reply twice before the disabled state commits.
  const sendingRef = useRef(false)

  // Pin the inbox to the actual remaining viewport space (measured, not guessed)
  // and lock page-level scroll while it's mounted — otherwise, whenever the
  // document itself is tall enough to scroll, opening a conversation or
  // sending a message causes the browser to reflow/scroll-anchor the whole
  // page instead of just the messages pane.
  useEffect(() => {
    function recalc() {
      const el = containerRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top
      setPaneHeight(window.innerHeight - top - LAYOUT_BOTTOM_GAP)
    }
    recalc()
    window.addEventListener('resize', recalc)

    const prevOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('resize', recalc)
      document.documentElement.style.overflow = prevOverflow
    }
  }, [])

  // Reset scroll tracking when switching conversations
  useEffect(() => {
    prevMsgCountRef.current = 0
    setMessages([])
  }, [activeId])

  // Auto-scroll only when new messages arrive AND user is near the bottom
  useEffect(() => {
    const newCount = messages.length
    const prevCount = prevMsgCountRef.current
    prevMsgCountRef.current = newCount

    if (newCount === 0) return

    const el = messagesContainerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150

    // Scroll the messages pane itself only — never scrollIntoView(), which
    // walks up every scrollable ancestor (including the page) and can land
    // the reply box in view while shoving the message thread off-screen.
    if (prevCount === 0) {
      // Initial load — jump instantly without animation
      el.scrollTop = el.scrollHeight
    } else if (newCount > prevCount && isNearBottom) {
      // New message arrived and user is near the bottom
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    fetchSessions()
    const id = setInterval(fetchSessions, 5_000)
    return () => clearInterval(id)
  }, [])

  async function fetchSessions() {
    try {
      const res = await fetch('/directory/api/portal/chat/sessions/', { cache: 'no-store' })
      if (!res.ok) return
      const data: { sessions: ChatSession[] } = await res.json()
      setSessions(data.sessions)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = useCallback(async (sid: number) => {
    try {
      const res = await fetch(`/directory/api/portal/chat/sessions/${sid}/messages/`, { cache: 'no-store' })
      if (!res.ok) return
      const data: { messages: ChatMessage[] } = await res.json()
      setMessages(data.messages)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!activeId) return
    // Opening a conversation marks it read server-side (see messages GET
    // route) — refresh the session list right away so the unread dot/badge
    // clears immediately instead of waiting for the next 5s poll.
    fetchMessages(activeId).then(fetchSessions)
    pollRef.current = setInterval(() => fetchMessages(activeId), POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeId, fetchMessages])

  async function handleSend() {
    if (!draft.trim() || !activeId || sendingRef.current) return
    sendingRef.current = true
    const content = draft.trim()
    setDraft('')
    setSending(true)
    try {
      const res = await fetch(`/directory/api/portal/chat/sessions/${activeId}/messages/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? 'Failed to send message.')
      }
      const data: { message: ChatMessage } = await res.json()
      setMessages((prev) => [...prev, data.message])
      // Refresh session list so last-message preview updates
      fetchSessions()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message.')
      setDraft(content)
    } finally {
      sendingRef.current = false
      setSending(false)
    }
  }

  const active = sessions.find((s) => s.id === activeId)

  function formatTime(iso: string) {
    const d = new Date(iso)
    return isToday(d) ? format(d, 'HH:mm') : format(d, 'd MMM')
  }

  return (
    <div
      ref={containerRef}
      style={paneHeight ? { height: paneHeight } : undefined}
      className="flex h-[calc(100dvh-8rem)] rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Session list — full width on mobile until a conversation is opened, fixed-width sidebar from md up */}
      <div
        className={cn(
          'w-full md:w-72 shrink-0 flex-col border-r border-gray-200',
          activeId ? 'hidden md:flex' : 'flex',
        )}
      >

        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center pt-8">
              <IconLoader2  stroke={1.5} className="h-5 w-5 animate-spin text-gray-600" />
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="flex flex-col items-center gap-2 pt-10 text-center px-4">
              <IconMessage stroke={1.5} className="h-8 w-8" />
              <p className="text-sm text-gray-600">No conversations yet</p>
            </div>
          )}

          {sessions.map((s) => {
            const lastMsg = s.messages[0]
            const unread = s.unread
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveId(s.id)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors',
                  activeId === s.id && 'bg-gray-100',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={cn('text-sm truncate', unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-700')}>
                    {s.patientName ?? 'Patient'}
                  </span>
                  <span className="shrink-0 text-[10px] text-gray-600">
                    {lastMsg ? formatTime(lastMsg.createdAt) : ''}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2 mt-0.5">
                  <p className={cn('text-xs truncate', unread > 0 ? 'text-gray-800 font-medium' : 'text-gray-600')}>
                    {lastMsg?.content ?? 'No messages yet'}
                  </p>
                  {unread > 0 && (
                    <span
                      className="shrink-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-medium text-white"
                      aria-label={`${unread} unread message${unread === 1 ? '' : 's'}`}
                    >
                      {unread > 99 ? '99+' : unread}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge status={s.status} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Message pane — hidden on mobile until a conversation is opened, always visible from md up */}
      <div className={cn('flex-1 flex-col min-w-0', activeId ? 'flex' : 'hidden md:flex')}>
        {!activeId && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-8">
            <IconMessage stroke={1.5} className="h-10 w-10" />
            <p className="text-sm text-gray-600">Select a conversation to reply</p>
          </div>
        )}

        {activeId && (
          <>
            {/* Header */}
            <div className="shrink-0 flex items-center gap-2 px-5 py-3 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="md:hidden -ml-1 shrink-0 rounded-lg p-1 text-gray-600 hover:text-gray-700"
                aria-label="Back to conversations"
              >
                <IconChevronLeft stroke={1.5} className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{active?.patientName ?? 'Patient'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={active?.status} />
                  {(active?.patientEmail || active?.patientPhone) && (
                    <p className="text-xs text-gray-600 truncate">
                      {active?.patientEmail ?? active?.patientPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className={cn(
                'flex-1 overflow-y-auto flex flex-col gap-2 px-5 py-4',
                messages.length === 0 && 'items-center justify-center',
              )}
            >
              {messages.length === 0 && (
                <p className="text-sm text-gray-600 text-center">No messages yet</p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex w-full flex-col gap-0.5', msg.sender === 'clinic' ? 'items-end' : 'items-start')}
                >
                  <span className="text-[10px] text-gray-600 px-1">
                    {msg.sender === 'clinic' ? 'You' : (active?.patientName ?? 'Patient')}
                  </span>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg px-3.5 py-2 text-sm',
                      msg.sender === 'clinic'
                        ? 'bg-gray-100 text-gray-900 rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm',
                    )}
                  >
                    {msg.content}
                    <p className="text-[10px] mt-1 text-gray-600">
                      {format(new Date(msg.createdAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            {active?.status === 'active' && (
              <div className="shrink-0 flex items-center px-4 gap-2 border-t border-gray-200">
                <div className="relative flex-1">
                  <Input
                    className={cn(
                      'h-15 rounded-none border-none text-sm focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0',
                      draft.length > CHAT_MESSAGE_MAX_LENGTH - 200 && 'pr-12',
                    )}
                    placeholder="Reply…"
                    value={draft}
                    maxLength={CHAT_MESSAGE_MAX_LENGTH}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                  {draft.length > CHAT_MESSAGE_MAX_LENGTH - 200 && (
                    <span
                      className={cn(
                        'pointer-events-none absolute right-1 bottom-1 text-[10px]',
                        draft.length >= CHAT_MESSAGE_MAX_LENGTH ? 'text-red-500' : 'text-gray-600',
                      )}
                    >
                      {draft.length}/{CHAT_MESSAGE_MAX_LENGTH}
                    </span>
                  )}
                </div>
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={!draft.trim() || sending}
                  onClick={handleSend}
                  aria-label="Send reply"
                >
                  {sending ? (
                    <IconLoader2 stroke={1.5} className="h-4 w-4 animate-spin" />
                  ) : (
                    <IconSend stroke={1.5} className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            {active?.status === 'closed' && (
              <p className="shrink-0 px-4 py-3 border-t text-xs text-gray-600 text-center">
                Conversation closed
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
