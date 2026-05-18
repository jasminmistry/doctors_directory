'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, X, CalendarDays, Loader2, Video, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BookingWidget } from '@/components/clinic/booking-widget'
import { CallBookingForm } from '@/components/clinic/call-booking-form'
import { cn } from '@/lib/utils'
import { trackCtaClick } from '@/lib/tracking/client'
import type { DirectoryPageType } from '@/lib/tracking/types'

interface Message {
  id: number
  sender: 'patient' | 'clinic'
  content: string
  createdAt: string
}

interface StoredSession {
  sessionId: number
  visitorToken: string
  savedAt: number
}

interface ConsultationChatDialogProps {
  clinicSlug: string
  clinicName: string
  hasCoreCalendar: boolean
  treatment?: string
  location?: string
  pageType: Extract<DirectoryPageType, 'clinic_page' | 'practitioner_page' | 'collection_page'>
  buttonClassName?: string
}

type Phase = 'intro' | 'chat' | 'offline'

const POLL_INTERVAL_MS = 3_000
const SESSION_TTL_MS = 24 * 60 * 60 * 1000
const sessionKey = (slug: string) => `chat:${slug}`

function readStoredSession(slug: string): StoredSession | null {
  try {
    const raw = localStorage.getItem(sessionKey(slug))
    if (!raw) return null
    const parsed: StoredSession = JSON.parse(raw)
    if (Date.now() - parsed.savedAt > SESSION_TTL_MS) {
      localStorage.removeItem(sessionKey(slug))
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeStoredSession(slug: string, sessionId: number, visitorToken: string) {
  localStorage.setItem(sessionKey(slug), JSON.stringify({ sessionId, visitorToken, savedAt: Date.now() }))
}

function clearStoredSession(slug: string) {
  localStorage.removeItem(sessionKey(slug))
}

export function ConsultationChatDialog({
  clinicSlug,
  clinicName,
  hasCoreCalendar,
  treatment,
  pageType,
  buttonClassName,
}: ConsultationChatDialogProps) {
  const [open, setOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [callOpen, setCallOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('intro')
  const [checking, setChecking] = useState(false)
  // Whether the current session was restored from a previous visit (vs. started fresh this session)
  const [isRestored, setIsRestored] = useState(false)

  // Intro form
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [visitorToken, setVisitorToken] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const lastCreatedAt = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = readStoredSession(clinicSlug)
    if (!stored) return
    setSessionId(stored.sessionId)
    setVisitorToken(stored.visitorToken)
    setPhase('chat')
    setIsRestored(true)
  }, [clinicSlug])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages — only while the panel is open
  const pollMessages = useCallback(async () => {
    if (!sessionId || !visitorToken) return
    try {
      const params = new URLSearchParams({ visitorToken })
      if (lastCreatedAt.current) params.set('since', lastCreatedAt.current)
      const res = await fetch(
        `/directory/api/chat/${clinicSlug}/session/${sessionId}/messages?${params}`,
      )
      if (!res.ok) return
      const data: { messages: Message[] } = await res.json()
      if (data.messages.length > 0) {
        setMessages((prev) => [...prev, ...data.messages])
        lastCreatedAt.current = data.messages[data.messages.length - 1].createdAt
      }
    } catch {
      // silently ignore poll failures
    }
  }, [clinicSlug, sessionId, visitorToken])

  useEffect(() => {
    if (phase !== 'chat' || !open) return
    pollRef.current = setInterval(pollMessages, POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [phase, open, pollMessages])

  // Load full message history from server (used when restoring a session)
  const loadHistory = useCallback(async (sid: number, tok: string) => {
    setLoadingHistory(true)
    try {
      const res = await fetch(
        `/directory/api/chat/${clinicSlug}/session/${sid}/messages?visitorToken=${encodeURIComponent(tok)}`,
      )
      if (!res.ok) return
      const data: { messages: Message[] } = await res.json()
      setMessages(data.messages ?? [])
      if (data.messages.length > 0) {
        lastCreatedAt.current = data.messages[data.messages.length - 1].createdAt
      }
    } catch {
      // ignore — polling will catch new messages
    } finally {
      setLoadingHistory(false)
    }
  }, [clinicSlug])

  async function checkOnlineStatus() {
    setChecking(true)
    try {
      const res = await fetch(`/directory/api/chat/${clinicSlug}/status`)
      const data: { online: boolean } = await res.json()
      setPhase(data.online ? 'intro' : 'offline')
    } catch {
      setPhase('offline')
    } finally {
      setChecking(false)
    }
  }

  async function handleOpen() {
    setOpen(true)
    trackCtaClick({ ctaLabel: 'Request Consultation', pageType })

    if (sessionId && visitorToken) {
      // Existing session — go straight to chat and reload history from server
      setPhase('chat')
      await loadHistory(sessionId, visitorToken)
      return
    }

    await checkOnlineStatus()
  }

  async function handleStartChat() {
    if (!name.trim() || !contact.trim()) return
    setSending(true)
    try {
      const initialMessage = treatment
        ? `Hi, I'm interested in ${treatment}.`
        : "Hi, I'd like to enquire about a consultation."

      const res = await fetch(`/directory/api/chat/${clinicSlug}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: name.trim(),
          ...(contact.includes('@')
            ? { patientEmail: contact.trim() }
            : { patientPhone: contact.trim() }),
          initialMessage,
        }),
      })
      if (!res.ok) throw new Error()
      const data: { sessionId: number; visitorToken: string } = await res.json()

      setSessionId(data.sessionId)
      setVisitorToken(data.visitorToken)
      setIsRestored(false)
      // Persist the session pointer so it survives page navigation
      writeStoredSession(clinicSlug, data.sessionId, data.visitorToken)

      setPhase('chat')
      await sendMessage(data.sessionId, data.visitorToken, initialMessage)
    } catch {
      toast.error('Could not start chat. Please try again.')
    } finally {
      setSending(false)
    }
  }

  async function sendMessage(sid: number, token: string, content: string) {
    const res = await fetch(`/directory/api/chat/${clinicSlug}/session/${sid}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, visitorToken: token }),
    })
    if (!res.ok) throw new Error()
    const data: { message: Message } = await res.json()
    setMessages((prev) => [...prev, data.message])
    lastCreatedAt.current = data.message.createdAt
  }

  async function handleSend() {
    if (!draft.trim() || !sessionId || !visitorToken || sending) return
    const content = draft.trim()
    setDraft('')
    setSending(true)
    try {
      await sendMessage(sessionId, visitorToken, content)
    } catch {
      toast.error('Failed to send message.')
      setDraft(content)
    } finally {
      setSending(false)
    }
  }

  // Just hide the panel — session stays alive for when they return
  function handleClose() {
    setOpen(false)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  // Explicitly start a fresh conversation
  async function handleNewSession() {
    clearStoredSession(clinicSlug)
    setSessionId(null)
    setVisitorToken(null)
    setMessages([])
    setName('')
    setContact('')
    setIsRestored(false)
    lastCreatedAt.current = null
    if (pollRef.current) clearInterval(pollRef.current)
    await checkOnlineStatus()
  }

  const hasActiveSession = sessionId !== null

  return (
    <>
      {/* Trigger button — stretches full width in a flex-col parent */}
      <div className="relative flex w-full">
        <Button
          type="button"
          onClick={handleOpen}
          className={cn('w-full', buttonClassName)}
          data-no-auto-track="true"
        >
          Request Consultation
        </Button>
        {hasActiveSession && !open && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
        )}
      </div>

      {/* Floating chat panel
          Mobile : spans edge-to-edge with 1rem margins, max height respects viewport
          Desktop: fixed 384px wide anchored to bottom-right               */}
      <div
        className={cn(
          'fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden',
          'bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96',
          'transition-all duration-300 ease-in-out',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
        )}
        style={{ height: 'min(560px, calc(100dvh - 5rem))' }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="shrink-0 flex flex-row items-center justify-between px-4 py-3 border-b bg-white">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{clinicName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {phase === 'chat' && !isRestored && (
                <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Online now
                </span>
              )}
              {phase === 'chat' && isRestored && (
                <span className="text-xs text-gray-400">Previous conversation</span>
              )}
              {phase === 'offline' && (
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  Currently offline
                </span>
              )}
              {phase === 'chat' && (
                <button
                  onClick={handleNewSession}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                  title="Start a new conversation"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  New chat
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="ml-2 shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {(checking || loadingHistory) && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          )}

          {/* Offline fallback */}
          {!checking && !loadingHistory && phase === 'offline' && (
            <OfflineForm
              clinicSlug={clinicSlug}
              name={name}
              setName={setName}
              contact={contact}
              setContact={setContact}
              treatment={treatment}
            />
          )}

          {/* Intro — collect name/contact before starting chat */}
          {!checking && !loadingHistory && phase === 'intro' && (
            <div className="flex flex-col h-full justify-center gap-4 px-6 py-8">
              <p className="text-sm text-gray-600">
                This clinic is <span className="font-semibold text-green-600">online</span> right
                now. Enter your details to start chatting.
              </p>
              <Input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus={open}
              />
              <Input
                placeholder="Email or phone number"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
              <Button
                disabled={!name.trim() || !contact.trim() || sending}
                onClick={handleStartChat}
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Chat'}
              </Button>
            </div>
          )}

          {/* Chat messages */}
          {!checking && !loadingHistory && phase === 'chat' && (
            <div className="flex flex-col gap-2 px-4 py-3">
              {messages.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-4">
                  Conversation started — say hello!
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex w-full flex-col gap-0.5', msg.sender === 'patient' ? 'items-end' : 'items-start')}
                >
                  <span className="text-[10px] text-gray-400 px-1">
                    {msg.sender === 'patient' ? 'You' : clinicName}
                  </span>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
                      msg.sender === 'patient'
                        ? 'bg-black text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Toolbar */}
        {phase === 'chat' && !loadingHistory && (
          <div className="shrink-0 border-t bg-white">
            <div className="flex items-center gap-2 px-3 py-2">
              <Input
                className="flex-1 h-9 text-sm"
                placeholder="Type a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                autoFocus={open && phase === 'chat'}
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={!draft.trim() || sending}
                onClick={handleSend}
                aria-label="Send"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {hasCoreCalendar && (
              <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => setBookingOpen(true)}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  Book Visit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => setCallOpen(true)}
                >
                  <Video className="h-3.5 w-3.5" />
                  Video Call
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Appointment booking popup */}
      {hasCoreCalendar && (
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent className="max-w-lg p-0 overflow-hidden">
            <BookingWidget
              slug={clinicSlug}
              clinicName={clinicName}
              hasCoreCalendar={true}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Video call booking popup */}
      {hasCoreCalendar && (
        <Dialog open={callOpen} onOpenChange={setCallOpen}>
          <DialogContent className="max-w-sm p-0 overflow-hidden">
            <DialogHeader className="px-4 pt-4 pb-0">
              <DialogTitle className="text-sm flex items-center gap-2">
                <Video className="h-4 w-4 text-gray-400" />
                Book a Video Call
              </DialogTitle>
            </DialogHeader>
            <CallBookingForm
              clinicSlug={clinicSlug}
              prefillFirstName={name.split(' ')[0] ?? ''}
              prefillLastName={name.split(' ').slice(1).join(' ')}
              prefillEmail={contact.includes('@') ? contact : ''}
              prefillPhone={!contact.includes('@') ? contact : ''}
              compact
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Offline fallback — mirrors the existing RequestConsultationDialog form
// ---------------------------------------------------------------------------
interface OfflineFormProps {
  clinicSlug: string
  name: string
  setName: (v: string) => void
  contact: string
  setContact: (v: string) => void
  treatment?: string
}

function OfflineForm({ clinicSlug, name, setName, contact, setContact, treatment }: OfflineFormProps) {
  const [leadTreatment, setLeadTreatment] = useState(treatment ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !contact.trim() || submitting) return
    setSubmitting(true)
    try {
      const res = await fetch('/directory/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicSlug,
          patientName: name.trim(),
          contact: contact.trim(),
          treatment: leadTreatment.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      toast.error('Something went wrong, please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-2xl">✓</p>
        <p className="font-semibold">Request sent!</p>
        <p className="text-sm text-gray-500">The clinic will be in touch shortly.</p>
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-4 px-6 py-8" onSubmit={handleSubmit}>
      <p className="text-sm text-gray-500">
        The clinic is currently offline. Leave your details and they&apos;ll get back to you.
      </p>
      <Input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input required placeholder="Email or phone number" value={contact} onChange={(e) => setContact(e.target.value)} />
      <Input placeholder="Treatment (optional)" value={leadTreatment} onChange={(e) => setLeadTreatment(e.target.value)} />
      <Button disabled={!name.trim() || !contact.trim() || submitting} type="submit">
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send request'}
      </Button>
    </form>
  )
}
