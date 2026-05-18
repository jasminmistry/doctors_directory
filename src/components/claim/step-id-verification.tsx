'use client'

import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Upload, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function StepIdVerification({ entityType, entitySlug, claimerName, claimerEmail }: Readonly<Props>) {
  const [name, setName] = useState(claimerName)
  const [email, setEmail] = useState(claimerEmail)
  const [govId, setGovId] = useState<File | null>(null)
  const [selfie, setSelfie] = useState<File | null>(null)
  const [proof, setProof] = useState<File | null>(null)
  const [proofType, setProofType] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError('Full name is required'); return }
    if (!email.trim()) { setError('Email address is required'); return }
    if (!govId) { setError('Government ID is required'); return }
    setError(null)
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

      const res = await fetch('/directory/api/verification/submit', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Submission failed. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        <h2 className="text-xl font-semibold">Verification submitted</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Our team will review your documents within 1–2 business days and update your profile badges.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="h-6 w-6 mt-0.5 shrink-0 text-muted-foreground" />
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
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="vfy-email">
            Email address <span className="text-destructive">*</span>
          </Label>
          <input
            id="vfy-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
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
          onChange={setGovId}
        />
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

      {error && <p className="text-sm text-destructive">{error}</p>}

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
          <Upload className="h-5 w-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Click to upload</p>
        </>
      )}
    </label>
  )
}
