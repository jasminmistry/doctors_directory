"use client"

import { FormEvent, useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { submitLead, trackCtaClick } from "@/lib/tracking/client"
import type { DirectoryPageType } from "@/lib/tracking/types"

interface RequestConsultationDialogProps {
  pageType: Extract<DirectoryPageType, "practitioner_page" | "clinic_page" | "collection_page">
  treatment?: string
  location?: string
  consultationHref?: string | null
  buttonClassName?: string
}

export function RequestConsultationDialog({
  pageType,
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
  const [budget, setBudget] = useState("")
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
    const success = await submitLead({
      name,
      contact,
      treatment: leadTreatment,
      location: leadLocation,
      budget,
      pageType,
    })
    setIsSubmitting(false)

    if (!success) {
      toast.error("Could not save your details. Please try again.")
      return
    }

    toast.success("Thanks! Your consultation request is submitted.")
    setOpen(false)

    if (consultationHref) {
      window.open(consultationHref, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <Button
        type="button"
        onClick={() => handleOpen(true)}
        className={buttonClassName}
      >
        Request Consultation
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Consultation</DialogTitle>
          <DialogDescription>Share your details and we will route your request.</DialogDescription>
        </DialogHeader>

        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            required
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            required
            placeholder="Email or phone"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
          />
          <Input
            placeholder="Treatment"
            value={leadTreatment}
            onChange={(event) => setLeadTreatment(event.target.value)}
          />
          <Input
            placeholder="Location"
            value={leadLocation}
            onChange={(event) => setLeadLocation(event.target.value)}
          />
          <Input
            placeholder="Budget (optional)"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          />
          <Button disabled={isDisabled} type="submit" className="w-full">
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
