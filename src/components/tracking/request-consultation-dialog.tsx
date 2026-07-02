"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InlineLogin } from "@/components/consultation/inline-login"
import { ConsultationRichForm } from "@/components/consultation/consultation-form"
import type { ConsultationFormData } from "@/components/consultation/consultation-form"
import { trackCtaClick } from "@/lib/tracking/client"
import type { DirectoryPageType } from "@/lib/tracking/types"

interface RequestConsultationDialogProps {
  pageType: Extract<DirectoryPageType, "practitioner_page" | "clinic_page" | "collection_page">
  clinicSlug?: string
  treatments?: string[]
  location?: string
  consultationHref?: string | null
  buttonClassName?: string
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
  treatments,
  location,
  consultationHref,
  buttonClassName,
}: Readonly<RequestConsultationDialogProps>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<Phase>('login')
  const [patientMe, setPatientMe] = useState<PatientMe | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const consultationNext = `${pathname}?consult=open`

  // Auto-open when returning from magic link / OAuth with ?consult=open
  useEffect(() => {
    if (searchParams.get('consult') !== 'open') return
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

  async function openDialog() {
    const patient = await fetchAndSetPatient()
    setPhase(patient ? 'form' : 'login')
    setOpen(true)
  }

  const handleButtonClick = async () => {
    trackCtaClick({
      ctaLabel: "Request a callback",
      ctaTargetUrl: consultationHref ?? undefined,
      pageType,
    })
    await openDialog()
  }

  const handleClose = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setPatientMe(null)
      setPhase('login')
    }
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
            treatment: data.treatment || undefined,
            dateOfBirth: data.dateOfBirth,
            location: location ?? undefined,
          }),
        })
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          toast.error((errData as { error?: string }).error ?? "Something went wrong, please try again.")
          return
        }
      }
      await trackCtaClick({
        ctaLabel: "Request Callback Form Submit",
        ctaTargetUrl: consultationHref ?? undefined,
        pageType,
      })
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
    treatment: treatments?.[0] ?? '',
  } : undefined

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <Button
        type="button"
        onClick={handleButtonClick}
        className={buttonClassName}
        data-no-auto-track="true"
      >
        Request a callback
      </Button>

      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle>Request a callback</DialogTitle>
        </DialogHeader>

        {phase === 'login' && (
          <InlineLogin next={consultationNext} />
        )}

        {phase === 'form' && (
          <ConsultationRichForm
            key={patientMe?.email ?? 'form'}
            defaultValues={formDefaults}
            treatments={treatments}
            submitLabel="Send request"
            submitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}

        {phase === 'submitted' && (
          <div className="px-6 py-8 text-center space-y-2">
            <p className="text-2xl">✓</p>
            <p className="font-semibold">Request sent!</p>
            <p className="text-sm text-gray-500">
              The clinic will contact you at <strong>{patientMe?.email}</strong>.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
