'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CityCombobox } from '@/components/claim/city-combobox'
import { isGenericEmailDomain } from '@/lib/email-domains'
import { isValidEmail } from '@/lib/email-validation'
import { isValidSingleUrl } from '@/lib/url-validation'
import { cn } from '@/lib/utils'

interface ClinicProps {
  entityType: 'clinic'
  mode?: 'claim' | 'register'
  entityName: string
  clinicSlug?: string
  onSent: (claimId: number, email: string, entityName?: string, consentzExists?: boolean, linkToken?: string) => void
}

interface PractitionerProps {
  entityType: 'practitioner'
  mode?: 'claim' | 'register'
  entityName: string
  practitionerSlug?: string
  onSent: (claimId: number, email: string, entityName?: string, consentzExists?: boolean, linkToken?: string) => void
}

type Props = ClinicProps | PractitionerProps

type FieldErrors = Record<string, string>

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

// Strips all internal whitespace (e.g. "+4 4 2 0 79 46 095 8") so the value validated
// and submitted is always a clean, dialable string.
function normalizePhone(value: string): string {
  return value.trim().replace(/\s/g, '')
}

function isValidUkPhone(value: string): boolean {
  return UK_PHONE_RE.test(normalizePhone(value))
}

export function StepDetails(props: Readonly<Props>) {
  const { entityType, entityName, onSent } = props
  const mode = props.mode ?? 'claim'
  const isRegister = mode === 'register'

  const [name, setName] = useState(entityType === 'practitioner' && !isRegister ? entityName : '')
  const [email, setEmail] = useState('')
  const [isGenericEmail, setIsGenericEmail] = useState(false)

  // Clinic-specific
  const [clinicNameInput, setClinicNameInput] = useState(entityType === 'clinic' && !isRegister ? entityName : '')
  const [clinicPhone, setClinicPhone] = useState('')
  const [clinicWebsite, setClinicWebsite] = useState('')
  const [googleBusinessLink, setGoogleBusinessLink] = useState('')

  // Practitioner-specific
  const [profession, setProfession] = useState('')
  const [practitionerPhone, setPractitionerPhone] = useState('')
  const [practitionerClinicName, setPractitionerClinicName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [registryName, setRegistryName] = useState('')

  // Register-only (new business, no existing profile yet)
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [about, setAbout] = useState('')

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
      else if (clinicNameInput.trim().length > 255) errors.clinicNameInput = 'Clinic Name cannot exceed 255 characters.'
      if (name.trim().length < 2) errors.name = 'Please enter your full name.'
      else if (name.trim().length > 255) errors.name = 'Full Name cannot exceed 255 characters.'
      if (!email.trim()) errors.email = 'Business Email is required.'
      else if (email.trim().length > 255) errors.email = 'Email cannot exceed 255 characters.'
      else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
      if (!clinicPhone.trim()) errors.clinicPhone = 'Phone Number is required.'
      else if (!isValidUkPhone(clinicPhone)) errors.clinicPhone = 'Please enter a valid UK phone number.'
      if (clinicWebsite.trim() && !isValidSingleUrl(clinicWebsite)) errors.clinicWebsite = 'Enter a single valid URL with no spaces.'
      if (googleBusinessLink.trim() && !isValidSingleUrl(googleBusinessLink)) errors.googleBusinessLink = 'Enter a single valid URL with no spaces.'
      if (isRegister) {
        if (!address.trim()) errors.address = 'Address is required.'
        else if (address.trim().length > 500) errors.address = 'Address cannot exceed 500 characters.'
        if (!city.trim()) errors.city = 'City is required.'
      }
    } else {
      if (name.trim().length < 2) errors.name = 'Please enter your full name.'
      else if (name.trim().length > 255) errors.name = 'Full Name cannot exceed 255 characters.'
      if (!profession.trim()) errors.profession = 'Profession is required.'
      else if (profession.trim().length > 255) errors.profession = 'Profession cannot exceed 255 characters.'
      if (!email.trim()) errors.email = 'Email is required.'
      else if (email.trim().length > 255) errors.email = 'Email cannot exceed 255 characters.'
      else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
      if (practitionerPhone.trim() && !isValidUkPhone(practitionerPhone)) errors.practitionerPhone = 'Please enter a valid UK phone number.'
      if (isRegister && !city.trim()) errors.city = 'City is required.'
    }
    return errors
  }

  function mapServerErrorToField(message: string): FieldErrors | null {
    const lower = message.toLowerCase()
    if (lower.includes('clinic name')) return { clinicNameInput: message }
    if (lower.includes('full name')) return { name: message }
    if (lower.includes('email')) return { email: message }
    if (lower.includes('phone')) return entityType === 'clinic' ? { clinicPhone: message } : { practitionerPhone: message }
    if (lower.includes('google business')) return { googleBusinessLink: message }
    if (lower.includes('website')) return { clinicWebsite: message }
    if (lower.includes('profession')) return { profession: message }
    if (lower.includes('address')) return { address: message }
    if (lower.includes('city')) return { city: message }
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
              isNewRegistration: isRegister ? (true as const) : undefined,
              clinicSlug: isRegister ? undefined : (props as ClinicProps).clinicSlug,
              claimerName: name.trim(),
              claimerEmail: email.trim(),
              clinicNameInput: clinicNameInput.trim(),
              clinicPhone: normalizePhone(clinicPhone),
              clinicWebsite: clinicWebsite.trim() || undefined,
              googleBusinessLink: googleBusinessLink.trim() || undefined,
              ...(isRegister
                ? { address: address.trim(), city: city.trim(), category: category.trim() || undefined, about: about.trim() || undefined }
                : {}),
            }
          : {
              entityType: 'practitioner' as const,
              isNewRegistration: isRegister ? (true as const) : undefined,
              practitionerSlug: isRegister ? undefined : (props as PractitionerProps).practitionerSlug,
              claimerName: name.trim(),
              claimerEmail: email.trim(),
              claimerPhone: practitionerPhone.trim() ? normalizePhone(practitionerPhone) : undefined,
              profession: profession.trim(),
              clinicNameInput: practitionerClinicName.trim() || undefined,
              licenseNumber: isRegister ? undefined : licenseNumber.trim() || undefined,
              registryName: isRegister ? undefined : registryName.trim() || undefined,
              ...(isRegister ? { city: city.trim(), about: about.trim() || undefined } : {}),
            }

      const res = await fetch('/directory/api/claim/initiate/', {
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
      onSent(data.claimId, email, data.entityName, data.consentzUserExists === true, data.linkToken)
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
          {isRegister
            ? (entityType === 'clinic' ? 'Register your clinic' : 'Register your profile')
            : (entityType === 'clinic' ? 'Claim your clinic' : 'Claim your profile')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isRegister
            ? "Tell us about your business. We'll send a 6-digit code to your email to verify it's you."
            : <>Verify you represent <strong>{entityName}</strong>. We&apos;ll send a 6-digit code to your email.</>}
        </p>
      </div>

      {entityType === 'clinic' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="clinic-name-input">
            Clinic name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="clinic-name-input"
            type="text"
            placeholder="e.g. The Skin Clinic London"
            value={clinicNameInput}
            onChange={(e) => { setClinicNameInput(e.target.value); clearFieldError('clinicNameInput') }}
            maxLength={255}
            aria-invalid={!!fieldErrors.clinicNameInput}
            className={cn(fieldErrors.clinicNameInput && 'border-destructive')}
          />
          {fieldErrors.clinicNameInput && <p className="text-xs text-destructive">{fieldErrors.clinicNameInput}</p>}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="claimer-name">
          Your full name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="claimer-name"
          type="text"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => { setName(e.target.value); clearFieldError('name') }}
          autoComplete="name"
          maxLength={255}
          aria-invalid={!!fieldErrors.name}
          className={cn(fieldErrors.name && 'border-destructive')}
        />
        {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
      </div>

      {entityType === 'practitioner' && (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profession">
              Profession <span className="text-destructive">*</span>
            </Label>
            <Input
              id="profession"
              type="text"
              placeholder="e.g. Aesthetic Nurse, Dermatologist"
              value={profession}
              onChange={(e) => { setProfession(e.target.value); clearFieldError('profession') }}
              maxLength={255}
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
              onBlur={() => setPractitionerPhone((v) => normalizePhone(v))}
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
          {entityType === 'clinic' ? 'Business email' : 'Email address'} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="claimer-email"
          type="email"
          placeholder={entityType === 'clinic' ? 'you@yourclinic.co.uk' : 'you@example.com'}
          value={email}
          onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
          onBlur={handleEmailBlur}
          autoComplete="email"
          maxLength={255}
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
            <Label htmlFor="clinic-phone">
              Phone number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="clinic-phone"
              type="tel"
              placeholder="e.g. 020 7123 4567"
              value={clinicPhone}
              onChange={(e) => { setClinicPhone(e.target.value); clearFieldError('clinicPhone') }}
              onBlur={() => setClinicPhone((v) => normalizePhone(v))}
              autoComplete="tel"
              aria-invalid={!!fieldErrors.clinicPhone}
              className={cn(fieldErrors.clinicPhone && 'border-destructive')}
            />
            {fieldErrors.clinicPhone && <p className="text-xs text-destructive">{fieldErrors.clinicPhone}</p>}
          </div>

          {isRegister && (
            <>
              <div className="flex flex-col gap-2">
                <Label htmlFor="clinic-address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clinic-address"
                  type="text"
                  placeholder="123 Harley Street, London"
                  value={address}
                  onChange={(e) => { setAddress(e.target.value); clearFieldError('address') }}
                  maxLength={500}
                  aria-invalid={!!fieldErrors.address}
                  className={cn(fieldErrors.address && 'border-destructive')}
                />
                {fieldErrors.address && <p className="text-xs text-destructive">{fieldErrors.address}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="clinic-city">
                  City <span className="text-destructive">*</span>
                </Label>
                <CityCombobox
                  id="clinic-city"
                  value={city}
                  onChange={(v) => { setCity(v); clearFieldError('city') }}
                  invalid={!!fieldErrors.city}
                />
                {fieldErrors.city && <p className="text-xs text-destructive">{fieldErrors.city}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="clinic-category">
                  Specialty / category <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  id="clinic-category"
                  type="text"
                  placeholder="e.g. Aesthetics, Dermatology"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={255}
                />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="clinic-website">
              Website <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="clinic-website"
              type="url"
              placeholder="https://yourclinic.co.uk"
              value={clinicWebsite}
              onChange={(e) => { setClinicWebsite(e.target.value); clearFieldError('clinicWebsite') }}
              autoComplete="url"
              aria-invalid={!!fieldErrors.clinicWebsite}
              className={cn(fieldErrors.clinicWebsite && 'border-destructive')}
            />
            {fieldErrors.clinicWebsite && <p className="text-xs text-destructive">{fieldErrors.clinicWebsite}</p>}
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
              onChange={(e) => { setGoogleBusinessLink(e.target.value); clearFieldError('googleBusinessLink') }}
              aria-invalid={!!fieldErrors.googleBusinessLink}
              className={cn(fieldErrors.googleBusinessLink && 'border-destructive')}
            />
            {fieldErrors.googleBusinessLink && <p className="text-xs text-destructive">{fieldErrors.googleBusinessLink}</p>}
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
              maxLength={255}
            />
          </div>

          {isRegister ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="practitioner-city">City</Label>
              <CityCombobox
                id="practitioner-city"
                value={city}
                onChange={(v) => { setCity(v); clearFieldError('city') }}
                invalid={!!fieldErrors.city}
              />
              {fieldErrors.city && <p className="text-xs text-destructive">{fieldErrors.city}</p>}
            </div>
          ) : (
            <>
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
                  maxLength={100}
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
                    maxLength={255}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {isRegister && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="about">
            About <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="about"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder={entityType === 'clinic' ? 'Tell us about your clinic and the services you offer…' : 'Tell us about your background and experience…'}
            rows={4}
          />
        </div>
      )}

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button size="lg" type="submit" disabled={loading} className="w-full">
        {loading ? 'Sending…' : 'Send verification code'}
      </Button>
    </form>
  )
}
