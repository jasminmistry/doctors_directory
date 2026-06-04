"use client"

import { FormEvent, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { trackCtaClick } from "@/lib/tracking/client"
import type { DirectoryPageType } from "@/lib/tracking/types"
import { format, addDays, isSameDay, parseISO } from "date-fns"
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  Loader2,
  Video,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────

interface CoreEvent {
  id: number
  title: string
  slug: string
  duration: string
  description: string | null
  location: "zoom" | "video_call"
  price: string | null
  practitioner: { id: number; name: string }
}

interface AvailableSlot {
  time: string
  time_12h: string
  datetime: string
  practitioner_id: number
  practitioner: string
}

interface AvailabilityResponse {
  available: AvailableSlot[]
  date: string
  timezone: string
  slot_duration: number
  event_id: number
}

interface BookingConfirmation {
  id: number
  status: string
  slot_start: string
  slot_end: string
  event: { id: number; title: string; slug: string; price: string | null }
  practitioner: { id: number; name: string }
  patient: { id: number; name: string; email: string }
  video_call: { type: string; join_url: string; start_url: string } | null
}

type DialogStep = "pick-event" | "date-slot" | "details" | "confirmation" | "lead-form"

// ── Helpers ──────────────────────────────────────────────────────────────────

const WEEK_SIZE = 7

function dateKey(d: Date) {
  return format(d, "yyyy-MM-dd")
}

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "Europe/London"
  }
}

// ── Props ────────────────────────────────────────────────────────────────────

interface RequestConsultationDialogProps {
  pageType: Extract<DirectoryPageType, "practitioner_page" | "clinic_page" | "collection_page">
  clinicSlug?: string
  treatment?: string
  location?: string
  consultationHref?: string | null
  buttonClassName?: string
  /** Practitioner slug — uses /api/events/[practitionerSlug]/ routes */
  practitionerSlug?: string
  /** Clinic slug — uses /api/events/clinic/[clinicSlug]/ routes */
  entityClinicSlug?: string
}

// ── Component ────────────────────────────────────────────────────────────────

