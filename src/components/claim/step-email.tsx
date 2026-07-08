'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isGenericEmailDomain } from '@/lib/email-domains'
import { cn } from '@/lib/utils'

interface ClinicProps {
  entityType: 'clinic'
  entityName: string
  clinicSlug: string
  onSent: (claimId: number, email: string, consentzExists?: boolean, linkToken?: string) => void
}

interface PractitionerProps {
  entityType: 'practitioner'
  entityName: string
  practitionerSlug: string
  onSent: (claimId: number, email: string, consentzExists?: boolean, linkToken?: string) => void
}

type Props = ClinicProps | PractitionerProps

type FieldErrors = Record<string, string>

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidUkPhone(value: string): boolean {
  return UK_PHONE_RE.test(value.trim().replace(/\s/g, ''))
}

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function StepDetails(props: Readonly<Props>) {
  const { entityType, entityName, onSent } = props

  const [name, setName] = useState(entityType === 'practitioner' ? entityName : '')
  const [email, setEmail] = useState('')
  const [isGenericEmail, setIsGenericEmail] = useState(false)

  // Clinic-specific
  const [clinicNameInput, setClinicNameInput] = useState(entityType === 'clinic' ? entityName : '')
  const [clinicPhone, setClinicPhone] = useState('')
  const [clinicWebsite, setClinicWebsite] = useState('')
  const [googleBusinessLink, setGoogleBusinessLink] = useState('')

  // Practitioner-specific
  const [profession, setProfession] = useState('')
  const [practitionerPhone, setPractitionerPhone] = useState('')
  const [practitionerClinicName, setPractitionerClinicName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [registryName, setRegistryName] = useState('')

  const [loading, setLoading] = useState(false)
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

  function handleEmailBlur() {
    setIsGenericEmail(isGenericEmailDomain(email))
  }

  function getFieldErrors(): FieldErrors {
    const errors: FieldErrors = {}
    if (entityType === 'clinic') {
      if (!clinicNameInput.trim()) errors.clinicNameInput = 'Clinic Name is required.'
      if (name.trim().length < 2) errors.name = 'Please enter your full name.'
      if (!email.trim()) errors.email = 'Business Email is required.'
      else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
      if (!clinicPhone.trim()) errors.clinicPhone = 'Phone Number is required.'
      else if (!isValidUkPhone(clinicPhone)) errors.clinicPhone = 'Please enter a valid UK phone number.'
    } else {
      if (name.trim().length < 2) errors.name = 'Please enter your full name.'
      if (!profession.trim()) errors.profession = 'Profession is required.'
      if (!email.trim()) errors.email = 'Email is required.'
      else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
      if (practitionerPhone.trim() && !isValidUkPhone(practitionerPhone)) errors.practitionerPhone = 'Please enter a valid UK phone number.'
    }
    return errors
  }

  function mapServerErrorToField(message: string): FieldErrors | null {
    const lower = message.toLowerCase()
    if (lower.includes('clinic name')) return { clinicNameInput: message }
    if (lower.includes('full name')) return { name: message }
    if (lower.includes('email')) return { email: message }
    if (lower.includes('phone')) return entityType === 'clinic' ? { clinicPhone: message } : { practitionerPhone: message }
    if (lower.includes('profession')) return { profession: message }
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

    try {
      const payload =
        entityType === 'clinic'
          ? {
              entityType: 'clinic' as const,
              clinicSlug: (props as ClinicProps).clinicSlug,
              claimerName: name.trim(),
              claimerEmail: email.trim(),
              clinicNameInput: clinicNameInput.trim(),
              clinicPhone: clinicPhone.trim(),
              clinicWebsite: clinicWebsite.trim() || undefined,
              googleBusinessLink: googleBusinessLink.trim() || undefined,
            }
          : {
              entityType: 'practitioner' as const,
              practitionerSlug: (props as PractitionerProps).practitionerSlug,
              claimerName: name.trim(),
              claimerEmail: email.trim(),
              claimerPhone: practitionerPhone.trim() || undefined,
              profession: profession.trim(),
              clinicNameInput: practitionerClinicName.trim() || undefined,
              licenseNumber: licenseNumber.trim() || undefined,
              registryName: registryName.trim() || undefined,
            }

      const res = await fetch('/directory/api/claim/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        const message = typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.'
        const mapped = mapServerErrorToField(message)
        if (mapped) {
          setFieldErrors(mapped)
        } else {
          setFormError(message)
        }
        return
      }
      onSent(data.claimId, email, data.consentzUserExists === true, data.linkToken)
    } catch {
      setFormError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-semibold mb-1">
          {entityType === 'clinic' ? 'Claim your clinic' : 'Claim your profile'}
        </h2>
        <p className="text-sm text-muted-foreground">
          Verify you represent <strong>{entityName}</strong>. We&apos;ll send a 6-digit code to your email.
        </p>
      </div>

      {entityType === 'clinic' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="clinic-name-input">Clinic name</Label>
          <Input
            id="clinic-name-input"
            type="text"
            placeholder="e.g. The Skin Clinic London"
            value={clinicNameInput}
            onChange={(e) => { setClinicNameInput(e.target.value); clearFieldError('clinicNameInput') }}
            aria-invalid={!!fieldErrors.clinicNameInput}
            className={cn(fieldErrors.clinicNameInput && 'border-destructive')}
          />
          {fieldErrors.clinicNameInput && <p className="text-xs text-destructive">{fieldErrors.clinicNameInput}</p>}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="claimer-name">Your full name</Label>
        <Input
          id="claimer-name"
          type="text"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => { setName(e.target.value); clearFieldError('name') }}
          autoComplete="name"
          aria-invalid={!!fieldErrors.name}
          className={cn(fieldErrors.name && 'border-destructive')}
        />
        {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
      </div>

      {entityType === 'practitioner' && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              type="text"
              placeholder="e.g. Aesthetic Nurse, Dermatologist"
              value={profession}
              onChange={(e) => { setProfession(e.target.value); clearFieldError('profession') }}
              aria-invalid={!!fieldErrors.profession}
              className={cn(fieldErrors.profession && 'border-destructive')}
            />
            {fieldErrors.profession && <p className="text-xs text-destructive">{fieldErrors.profession}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="practitioner-phone">
              Phone <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="practitioner-phone"
              type="tel"
              placeholder="e.g. 07700 123456"
              value={practitionerPhone}
              onChange={(e) => { setPractitionerPhone(e.target.value); clearFieldError('practitionerPhone') }}
              autoComplete="tel"
              aria-invalid={!!fieldErrors.practitionerPhone}
              className={cn(fieldErrors.practitionerPhone && 'border-destructive')}
            />
            {fieldErrors.practitionerPhone && <p className="text-xs text-destructive">{fieldErrors.practitionerPhone}</p>}
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="claimer-email">
          {entityType === 'clinic' ? 'Business email' : 'Email address'}
        </Label>
        <Input
          id="claimer-email"
          type="email"
          placeholder={entityType === 'clinic' ? 'you@yourclinic.co.uk' : 'you@example.com'}
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
          onBlur={handleEmailBlur}
          autoComplete="email"
          aria-invalid={!!fieldErrors.email}
          className={cn(fieldErrors.email && 'border-destructive')}
        />
        {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
        {isGenericEmail && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Personal email detected. Using a business or clinic email speeds up verification.
            Your claim will be reviewed manually within 24 hours.
          </p>
        )}
      </div>

      {entityType === 'clinic' && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="clinic-phone">Phone number</Label>
            <Input
              id="clinic-phone"
              type="tel"
              placeholder="e.g. 020 7123 4567"
              value={clinicPhone}
              onChange={(e) => { setClinicPhone(e.target.value); clearFieldError('clinicPhone') }}
              autoComplete="tel"
              aria-invalid={!!fieldErrors.clinicPhone}
              className={cn(fieldErrors.clinicPhone && 'border-destructive')}
            />
            {fieldErrors.clinicPhone && <p className="text-xs text-destructive">{fieldErrors.clinicPhone}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="clinic-website">
              Website <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="clinic-website"
              type="url"
              placeholder="https://yourclinic.co.uk"
              value={clinicWebsite}
              onChange={(e) => setClinicWebsite(e.target.value)}
              autoComplete="url"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="google-business-link">
              Google Business link <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="google-business-link"
              type="url"
              placeholder="https://maps.google.com/..."
              value={googleBusinessLink}
              onChange={(e) => setGoogleBusinessLink(e.target.value)}
            />
          </div>
        </>
      )}

      {entityType === 'practitioner' && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="practitioner-clinic-name">
              Clinic or practice name <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="practitioner-clinic-name"
              type="text"
              placeholder="e.g. The Skin Clinic London"
              value={practitionerClinicName}
              onChange={(e) => setPractitionerClinicName(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="license-number">
              Licence / registration number <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="license-number"
              type="text"
              placeholder="e.g. GMC 1234567"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
            />
          </div>

          {licenseNumber && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="registry-name">Registry name</Label>
              <Input
                id="registry-name"
                type="text"
                placeholder="e.g. GMC, NMC, GDC, JCCP"
                value={registryName}
                onChange={(e) => setRegistryName(e.target.value)}
              />
            </div>
          )}
        </>
      )}

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Sending…' : 'Send verification code'}
      </Button>
    </form>
  )
}
