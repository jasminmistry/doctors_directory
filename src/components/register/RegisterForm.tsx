'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle2 } from 'lucide-react'

type EntityType = 'clinic' | 'practitioner'

interface Props {
  entityType: EntityType
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
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const payload = isClinic
      ? { clinicName, contactName, email, phone, address, city, website: website || undefined, category: category || undefined, about: about || undefined }
      : { fullName, email, phone: phone || undefined, profession, clinicName: practClinicName || undefined, city, about: about || undefined }

    try {
      const res = await fetch(`/directory/api/register/${entityType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Please try again.')
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
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {isClinic ? (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="clinic-name">Clinic name</Label>
            <Input id="clinic-name" value={clinicName} onChange={(e) => setClinicName(e.target.value)} placeholder="e.g. The Skin Clinic London" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="contact-name">Your full name</Label>
            <Input id="contact-name" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Jane Smith" required autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Business email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourclinic.co.uk" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="020 7123 4567" required autoComplete="tel" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Harley Street, London" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="London" required />
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
            <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr Jane Smith" required autoComplete="name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profession">Profession / specialty</Label>
            <Input id="profession" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Aesthetic Nurse, Dermatologist" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">
              Phone <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07700 123456" autoComplete="tel" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="London" required />
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting…' : 'Submit application'}
      </Button>
    </form>
  )
}
