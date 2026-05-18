"use client"

import { FormEvent, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

export function RequestConsultationDialog({
  pageType,
  clinicSlug,
  treatment,
  location,
  consultationHref,
  buttonClassName,
}: Readonly<RequestConsultationDialogProps>) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [leadTreatment, setLeadTreatment] = useState(treatment ?? "")
  const [leadLocation, setLeadLocation] = useState(location ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDisabled = useMemo(
    () => !name.trim() || !contact.trim() || isSubmitting,
    [name, contact, isSubmitting]
  )

  const handleOpen = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (nextOpen) {
      trackCtaClick({
        ctaLabel: "Request Consultation",
        ctaTargetUrl: consultationHref ?? undefined,
        pageType,
      })
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDisabled) return

    setIsSubmitting(true)

    try {
      if (clinicSlug) {
        const res = await fetch('/directory/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
          toast.error(data.error ?? 'Something went wrong, please try again.')
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
          <DialogTitle>Request Consultation</DialogTitle>
          <DialogDescription>Share your details and the clinic will be in touch.</DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            required
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            required
            placeholder="Email or phone number"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
          />
          <Input
            placeholder="Treatment (optional)"
            value={leadTreatment}
            onChange={(event) => setLeadTreatment(event.target.value)}
          />
          <Input
            placeholder="Your location (optional)"
            value={leadLocation}
            onChange={(event) => setLeadLocation(event.target.value)}
          />
          <Button disabled={isDisabled} type="submit" className="w-full">
            {isSubmitting ? "Sending..." : "Send request"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
