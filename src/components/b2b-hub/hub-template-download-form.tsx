"use client"

import { useState } from "react"

export function HubTemplateDownloadForm() {
  const [email, setEmail] = useState("")
  const [clinic, setClinic] = useState("")
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <p className="rounded-xl bg-[#eef7f2] px-4 py-3 text-sm font-medium text-[#1a6e45]">
        Thank you — check your inbox for the download link.
      </p>
    )
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Work email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-[#E2DDD7] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-[#111111]">
        Clinic name
        <input
          type="text"
          required
          value={clinic}
          onChange={(e) => setClinic(e.target.value)}
          className="rounded-lg border border-[#E2DDD7] bg-white px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[#1a877a]/20"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-[48px] items-center justify-center rounded-[12px] bg-[#1A1A1A] text-base font-semibold text-white transition-colors hover:bg-neutral-900"
      >
        Send Me The Template
      </button>
    </form>
  )
}
