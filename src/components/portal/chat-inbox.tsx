'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { format, isToday } from 'date-fns'

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
  messages: { content: string; sender: string; createdAt: string }[]
}

const POLL_INTERVAL_MS = 3_000

export function ChatInbox() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevMsgCountRef = useRef(0)

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
    const isNearBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 150

    if (prevCount === 0) {
      // Initial load — jump instantly without animation
      bottomRef.current?.scrollIntoView({ behavior: 'instant' })
    } else if (newCount > prevCount && isNearBottom) {
      // New message arrived and user is near the bottom
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    fetchSessions()
    const id = setInterval(fetchSessions, 5_000)
    return () => clearInterval(id)
  }, [])

  async function fetchSessions() {
    try {
      const res = await fetch('/directory/api/portal/chat/sessions', { cache: 'no-store' })
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
      const res = await fetch(`/directory/api/portal/chat/sessions/${sid}/messages`, { cache: 'no-store' })
      if (!res.ok) return
      const data: { messages: ChatMessage[] } = await res.json()
      setMessages(data.messages)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (!activeId) return
    fetchMessages(activeId)
    pollRef.current = setInterval(() => fetchMessages(activeId), POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeId, fetchMessages])

  async function handleSend() {
    if (!draft.trim() || !activeId || sending) return
    const content = draft.trim()
    setDraft('')
    setSending(true)
    try {
      const res = await fetch(`/directory/api/portal/chat/sessions/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error()
      const data: { message: ChatMessage } = await res.json()
      setMessages((prev) => [...prev, data.message])
      // Refresh session list so last-message preview updates
      fetchSessions()
    } catch {
      setDraft(content)
    } finally {
      setSending(false)
    }
  }

  const active = sessions.find((s) => s.id === activeId)

  function formatTime(iso: string) {
    const d = new Date(iso)
    return isToday(d) ? format(d, 'HH:mm') : format(d, 'd MMM')
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Session list */}
      <div className="w-72 shrink-0 flex flex-col border-r border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center pt-8">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <div className="flex flex-col items-center gap-2 pt-10 text-center px-4">
              <MessageSquare className="h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">No conversations yet</p>
            </div>
          )}

          {sessions.map((s) => {
            const lastMsg = s.messages[0]
            const unread = lastMsg?.sender === 'patient' && s.status === 'active'
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
                  <span className={cn('text-sm truncate', unread ? 'font-semibold text-gray-900' : 'text-gray-700')}>
                    {s.patientName ?? 'Patient'}
                  </span>
                  <span className="shrink-0 text-[10px] text-gray-400">
                    {lastMsg ? formatTime(lastMsg.createdAt) : ''}
                  </span>
                </div>
                <p className={cn('text-xs truncate mt-0.5', unread ? 'text-gray-800' : 'text-gray-400')}>
                  {lastMsg?.content ?? 'No messages yet'}
                </p>
                {unread && (
                  <span className="mt-1 inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Message pane */}
      <div className="flex flex-1 flex-col min-w-0">
        {!activeId && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-8">
            <MessageSquare className="h-10 w-10 text-gray-200" />
            <p className="text-sm text-gray-400">Select a conversation to reply</p>
          </div>
        )}

        {activeId && (
          <>
            {/* Header */}
            <div className="shrink-0 px-5 py-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">{active?.patientName ?? 'Patient'}</p>
              <p className="text-xs text-gray-400">
                {active?.patientEmail ?? active?.patientPhone ?? ''}
              </p>
            </div>

            {/* Messages */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto flex flex-col gap-2 px-5 py-4">
              {messages.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">No messages yet</p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex w-full flex-col gap-0.5', msg.sender === 'clinic' ? 'items-end' : 'items-start')}
                >
                  <span className="text-[10px] text-gray-400 px-1">
                    {msg.sender === 'clinic' ? 'You' : (active?.patientName ?? 'Patient')}
                  </span>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                      msg.sender === 'clinic'
                        ? 'bg-gray-900 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm',
                    )}
                  >
                    {msg.content}
                    <p className="text-[10px] mt-1 text-gray-400">
                      {format(new Date(msg.createdAt), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {active?.status === 'active' && (
              <div className="shrink-0 flex items-center gap-2 px-4 py-3 border-t border-gray-200">
                <Input
                  className="flex-1 h-9 text-sm"
                  placeholder="Reply…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={!draft.trim() || sending}
                  onClick={handleSend}
                  aria-label="Send reply"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
            {active?.status === 'closed' && (
              <p className="shrink-0 px-4 py-3 border-t text-xs text-gray-400 text-center">
                Conversation closed
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
