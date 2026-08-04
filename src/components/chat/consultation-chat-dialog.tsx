'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Send, X, CalendarDays, Loader2, Video, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BookingWidget } from '@/components/Clinic/booking-widget'
import { CallBookingForm } from '@/components/Clinic/call-booking-form'
import { InlineLogin } from '@/components/consultation/inline-login'
import { ConsultationRichForm } from '@/components/consultation/consultation-form'
import type { ConsultationFormData } from '@/components/consultation/consultation-form'
import { cn } from '@/lib/utils'
import { trackCtaClick } from '@/lib/tracking/client'
import type { DirectoryPageType } from '@/lib/tracking/types'
import { useExclusiveFloatingPanel } from '@/lib/floating-panel-bus'
import { CHAT_MESSAGE_MAX_LENGTH } from '@/lib/consentz-chat'

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

interface PatientMe {
  id: number
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
}

interface ConsultationChatDialogProps {
  clinicSlug: string
  clinicName: string
  clinicImage?: string
  hasCoreCalendar: boolean
  location?: string
  pageType: Extract<DirectoryPageType, 'clinic_page' | 'practitioner_page' | 'collection_page'>
  buttonClassName?: string
}

type Phase = 'intro' | 'chat' | 'offline' | 'login_required'

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
  clinicImage,
  hasCoreCalendar,
  pageType,
  buttonClassName,
}: ConsultationChatDialogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [callOpen, setCallOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('intro')

  useExclusiveFloatingPanel(`chat:${clinicSlug}`, open, setOpen)
  const [checking, setChecking] = useState(false)
  const [isRestored, setIsRestored] = useState(false)

  // Patient session — fetched on open/auth-check
  const [patientMe, setPatientMe] = useState<PatientMe | null>(null)
  // Form data captured after the intro form is submitted (for CallBookingForm prefill)
  const [chatFormData, setChatFormData] = useState<ConsultationFormData | null>(null)

  // Whether we are submitting the offline lead form
  const [offlineSubmitting, setOfflineSubmitting] = useState(false)
  const [offlineSent, setOfflineSent] = useState(false)

  // Whether we are starting the chat (intro submit)
  const [startingChat, setStartingChat] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [visitorToken, setVisitorToken] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const lastCreatedAt = useRef<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevMsgCountRef = useRef(0)

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = readStoredSession(clinicSlug)
    if (!stored) return
    setSessionId(stored.sessionId)
    setVisitorToken(stored.visitorToken)
    setPhase('chat')
    setIsRestored(true)
  }, [clinicSlug])

  // Auto-open when returning from magic link / OAuth with ?consult=open
  useEffect(() => {
    if (searchParams.get('consult') !== 'open') return
    router.replace(pathname, { scroll: false })
    void handleAutoOpen()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset scroll tracking when switching sessions (new chat / restored chat)
  useEffect(() => {
    prevMsgCountRef.current = 0
  }, [sessionId])

  // Auto-scroll only when new messages arrive AND the visitor is near the
  // bottom already — otherwise sending/receiving a message would yank
  // someone reviewing earlier history back down to the latest message
  useEffect(() => {
    const newCount = messages.length
    const prevCount = prevMsgCountRef.current
    prevMsgCountRef.current = newCount

    if (newCount === 0) return

    const el = messagesContainerRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150

    // Scroll the panel's own body only — never scrollIntoView(), which walks
    // up every scrollable ancestor and can misalign the target within them
    if (prevCount === 0) {
      el.scrollTop = el.scrollHeight
    } else if (newCount > prevCount && isNearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
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

  // Poll for an unread reply while the panel is closed — read-only, does not
  // mark the conversation as read (only actually opening it does that)
  useEffect(() => {
    if (!sessionId || !visitorToken || open) return

    let cancelled = false
    async function checkUnread() {
      try {
        const res = await fetch(
          `/directory/api/chat/${clinicSlug}/session/${sessionId}/unread?visitorToken=${encodeURIComponent(visitorToken!)}`,
        )
        if (!res.ok || cancelled) return
        const data: { unread: number } = await res.json()
        setUnreadCount(data.unread)
      } catch {
        // silently ignore
      }
    }

    checkUnread()
    const id = setInterval(checkUnread, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [clinicSlug, sessionId, visitorToken, open])

  // Opening the panel loads full history, which marks the conversation as
  // read server-side — clear the badge optimistically right away
  useEffect(() => {
    if (open) setUnreadCount(0)
  }, [open])

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

  async function fetchAndSetPatient(): Promise<PatientMe | null> {
    try {
      const res = await fetch('/directory/api/patient/me')
      if (!res.ok) return null
      const data: PatientMe = await res.json()
      setPatientMe(data)
      return data
    } catch {
      return null
    }
  }

  async function handleOpen() {
    setOpen(true)
    trackCtaClick({ ctaLabel: 'Request Consultation', pageType })

    if (sessionId && visitorToken) {
      setPhase('chat')
      await loadHistory(sessionId, visitorToken)
      return
    }

    const patient = await fetchAndSetPatient()
    if (!patient) {
      setPhase('login_required')
      return
    }

    await checkOnlineStatus()
  }

  // Separate path for auto-open (no tracking — already fired when user clicked)
  async function handleAutoOpen() {
    setOpen(true)

    if (sessionId && visitorToken) {
      setPhase('chat')
      await loadHistory(sessionId, visitorToken)
      return
    }

    const patient = await fetchAndSetPatient()
    if (!patient) {
      setPhase('login_required')
      return
    }

    await checkOnlineStatus()
  }

  async function handleStartChat(data: ConsultationFormData) {
    setStartingChat(true)
    try {
      const patientName = `${data.firstName} ${data.lastName}`.trim()
      const initialMessage = "Hi, I'd like to enquire about a consultation."

      const res = await fetch(`/directory/api/chat/${clinicSlug}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientEmail: data.email,
          patientPhone: data.phone,
          initialMessage,
        }),
      })
      if (!res.ok) throw new Error()
      const result: { sessionId: number; visitorToken: string; message: Message | null } = await res.json()

      setSessionId(result.sessionId)
      setVisitorToken(result.visitorToken)
      setChatFormData(data)
      setIsRestored(false)
      writeStoredSession(clinicSlug, result.sessionId, result.visitorToken)

      setPhase('chat')
      // The session endpoint already stored this message — reflect it locally instead of
      // re-sending it, which would create a duplicate in the clinic's inbox.
      if (result.message) {
        setMessages([result.message])
        lastCreatedAt.current = result.message.createdAt
      } else {
        await sendMessage(result.sessionId, result.visitorToken, initialMessage)
      }
    } catch {
      toast.error('Could not start chat. Please try again.')
    } finally {
      setStartingChat(false)
    }
  }

  async function handleOfflineSubmit(data: ConsultationFormData) {
    setOfflineSubmitting(true)
    try {
      const res = await fetch('/directory/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicSlug,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error((err as { error?: string }).error ?? 'Something went wrong, please try again.')
        return
      }
      setOfflineSent(true)
    } catch {
      toast.error('Something went wrong, please try again.')
    } finally {
      setOfflineSubmitting(false)
    }
  }

  async function sendMessage(sid: number, token: string, content: string) {
    const res = await fetch(`/directory/api/chat/${clinicSlug}/session/${sid}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, visitorToken: token }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { error?: string }).error ?? 'Failed to send message.')
    }
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message.')
      setDraft(content)
    } finally {
      setSending(false)
    }
  }

  function handleClose() {
    setOpen(false)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  async function handleNewSession() {
    clearStoredSession(clinicSlug)
    setSessionId(null)
    setVisitorToken(null)
    setUnreadCount(0)
    setMessages([])
    setChatFormData(null)
    setOfflineSent(false)
    setIsRestored(false)
    lastCreatedAt.current = null
    if (pollRef.current) clearInterval(pollRef.current)

    const patient = await fetchAndSetPatient()
    if (!patient) { setPhase('login_required'); return }
    await checkOnlineStatus()
  }

  const hasActiveSession = sessionId !== null

  // Prefill defaults from the fetched patient session
  const formDefaults = patientMe ? {
    firstName: patientMe.firstName ?? '',
    lastName: patientMe.lastName ?? '',
    email: patientMe.email ?? '',
    phone: patientMe.phone ?? '',
    dateOfBirth: patientMe.dateOfBirth ?? '',
  } : undefined

  // For CallBookingForm — use captured form data, fall back to session
  const bookingPrefill = {
    firstName: chatFormData?.firstName ?? patientMe?.firstName ?? '',
    lastName: chatFormData?.lastName ?? patientMe?.lastName ?? '',
    email: chatFormData?.email ?? patientMe?.email ?? '',
    phone: chatFormData?.phone ?? patientMe?.phone ?? '',
  }

  const consultationNext = `${pathname}?consult=open`

  return (
    <>
      {/* Trigger button */}
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
          unreadCount > 0 ? (
            <span
              className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-medium text-white border-2 border-white"
              aria-label={`${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
          )
        )}
      </div>

      {/* Floating chat panel */}
      <div
        className={cn(
          'fixed z-50 flex flex-col bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden',
          'bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96',
          'transition-all duration-300 ease-in-out',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
        )}
        style={{ height: 'min(600px, calc(100dvh - 5rem))' }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="shrink-0 flex flex-row items-center justify-between px-4 py-3 border-b bg-white">
          <div className="min-w-0 flex-1 flex items-center gap-2.5">
            {clinicImage && (
              <img
                src={clinicImage}
                alt={clinicName}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{clinicName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {phase === 'chat' && !isRestored && (
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Online now
                  </span>
                )}
                {phase === 'chat' && isRestored && (
                  <span className="text-xs text-gray-600">Previous conversation</span>
                )}
                {phase === 'offline' && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="h-2 w-2 rounded-full bg-gray-400" />
                    Currently offline
                  </span>
                )}
                {phase === 'chat' && (
                  <button
                    onClick={handleNewSession}
                    className="flex items-center gap-1 text-[11px] text-gray-600 hover:text-gray-700 transition-colors"
                    title="Start a new conversation"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    New chat
                  </button>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="ml-2 shrink-0 rounded-lg p-1 text-gray-600 hover:text-gray-600 transition-colors"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto min-h-0">
          {(checking || loadingHistory) && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
            </div>
          )}

          {/* Login required */}
          {!checking && !loadingHistory && phase === 'login_required' && (
            <InlineLogin next={consultationNext} />
          )}

          {/* Offline — rich lead capture form */}
          {!checking && !loadingHistory && phase === 'offline' && (
            offlineSent ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <p className="text-2xl">✓</p>
                <p className="font-semibold">Request sent!</p>
                <p className="text-sm text-gray-600">The clinic will be in touch shortly.</p>
              </div>
            ) : (
              <ConsultationRichForm
                key={patientMe?.email ?? 'offline'}
                defaultValues={formDefaults}
                clinicName={clinicName}
                description="The clinic is currently offline. Leave your details and they'll get back to you."
                submitLabel="Send request"
                submitting={offlineSubmitting}
                onSubmit={handleOfflineSubmit}
              />
            )
          )}

          {/* Intro — collect details before starting chat */}
          {!checking && !loadingHistory && phase === 'intro' && (
            <ConsultationRichForm
              key={patientMe?.email ?? 'intro'}
              defaultValues={formDefaults}
              clinicName={clinicName}
              description={
                <>
                  This clinic is <span className="font-semibold text-green-600">online</span> right
                  now. Enter your details to start chatting.
                </>
              }
              submitLabel="Start Chat"
              submitting={startingChat}
              onSubmit={handleStartChat}
            />
          )}

          {/* Chat messages */}
          {!checking && !loadingHistory && phase === 'chat' && (
            <div className="flex flex-col gap-2 px-4 py-3">
              {messages.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">
                  Conversation started — say hello!
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn('flex w-full flex-col gap-0.5', msg.sender === 'patient' ? 'items-end' : 'items-start')}
                >
                  <span className="text-[10px] text-gray-600 px-1">
                    {msg.sender === 'patient' ? 'You' : clinicName}
                  </span>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg px-3.5 py-2 text-sm',
                      msg.sender === 'patient'
                        ? 'bg-black text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm',
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toolbar */}
        {phase === 'chat' && !loadingHistory && (
          <div className="shrink-0 border-t bg-white">
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="relative flex-1">
                <Input
                  className={cn('h-9 text-sm', draft.length > CHAT_MESSAGE_MAX_LENGTH - 200 && 'pr-12')}
                  placeholder="Type a message…"
                  value={draft}
                  maxLength={CHAT_MESSAGE_MAX_LENGTH}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  autoFocus={open && phase === 'chat'}
                />
                {draft.length > CHAT_MESSAGE_MAX_LENGTH - 200 && (
                  <span
                    className={cn(
                      'pointer-events-none absolute right-1 bottom-1 text-[10px]',
                      draft.length >= CHAT_MESSAGE_MAX_LENGTH ? 'text-red-500' : 'text-gray-400',
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
                <Video className="h-4 w-4 text-gray-600" />
                Book a Video Call
              </DialogTitle>
            </DialogHeader>
            <CallBookingForm
              clinicSlug={clinicSlug}
              prefillFirstName={bookingPrefill.firstName}
              prefillLastName={bookingPrefill.lastName}
              prefillEmail={bookingPrefill.email}
              prefillPhone={bookingPrefill.phone}
              compact
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
