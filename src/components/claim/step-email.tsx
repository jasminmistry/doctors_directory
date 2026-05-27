'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isGenericEmailDomain } from '@/lib/email-domains'

interface ClinicProps {
  entityType: 'clinic'
  entityName: string
  clinicSlug: string
  onSent: (claimId: number, email: string) => void
}

interface PractitionerProps {
  entityType: 'practitioner'
  entityName: string
  practitionerSlug: string
  onSent: (claimId: number, email: string) => void
}

type Props = ClinicProps | PractitionerProps

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
  const [error, setError] = useState<string | null>(null)

  function handleEmailBlur() {
    setIsGenericEmail(isGenericEmailDomain(email))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const payload =
        entityType === 'clinic'
          ? {
              entityType: 'clinic' as const,
              clinicSlug: (props as ClinicProps).clinicSlug,
              claimerName: name,
              claimerEmail: email,
              clinicNameInput,
              clinicPhone,
              clinicWebsite: clinicWebsite || undefined,
              googleBusinessLink: googleBusinessLink || undefined,
            }
          : {
              entityType: 'practitioner' as const,
              practitionerSlug: (props as PractitionerProps).practitionerSlug,
              claimerName: name,
              claimerEmail: email,
              claimerPhone: practitionerPhone || undefined,
              profession,
              clinicNameInput: practitionerClinicName || undefined,
              licenseNumber: licenseNumber || undefined,
              registryName: registryName || undefined,
            }

      const res = await fetch('/directory/api/claim/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.')
        return
      }
      onSent(data.claimId, email)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            onChange={(e) => setClinicNameInput(e.target.value)}
            required
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="claimer-name">Your full name</Label>
        <Input
          id="claimer-name"
          type="text"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
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
              onChange={(e) => setProfession(e.target.value)}
              required
            />
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
              onChange={(e) => setPractitionerPhone(e.target.value)}
              autoComplete="tel"
            />
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
          onChange={(e) => setEmail(e.target.value)}
          onBlur={handleEmailBlur}
          required
          autoComplete="email"
        />
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
              onChange={(e) => setClinicPhone(e.target.value)}
              required
              autoComplete="tel"
            />
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Sending…' : 'Send verification code'}
      </Button>
    </form>
  )
}
