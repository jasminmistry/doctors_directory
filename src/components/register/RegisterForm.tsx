'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type EntityType = 'clinic' | 'practitioner'

interface Props {
  entityType: EntityType
}

type FieldErrors = Record<string, string>

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidUkPhone(value: string): boolean {
  return UK_PHONE_RE.test(value.trim().replace(/\s/g, ''))
}

function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export function RegisterForm({ entityType }: Readonly<Props>) {
  const isClinic = entityType === 'clinic'

  // Shared
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [about, setAbout] = useState('')

  // Clinic-specific
  const [clinicName, setClinicName] = useState('')
  const [contactName, setContactName] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [category, setCategory] = useState('')

  // Practitioner-specific
  const [fullName, setFullName] = useState('')
  const [profession, setProfession] = useState('')
  const [practClinicName, setPractClinicName] = useState('')

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
    if (isClinic) {
      if (clinicName.trim().length < 2) errors.clinicName = 'Clinic Name is required.'
      if (contactName.trim().length < 2) errors.contactName = 'Please enter your full name.'
      if (!email.trim()) errors.email = 'Business Email is required.'
      else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
      if (!phone.trim()) errors.phone = 'Phone Number is required.'
      else if (!isValidUkPhone(phone)) errors.phone = 'Please enter a valid UK phone number.'
      if (address.trim().length < 2) errors.address = 'Address is required.'
      if (city.trim().length < 2) errors.city = 'City is required.'
    } else {
      if (fullName.trim().length < 2) errors.fullName = 'Please enter your full name.'
      if (profession.trim().length < 2) errors.profession = 'Profession is required.'
      if (!email.trim()) errors.email = 'Email is required.'
      else if (!isValidEmail(email)) errors.email = 'Please enter a valid email address.'
      if (phone.trim() && !isValidUkPhone(phone)) errors.phone = 'Please enter a valid UK phone number.'
      if (city.trim().length < 2) errors.city = 'City is required.'
    }
    return errors
  }

  function mapServerErrorToField(message: string): FieldErrors | null {
    const lower = message.toLowerCase()
    if (lower.includes('clinic name')) return { clinicName: message }
    if (lower.includes('full name')) return isClinic ? { contactName: message } : { fullName: message }
    if (lower.includes('email')) return { email: message }
    if (lower.includes('phone')) return { phone: message }
    if (lower.includes('address')) return { address: message }
    if (lower.includes('city')) return { city: message }
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

    const payload = isClinic
      ? {
          clinicName: clinicName.trim(),
          contactName: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          website: website.trim() || undefined,
          category: category.trim() || undefined,
          about: about.trim() || undefined,
        }
      : {
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          profession: profession.trim(),
          clinicName: practClinicName.trim() || undefined,
          city: city.trim(),
          about: about.trim() || undefined,
        }

    try {
      const res = await fetch(`/directory/api/register/${entityType}`, {
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
        <CheckCircle2 className="h-12 w-12 text-black" />
        <div>
          <h3 className="text-lg font-semibold mb-1">Application received</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Thank you for registering. Our team will review your submission and be in touch within 1–2 business days.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {isClinic ? (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="clinic-name">Clinic name</Label>
            <Input
              id="clinic-name"
              value={clinicName}
              onChange={(e) => { setClinicName(e.target.value); clearFieldError('clinicName') }}
              placeholder="e.g. The Skin Clinic London"
              aria-invalid={!!fieldErrors.clinicName}
              className={cn(fieldErrors.clinicName && 'border-destructive')}
            />
            {fieldErrors.clinicName && <p className="text-xs text-destructive">{fieldErrors.clinicName}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-name">Your full name</Label>
            <Input
              id="contact-name"
              value={contactName}
              onChange={(e) => { setContactName(e.target.value); clearFieldError('contactName') }}
              placeholder="Jane Smith"
              autoComplete="name"
              aria-invalid={!!fieldErrors.contactName}
              className={cn(fieldErrors.contactName && 'border-destructive')}
            />
            {fieldErrors.contactName && <p className="text-xs text-destructive">{fieldErrors.contactName}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Business email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
              placeholder="you@yourclinic.co.uk"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              className={cn(fieldErrors.email && 'border-destructive')}
            />
            {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); clearFieldError('phone') }}
              placeholder="020 7123 4567"
              autoComplete="tel"
              aria-invalid={!!fieldErrors.phone}
              className={cn(fieldErrors.phone && 'border-destructive')}
            />
            {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => { setAddress(e.target.value); clearFieldError('address') }}
              placeholder="123 Harley Street, London"
              aria-invalid={!!fieldErrors.address}
              className={cn(fieldErrors.address && 'border-destructive')}
            />
            {fieldErrors.address && <p className="text-xs text-destructive">{fieldErrors.address}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => { setCity(e.target.value); clearFieldError('city') }}
              placeholder="London"
              aria-invalid={!!fieldErrors.city}
              className={cn(fieldErrors.city && 'border-destructive')}
            />
            {fieldErrors.city && <p className="text-xs text-destructive">{fieldErrors.city}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">
              Specialty / category <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Aesthetics, Dermatology" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="website">
              Website <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourclinic.co.uk" autoComplete="url" />
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); clearFieldError('fullName') }}
              placeholder="Dr Jane Smith"
              autoComplete="name"
              aria-invalid={!!fieldErrors.fullName}
              className={cn(fieldErrors.fullName && 'border-destructive')}
            />
            {fieldErrors.fullName && <p className="text-xs text-destructive">{fieldErrors.fullName}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profession">Profession / specialty</Label>
            <Input
              id="profession"
              value={profession}
              onChange={(e) => { setProfession(e.target.value); clearFieldError('profession') }}
              placeholder="e.g. Aesthetic Nurse, Dermatologist"
              aria-invalid={!!fieldErrors.profession}
              className={cn(fieldErrors.profession && 'border-destructive')}
            />
            {fieldErrors.profession && <p className="text-xs text-destructive">{fieldErrors.profession}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              className={cn(fieldErrors.email && 'border-destructive')}
            />
            {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">
              Phone <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); clearFieldError('phone') }}
              placeholder="07700 123456"
              autoComplete="tel"
              aria-invalid={!!fieldErrors.phone}
              className={cn(fieldErrors.phone && 'border-destructive')}
            />
            {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => { setCity(e.target.value); clearFieldError('city') }}
              placeholder="London"
              aria-invalid={!!fieldErrors.city}
              className={cn(fieldErrors.city && 'border-destructive')}
            />
            {fieldErrors.city && <p className="text-xs text-destructive">{fieldErrors.city}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="clinic-name-pract">
              Clinic or practice name <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input id="clinic-name-pract" value={practClinicName} onChange={(e) => setPractClinicName(e.target.value)} placeholder="e.g. The Skin Clinic London" />
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="about">
          About <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="about"
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder={isClinic ? 'Tell us about your clinic and the services you offer…' : 'Tell us about your background and experience…'}
          rows={4}
        />
      </div>

      {formError && <p className="text-sm text-destructive">{formError}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting…' : 'Submit application'}
      </Button>
    </form>
  )
}
