'use client'

import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { IconCircleCheck, IconShieldCheck, IconUpload } from '@tabler/icons-react'

const PROOF_TYPES = [
  { id: 'work_email', label: 'Work email screenshot' },
  { id: 'contract', label: 'Contract or payslip' },
  { id: 'website', label: 'Website showing your name' },
  { id: 'letter', label: 'Letter from clinic' },
]

interface Props {
  entityType: 'clinic' | 'practitioner'
  entitySlug: string
  claimerName: string
  claimerEmail: string
}

type FieldErrors = Record<string, string>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function StepIdVerification({ entityType, entitySlug, claimerName, claimerEmail }: Readonly<Props>) {
  const [name, setName] = useState(claimerName)
  const [email, setEmail] = useState(claimerEmail)
  const [govId, setGovId] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)
  const [proof, setProof] = useState<File | null>(null)
  const [proofType, setProofType] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

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
    if (!name.trim()) errors.name = 'Full name is required.'
    if (!email.trim()) errors.email = 'Email address is required.'
    else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
    if (!govId) errors.govId = 'Government ID is required.'
    return errors
  }

  function mapServerErrorToField(message: string): FieldErrors | null {
    const lower = message.toLowerCase()
    if (lower.includes('full name') || lower.includes('name is required')) return { name: message }
    if (lower.includes('email')) return { email: message }
    if (lower.includes('government id') || lower.includes('gov id')) return { govId: message }
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
    if (!govId) return
    setFieldErrors({})
    setLoading(true)

    try {
      const fd = new FormData()
      fd.append('entityType', entityType)
      fd.append('entitySlug', entitySlug)
      fd.append('claimerName', name.trim())
      fd.append('claimerEmail', email.trim())
      fd.append('govId', govId)
      if (selfie) fd.append('selfie', selfie)
      if (proof) fd.append('proof', proof)
      if (proofType) fd.append('proofType', proofType)

      const res = await fetch('/directory/api/verification/submit/', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        const message = typeof data.error === 'string' ? data.error : 'Submission failed. Please try again.'
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
      setFormError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <IconCircleCheck stroke={1.5} className="h-12 w-12" />
        <h2 className="text-xl font-semibold">Verification submitted</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Our team will review your documents within 1–2 business days and update your profile badges.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <IconShieldCheck stroke={1.5} className="h-6 w-6 mt-0.5 shrink-0" />
        <div>
          <h2 className="text-xl font-semibold mb-1">Get ID Verified</h2>
          <p className="text-sm text-muted-foreground">
            Optional high-trust upgrade. Required for payments and teleconsults.
            Admin reviews and sets your <strong>ID Verified</strong> badge.
          </p>
        </div>
      </div>

      {/* Contact details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vfy-name">
            Full name <span className="text-destructive">*</span>
          </Label>
          <input
            id="vfy-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); clearFieldError('name') }}
            placeholder="Your full name"
            aria-invalid={!!fieldErrors.name}
            className={cn(
              'flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              fieldErrors.name ? 'border-destructive' : 'border-input',
            )}
          />
          {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vfy-email">
            Email address <span className="text-destructive">*</span>
          </Label>
          <input
            id="vfy-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
            placeholder="you@example.com"
            aria-invalid={!!fieldErrors.email}
            className={cn(
              'flex h-9 w-full rounded-lg border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
              fieldErrors.email ? 'border-destructive' : 'border-input',
            )}
          />
          {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
        </div>
      </div>

      {/* Government ID */}
      <div className="flex flex-col gap-2">
        <Label>
          Government ID <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">Passport or driver&apos;s licence</p>
        <FileDropZone
          file={govId}
          accept="image/*,.pdf"
          onChange={(f) => { setGovId(f); clearFieldError('govId') }}
        />
        {fieldErrors.govId && <p className="text-xs text-destructive">{fieldErrors.govId}</p>}
      </div>

      {/* Selfie */}
      <div className="flex flex-col gap-2">
        <Label>
          Selfie <span className="text-muted-foreground font-normal">(optional but preferred)</span>
        </Label>
        <FileDropZone
          file={selfie}
          accept="image/*"
          onChange={setSelfie}
        />
      </div>

      {/* Proof of association */}
      <div className="flex flex-col gap-2">
        <Label>
          Proof of clinic association <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {PROOF_TYPES.map((pt) => (
            <button
              key={pt.id}
              type="button"
              onClick={() => setProofType(proofType === pt.id ? '' : pt.id)}
              className={cn(
                'text-left rounded-lg border px-3 py-2 text-xs transition-colors',
                proofType === pt.id
                  ? 'border-foreground bg-muted/50 font-medium'
                  : 'border-border hover:border-muted-foreground/50'
              )}
            >
              {pt.label}
            </button>
          ))}
        </div>
        {proofType && (
          <FileDropZone
            file={proof}
            accept="image/*,.pdf"
            onChange={setProof}
          />
        )}
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" disabled={loading || !govId} className="w-full">
        {loading ? 'Submitting…' : 'Submit for review'}
      </Button>
    </form>
  )
}

interface FileDropZoneProps {
  file: File | null
  accept: string
  onChange: (f: File | null) => void
}

function FileDropZone({ file, accept, onChange }: Readonly<FileDropZoneProps>) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
    >
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <p className="text-sm font-medium truncate max-w-full">{file.name}</p>
      ) : (
        <>
          <IconUpload stroke={1.5} className="h-5 w-5" />
          <p className="text-xs text-muted-foreground">Click to upload</p>
        </>
      )}
    </label>
  )
}
