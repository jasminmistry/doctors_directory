"use client"

import { useState } from "react"
import { HUB_CTA_PRIMARY_CLASS } from "@/components/b2b-hub/hub-cta-buttons"

type Props = {
  templateTitle?: string
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
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const about = templateTitle
      ? `Template download request: ${templateTitle}`
      : "Template download request"

    try {
      const res = await fetch("/directory/api/register/clinic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName,
          contactName,
          email,
          phone,
          address,
          city,
          website: website || undefined,
          category: category || undefined,
          about,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again."
        )
        return
      }
      setSubmitted(true)
    } catch {
      setError("Network error. Please check your connection and try again.")
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Clinic name
        <input
          type="text"
          required
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          placeholder="e.g. The Skin Clinic London"
          className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Your full name
        <input
          type="text"
          required
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          placeholder="Jane Smith"
          autoComplete="name"
          className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Business email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourclinic.co.uk"
          autoComplete="email"
          className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Phone number
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="020 7123 4567"
          autoComplete="tel"
          className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Address
        <input
          type="text"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Harley Street, London"
          className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        City
        <input
          type="text"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="London"
          className="rounded-lg border border-[#e0e0e0] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button type="submit" disabled={loading} className={HUB_CTA_PRIMARY_CLASS}>
        {loading ? "Registering…" : "Register to Download your Template"}
      </button>
    </form>
  )
}
