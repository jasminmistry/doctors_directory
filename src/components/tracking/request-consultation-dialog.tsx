"use client"

import { FormEvent, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
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

interface RequestConsultationDialogProps {
  pageType: Extract<DirectoryPageType, "practitioner_page" | "clinic_page" | "collection_page">
  clinicSlug?: string
  treatment?: string
  location?: string
  consultationHref?: string | null
  buttonClassName?: string
}

interface PatientProfile {
  id: number
  email: string
  firstName?: string
  lastName?: string
}

export function RequestConsultationDialog({
  pageType,
  clinicSlug,
  treatment,
  location,
  consultationHref,
  buttonClassName,
}: Readonly<RequestConsultationDialogProps>) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [patient, setPatient] = useState<PatientProfile | null>(null)
  const [leadTreatment, setLeadTreatment] = useState(treatment ?? "")
  const [leadLocation, setLeadLocation] = useState(location ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const patientName = patient
    ? [patient.firstName, patient.lastName].filter(Boolean).join(" ") || patient.email
    : ""

  const isDisabled = useMemo(() => !patient || isSubmitting, [patient, isSubmitting])

  const handleButtonClick = async () => {
    trackCtaClick({
      ctaLabel: "Request a callback",
      ctaTargetUrl: consultationHref ?? undefined,
      pageType,
    })

    const res = await fetch("/directory/api/patient/me")
    if (!res.ok) {
      router.push(`/directory/account/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    const data = await res.json() as PatientProfile
    setPatient(data)
    setOpen(true)
  }

  const handleClose = (next: boolean) => {
    setOpen(next)
    if (!next) setPatient(null)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isDisabled || !patient) return
    setIsSubmitting(true)
    try {
      if (clinicSlug) {
        const res = await fetch("/directory/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clinicSlug,
            patientName,
            contact: patient.email,
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
        ctaLabel: "Request Callback Form Submit",
        ctaTargetUrl: consultationHref ?? undefined,
        pageType,
      })
      toast.success("Thanks! Your request has been sent to the clinic.")
      setOpen(false)
      setPatient(null)
    } catch {
      toast.error("Something went wrong, please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a callback</DialogTitle>
          <DialogDescription>
            The clinic will contact you at <strong>{patient?.email}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
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
          <Button disabled={isDisabled} type="submit" className="w-full">
            {isSubmitting ? "Sending..." : "Send request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