export function RequestConsultationDialog({
  pageType,
  clinicSlug,
  treatment,
  location,
  consultationHref,
  buttonClassName,
  practitionerSlug,
  entityClinicSlug,
}: Readonly<RequestConsultationDialogProps>) {
  // Base path for all events API calls
  const eventsApiBase = practitionerSlug
    ? `/directory/api/events/${practitionerSlug}`
    : entityClinicSlug
    ? `/directory/api/events/clinic/${entityClinicSlug}`
    : null
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<DialogStep>("lead-form")

  // Lead form
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [leadTreatment, setLeadTreatment] = useState(treatment ?? "")
  const [leadLocation, setLeadLocation] = useState(location ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Events
  const [eventsLoading, setEventsLoading] = useState(false)
  const [events, setEvents] = useState<CoreEvent[] | null>(null)

  // Date / slot
  const [selectedEvent, setSelectedEvent] = useState<CoreEvent | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [slotDuration, setSlotDuration] = useState(30)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)

  // Patient details (event booking)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekStart = addDays(today, weekOffset * WEEK_SIZE)
  const weekDays = Array.from({ length: WEEK_SIZE }, (_, i) => addDays(weekStart, i))

  const isLeadDisabled = useMemo(
    () => !name.trim() || !contact.trim() || isSubmitting,
    [name, contact, isSubmitting],
  )

  // ── Open / close ─────────────────────────────────────────────────────────

  const handleOpen = async (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) return

    trackCtaClick({
      ctaLabel: "Request Consultation",
      ctaTargetUrl: consultationHref ?? undefined,
      pageType,
    })

    // Reset booking state
    setSelectedEvent(null)
    setSelectedDate(null)
    setSlots([])
    setSelectedSlot(null)
    setConfirmation(null)
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setBookingError(null)
    setWeekOffset(0)

    if (!eventsApiBase) {
      setStep("lead-form")
      return
    }

    setEventsLoading(true)
    setStep("lead-form") // shown while loading

    try {
      const r = await fetch(eventsApiBase)
      const d = await r.json()
      const evts: CoreEvent[] = d.events ?? []
      setEvents(evts)
      setStep(evts.length > 0 ? "pick-event" : "lead-form")
    } catch {
      setEvents([])
      setStep("lead-form")
    } finally {
      setEventsLoading(false)
    }
  }

  // ── Fetch slots ───────────────────────────────────────────────────────────

  async function fetchSlots(date: Date, event: CoreEvent) {
    if (!eventsApiBase) return
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    const tz = detectTimezone()
    const qs = new URLSearchParams({
      eventId: String(event.id),
      date: dateKey(date),
      timezone: tz,
    })
    try {
      const r = await fetch(`${eventsApiBase}/availability?${qs}`)
      const d: AvailabilityResponse = await r.json()
      setSlots(d.available ?? [])
      setSlotDuration(d.slot_duration ?? 30)
    } catch {
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    if (selectedEvent) fetchSlots(date, selectedEvent)
  }

  // ── Event booking submit ──────────────────────────────────────────────────

  async function handleBook() {
    if (!selectedSlot || !selectedEvent || !eventsApiBase) return
    setBookingSubmitting(true)
    setBookingError(null)
    try {
      // Core returns datetime in UTC; append Z to produce a valid UTC ISO-8601 string
      const slotStart = selectedSlot.datetime.replace(" ", "T") + "Z"
      const slotEnd = new Date(new Date(slotStart).getTime() + slotDuration * 60 * 1000).toISOString()

      const payload = {
        event_id: selectedEvent.id,
        practitioner_id: selectedSlot.practitioner_id,
        slot_start: slotStart,
        slot_end: slotEnd,
        patient_first_name: firstName.trim(),
        patient_last_name: lastName.trim(),
        patient_email: email.trim(),
        ...(phone.trim() ? { patient_phone: phone.trim() } : {}),
      }

      if (selectedEvent.price) {
        const res = await fetch(`${eventsApiBase}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            event_title: selectedEvent.title,
            event_price: selectedEvent.price,
            cancel_url: window.location.href,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setBookingError(data.error ?? "Failed to start payment — please try again")
          return
        }
        window.location.href = (data as { url: string }).url
        return
      }

      const res = await fetch(`${eventsApiBase}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setBookingError(
          res.status === 409
            ? "This slot was just taken, please select another time"
            : (data.error ?? "Booking failed — please try again"),
        )
        return
      }
      setConfirmation((data as { booking: BookingConfirmation }).booking)
      setStep("confirmation")
    } catch {
      setBookingError("Booking failed — please try again")
    } finally {
      setBookingSubmitting(false)
    }
  }

  // ── Lead form submit ──────────────────────────────────────────────────────

  const handleLeadSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLeadDisabled) return
    setIsSubmitting(true)
    try {
      if (clinicSlug) {
        const res = await fetch("/directory/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinicSlug,
            patientName: name.trim(),
            contact: contact.trim(),
            treatment: leadTreatment.trim() || undefined,
            location: leadLocation.trim() || undefined,
          }),
        })
        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error ?? "Something went wrong, please try again.")
          return
        }
      }
      await trackCtaClick({
        ctaLabel: "Request Consultation Form Submit",
        ctaTargetUrl: consultationHref ?? undefined,
        pageType,
      })
      toast.success("Thanks! Your request has been sent to the clinic.")
      setOpen(false)
      setName("")
      setContact("")
    } catch {
      toast.error("Something went wrong, please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function startEventBooking(event: CoreEvent) {
    setSelectedEvent(event)
    setSelectedDate(null)
    setSlots([])
    setSelectedSlot(null)
    setWeekOffset(0)
    setBookingError(null)
    setStep("date-slot")
  }

  // ── Dialog title ──────────────────────────────────────────────────────────

  const dialogTitle =
    step === "pick-event" ? "Book a Consultation" :
    step === "date-slot" ? (selectedEvent?.title ?? "Choose a Date & Time") :
    step === "details" ? "Your Details" :
    step === "confirmation" ? "Booking Confirmed" :
    "Request Consultation"

  const dialogDescription =
    step === "pick-event" ? "Choose a consultation type to get started." :
    step === "date-slot" ? `${selectedEvent?.duration ?? ""}${selectedEvent?.price ? ` · £${selectedEvent.price}` : ""}` :
    step === "lead-form" ? "Share your details and the clinic will be in touch." :
    ""

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <Button
        type="button"
        onClick={() => handleOpen(true)}
        className={buttonClassName}
        data-no-auto-track="true"
      >
        Request Consultation
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogDescription && (
            <DialogDescription>{dialogDescription}</DialogDescription>
          )}
        </DialogHeader>

        {/* Loading events */}
        {eventsLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}

        {/* pick-event */}
        {!eventsLoading && step === "pick-event" && events && events.length > 0 && (
          <div className="space-y-3">
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {events.map((event) => (
                <div key={event.id} className="px-4 py-3 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{event.title}</span>
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        event.location === "zoom"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700",
                      )}>
                        <Video className="h-3 w-3" />
                        {event.location === "zoom" ? "Zoom" : "Video Call"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3 shrink-0" />
                      <span>{event.duration}</span>
                      {event.price && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="font-medium text-gray-700">£{event.price}</span>
                        </>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startEventBooking(event)}
                    className="shrink-0 rounded-lg border border-gray-900 px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
                  >
                    Book
                  </button>
                </div>
              ))}
            </div>
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setStep("lead-form")}
                className="text-xs text-gray-400 underline hover:text-gray-600"
              >
                Just request a callback instead
              </button>
            </div>
          </div>
        )}

        {/* date-slot */}
        {!eventsLoading && step === "date-slot" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setStep("pick-event")}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back to events
            </button>

            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="font-medium text-gray-900">1. Date &amp; Time</span>
              <span>›</span>
              <span>2. Your Details</span>
            </div>

            {/* Week navigator */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setWeekOffset((o) => Math.max(0, o - 1))}
                disabled={weekOffset === 0}
                className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-500">
                {format(weekStart, "d MMM")} – {format(weekDays[6], "d MMM")}
              </span>
              <button
                type="button"
                onClick={() => setWeekOffset((o) => o + 1)}
                className="rounded p-1 text-gray-400 hover:text-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day picker */}
            <div className="grid grid-cols-7 gap-0.5">
              {weekDays.map((day) => {
                const isPast = day < today
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={isPast}
                    onClick={() => handleDateSelect(day)}
                    className={cn(
                      "flex flex-col items-center rounded-lg py-1.5 text-[10px] leading-tight transition-colors",
                      isPast && "opacity-30 cursor-not-allowed",
                      isSelected
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-100",
                    )}
                  >
                    <span>{format(day, "EEE")[0]}</span>
                    <span className="font-semibold text-xs">{format(day, "d")}</span>
                  </button>
                )
              })}
            </div>

            {/* Slots */}
            {selectedDate && (
              slotsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-3">No slots available on this date</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {slots.map((slot, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedSlot((s) =>
                        s?.datetime === slot.datetime ? null : slot,
                      )}
                      className={cn(
                        "rounded-lg border px-2 py-2 text-xs transition-colors text-center",
                        selectedSlot?.datetime === slot.datetime
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 text-gray-700 hover:border-gray-400",
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )
            )}

            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep("details")}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Next — Your Details
            </button>
          </div>
        )}

        {/* details */}
        {!eventsLoading && step === "details" && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => { setStep("date-slot"); setBookingError(null) }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {selectedEvent && selectedDate && selectedSlot
                ? `${selectedEvent.title} · ${format(selectedDate, "d MMM")} at ${selectedSlot.time}`
                : "Back"}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
            </div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
            />

            {selectedEvent?.price && (
              <div className="rounded-lg bg-gray-50 border border-gray-100 px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">Amount due</span>
                <span className="text-sm font-bold text-gray-900">£{selectedEvent.price}</span>
              </div>
            )}

            {bookingError && <p className="text-xs text-red-600">{bookingError}</p>}

            <button
              type="button"
              disabled={!firstName.trim() || !lastName.trim() || !email.trim() || bookingSubmitting}
              onClick={handleBook}
              className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              {bookingSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {selectedEvent?.price ? "Redirecting to payment…" : "Booking…"}
                </>
              ) : selectedEvent?.price ? (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay £{selectedEvent.price}
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </button>

            {selectedEvent?.price && !bookingSubmitting && (
              <p className="text-center text-[10px] text-gray-400">
                You&apos;ll be redirected to Stripe to complete payment securely
              </p>
            )}
          </div>
        )}

        {/* confirmation */}
        {!eventsLoading && step === "confirmation" && confirmation && (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <CheckCircle2 className="h-10 w-10 text-green-500 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-gray-900">{confirmation.event.title}</p>
              <p className="text-sm text-gray-600">
                {format(parseISO(confirmation.slot_start), "EEE d MMM 'at' HH:mm")} with{" "}
                <span className="font-medium">{confirmation.practitioner.name}</span>
              </p>
            </div>
            {confirmation.video_call?.join_url && (
              <a
                href={confirmation.video_call.join_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <Video className="h-4 w-4" />
                Join Meeting
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            )}
            <p className="text-xs text-gray-500">
              A confirmation email has been sent to{" "}
              <span className="font-medium">{confirmation.patient.email}</span>
            </p>
          </div>
        )}

        {/* lead-form */}
        {!eventsLoading && step === "lead-form" && (
          <form className="space-y-3" onSubmit={handleLeadSubmit}>
            {events && events.length > 0 && (
              <button
                type="button"
                onClick={() => setStep("pick-event")}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back to events
              </button>
            )}
            <Input
              required
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              required
              placeholder="Email or phone number"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <Input
              placeholder="Treatment (optional)"
              value={leadTreatment}
              onChange={(e) => setLeadTreatment(e.target.value)}
            />
            <Input
              placeholder="Your location (optional)"
              value={leadLocation}
              onChange={(e) => setLeadLocation(e.target.value)}
            />
            <Button disabled={isLeadDisabled} type="submit" className="w-full">
              {isSubmitting ? "Sending..." : "Send request"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
