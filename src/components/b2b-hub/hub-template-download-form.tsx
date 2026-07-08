"use client"

import { useState } from "react"
import { HUB_CTA_PRIMARY_CLASS } from "@/components/b2b-hub/hub-cta-buttons"

type Props = {
  templateTitle?: string
}

type FieldErrors = Record<string, string>

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidUkPhone(value: string): boolean {
  return UK_PHONE_RE.test(value.trim().replace(/\s/g, ""))
}

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function HubTemplateDownloadForm({ templateTitle }: Props) {
  const [clinicName, setClinicName] = useState("")
  const [contactName, setContactName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [website, setWebsite] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function getFieldErrors(): FieldErrors {
    const errors: FieldErrors = {}
    if (clinicName.trim().length < 2) errors.clinicName = "Clinic Name is required."
    if (contactName.trim().length < 2) errors.contactName = "Please enter your full name."
    if (!email.trim()) errors.email = "Business Email is required."
    else if (!isValidEmail(email)) errors.email = "Please enter a valid email address."
    if (!phone.trim()) errors.phone = "Phone Number is required."
    else if (!isValidUkPhone(phone)) errors.phone = "Please enter a valid UK phone number."
    if (address.trim().length < 2) errors.address = "Address is required."
    if (city.trim().length < 2) errors.city = "City is required."
    return errors
  }

  function mapServerErrorToField(message: string): FieldErrors | null {
    const lower = message.toLowerCase()
    if (lower.includes("clinic name")) return { clinicName: message }
    if (lower.includes("full name")) return { contactName: message }
    if (lower.includes("email")) return { email: message }
    if (lower.includes("phone")) return { phone: message }
    if (lower.includes("address")) return { address: message }
    if (lower.includes("city")) return { city: message }
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const errors = getFieldErrors()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    setLoading(true)

    const about = templateTitle
      ? `Template download request: ${templateTitle}`
      : "Template download request"

    try {
      const res = await fetch("/directory/api/register/clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName: clinicName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          website: website.trim() || undefined,
          category: category.trim() || undefined,
          about,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again."
        const mapped = mapServerErrorToField(message)
        if (mapped) {
          setFieldErrors(mapped)
        } else {
          setFormError(message)
        }
        return
      }
      setSubmitted(true)
    } catch {
      setFormError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <p className="rounded-lg bg-[#eef7f2] px-4 py-3 text-sm font-medium text-[#1a6e45]">
        Thank you for registering — we will email your template download shortly.
      </p>
    )
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Clinic name
        <input
          type="text"
          value={clinicName}
          onChange={(e) => { setClinicName(e.target.value); clearFieldError("clinicName") }}
          placeholder="e.g. The Skin Clinic London"
          className={`rounded-lg border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20 ${fieldErrors.clinicName ? "border-red-400" : "border-[#e0e0e0]"}`}
        />
        {fieldErrors.clinicName && <span className="text-xs font-normal text-red-600">{fieldErrors.clinicName}</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Your full name
        <input
          type="text"
          value={contactName}
          onChange={(e) => { setContactName(e.target.value); clearFieldError("contactName") }}
          placeholder="Jane Smith"
          autoComplete="name"
          className={`rounded-lg border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20 ${fieldErrors.contactName ? "border-red-400" : "border-[#e0e0e0]"}`}
        />
        {fieldErrors.contactName && <span className="text-xs font-normal text-red-600">{fieldErrors.contactName}</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Business email
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError("email") }}
          placeholder="you@yourclinic.co.uk"
          autoComplete="email"
          className={`rounded-lg border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20 ${fieldErrors.email ? "border-red-400" : "border-[#e0e0e0]"}`}
        />
        {fieldErrors.email && <span className="text-xs font-normal text-red-600">{fieldErrors.email}</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Phone number
        <input
          type="tel"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); clearFieldError("phone") }}
          placeholder="020 7123 4567"
          autoComplete="tel"
          className={`rounded-lg border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20 ${fieldErrors.phone ? "border-red-400" : "border-[#e0e0e0]"}`}
        />
        {fieldErrors.phone && <span className="text-xs font-normal text-red-600">{fieldErrors.phone}</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Address
        <input
          type="text"
          value={address}
          onChange={(e) => { setAddress(e.target.value); clearFieldError("address") }}
          placeholder="123 Harley Street, London"
          className={`rounded-lg border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20 ${fieldErrors.address ? "border-red-400" : "border-[#e0e0e0]"}`}
        />
        {fieldErrors.address && <span className="text-xs font-normal text-red-600">{fieldErrors.address}</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        City
        <input
          type="text"
          value={city}
          onChange={(e) => { setCity(e.target.value); clearFieldError("city") }}
          placeholder="London"
          className={`rounded-lg border bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20 ${fieldErrors.city ? "border-red-400" : "border-[#e0e0e0]"}`}
        />
        {fieldErrors.city && <span className="text-xs font-normal text-red-600">{fieldErrors.city}</span>}
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Specialty / category <span className="font-normal text-[#6B6B6B]">(optional)</span>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Aesthetics, Dermatology"
          className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Website <span className="font-normal text-[#6B6B6B]">(optional)</span>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://yourclinic.co.uk"
          autoComplete="url"
          className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
      </label>
      {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
      <button type="submit" disabled={loading} className={HUB_CTA_PRIMARY_CLASS}>
        {loading ? "Registering…" : "Register to Download your Template"}
      </button>
    </form>
  )
}
