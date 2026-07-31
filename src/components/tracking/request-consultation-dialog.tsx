"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { toast } from "sonner"
import type { VariantProps } from "class-variance-authority"
import { Button, buttonVariants } from "@/components/ui/button"
import { InlineLogin } from "@/components/consultation/inline-login"
import { ConsultationRichForm } from "@/components/consultation/consultation-form"
import type { ConsultationFormData } from "@/components/consultation/consultation-form"
import { cn } from "@/lib/utils"
import { trackCtaClick } from "@/lib/tracking/client"
import type { DirectoryPageType } from "@/lib/tracking/types"
import { useExclusiveFloatingPanel } from "@/lib/floating-panel-bus"

interface RequestConsultationDialogProps {
  pageType: Extract<DirectoryPageType, "practitioner_page" | "clinic_page" | "collection_page">
  clinicSlug?: string
  entityName?: string
  entityImage?: string
  location?: string
  consultationHref?: string | null
  buttonClassName?: string
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"]
  triggerLabel?: string
  dialogTitle?: string
  submitLabel?: string
  /** Sent to the leads API when the patient leaves the treatment field blank. */
  treatmentFallback?: string
  /** Query param used to auto-reopen this panel after magic link / OAuth. Must be unique per instance on a page. */
  openParam?: string
  /** Tags the lead so the clinic can tell a pricing enquiry apart from a general callback request. */
  leadSource?: "consultation" | "pricing"
}

interface PatientMe {
  id: number
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
}

type Phase = 'login' | 'form' | 'submitted'

export function RequestConsultationDialog({
  pageType,
  clinicSlug,
  entityName,
  entityImage,
  location,
  consultationHref,
  buttonClassName,
  buttonVariant,
  triggerLabel = "Request a callback",
  dialogTitle = "Request a callback",
  submitLabel = "Send request",
  treatmentFallback,
  openParam = "consult",
  leadSource = "consultation",
}: Readonly<RequestConsultationDialogProps>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('login')
  const [patientMe, setPatientMe] = useState<PatientMe | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  useExclusiveFloatingPanel(`${openParam}:${clinicSlug ?? ''}`, open, setOpen)

  const consultationNext = `${pathname}?${openParam}=open`

  // Auto-open when returning from magic link / OAuth with ?{openParam}=open
  useEffect(() => {
    if (searchParams.get(openParam) !== 'open') return
    router.replace(pathname, { scroll: false })
    void openDialog()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  async function checkExistingRequest(): Promise<boolean> {
    if (!clinicSlug) return false
    try {
      const res = await fetch(
        `/directory/api/leads?clinicSlug=${encodeURIComponent(clinicSlug)}&source=${leadSource}`
      )
      if (!res.ok) return false
      const data: { exists: boolean; email?: string | null } = await res.json()
      if (data.exists) {
        setSubmittedEmail(data.email ?? null)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  async function openDialog() {
    const patient = await fetchAndSetPatient()
    if (!patient) {
      setPhase('login')
      setOpen(true)
      return
    }
    const alreadySubmitted = await checkExistingRequest()
    setPhase(alreadySubmitted ? 'submitted' : 'form')
    setOpen(true)
  }

  const handleButtonClick = async () => {
    trackCtaClick({
      ctaLabel: triggerLabel,
      ctaTargetUrl: consultationHref ?? undefined,
      pageType,
    })
    await openDialog()
  }

  const handleClose = () => {
    setOpen(false)
    setPatientMe(null)
    setPhase('login')
    setSubmittedEmail(null)
  }

  const handleSubmit = async (data: ConsultationFormData) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      if (clinicSlug) {
        const res = await fetch("/directory/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinicSlug,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            treatment: treatmentFallback || undefined,
            dateOfBirth: data.dateOfBirth,
            location: location ?? undefined,
            source: leadSource,
          }),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          toast.error((errData as { error?: string }).error ?? "Something went wrong, please try again.")
          return
        }
      }
      await trackCtaClick({
        ctaLabel: `${triggerLabel} Form Submit`,
        ctaTargetUrl: consultationHref ?? undefined,
        pageType,
      })
      setSubmittedEmail(data.email)
      setPhase('submitted')
    } catch {
      toast.error("Something went wrong, please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formDefaults = patientMe ? {
    firstName: patientMe.firstName ?? '',
    lastName: patientMe.lastName ?? '',
    email: patientMe.email ?? '',
    phone: patientMe.phone ?? '',
    dateOfBirth: patientMe.dateOfBirth ?? '',
  } : undefined

  return (
    <>
      {/* Trigger button */}
      <Button
        type="button"
        variant={buttonVariant}
        onClick={handleButtonClick}
        className={cn('w-full', buttonClassName)}
        data-no-auto-track="true"
      >
        {triggerLabel}
      </Button>

      {/* Floating side panel */}
      <div
        className={cn(
          'fixed z-50 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden',
          'bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96',
          'transition-all duration-300 ease-in-out',
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none',
        )}
        style={{ maxHeight: 'min(600px, calc(100dvh - 5rem))' }}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="shrink-0 flex flex-row items-center justify-between px-4 py-3 border-b bg-white">
          <div className="min-w-0 flex-1 flex items-center gap-2.5">
            {entityImage && (
              <img
                src={entityImage}
                alt={entityName ?? ''}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{dialogTitle}</p>
              {entityName && (
                <p className="text-xs text-gray-500 truncate">{entityName}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="ml-2 shrink-0 rounded-lg p-1 text-gray-500 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {phase === 'login' && (
            <InlineLogin next={consultationNext} />
          )}

          {phase === 'form' && (
            <ConsultationRichForm
              key={patientMe?.email ?? 'form'}
              defaultValues={formDefaults}
              clinicName={entityName ?? ''}
              submitLabel={submitLabel}
              submitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}

          {phase === 'submitted' && (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-8 text-center">
              <p className="text-2xl">✓</p>
              <p className="font-semibold">Request sent!</p>
              <p className="text-sm text-gray-500">
                The clinic will contact you at <strong>{submittedEmail ?? patientMe?.email}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
