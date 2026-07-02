'use client'

import { useState } from 'react'
import { Loader2, Mail, Phone, Calendar, Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface ConsultationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  treatment: string
}

interface ConsultationRichFormProps {
  defaultValues?: Partial<ConsultationFormData>
  treatments?: string[]
  description?: React.ReactNode
  submitLabel: string
  submitting: boolean
  onSubmit: (data: ConsultationFormData) => void
}

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

function isOver18(dob: string): boolean {
  const birth = new Date(dob)
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 18)
  return birth <= cutoff
}

function maxDobDate(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 18)
  return d.toISOString().slice(0, 10)
}

interface FieldProps {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-gray-400">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: boolean
}

function IconInput({ icon, error, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
      <input
        {...props}
        className={cn(
          'w-full rounded-lg border bg-white py-2.5 text-sm text-gray-900 placeholder:text-gray-400',
          'transition-colors focus:outline-none focus:ring-2',
          icon ? 'pl-9 pr-3' : 'px-3',
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-200 focus:border-gray-400 focus:ring-gray-100',
          className,
        )}
      />
    </div>
  )
}

export function ConsultationRichForm({
  defaultValues,
  treatments,
  description,
  submitLabel,
  submitting,
  onSubmit,
}: ConsultationRichFormProps) {
  const [firstName, setFirstName] = useState(defaultValues?.firstName ?? '')
  const [lastName, setLastName] = useState(defaultValues?.lastName ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [phone, setPhone] = useState(defaultValues?.phone ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(defaultValues?.dateOfBirth ?? '')
  const [treatment, setTreatment] = useState(defaultValues?.treatment ?? '')

  const [phoneError, setPhoneError] = useState('')
  const [dobError, setDobError] = useState('')

  const hasTreatments = treatments && treatments.length > 0

  const canSubmit =
    firstName.trim() && lastName.trim() && email.trim() && phone.trim() && dateOfBirth && !submitting

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPhoneError('')
    setDobError('')

    const cleanPhone = phone.replace(/\s/g, '')
    if (!UK_PHONE_RE.test(cleanPhone)) {
      setPhoneError('Enter a valid UK number — e.g. 07700 900000 or +447700 900000')
      return
    }
    if (!isOver18(dateOfBirth)) {
      setDobError('You must be 18 or over to use this service')
      return
    }

    onSubmit({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: cleanPhone,
      dateOfBirth,
      treatment,
    })
  }

  return (
    <form className="flex flex-col gap-4 px-5 py-4" onSubmit={handleSubmit}>
      {description && (
        <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 leading-relaxed">
          {description}
        </p>
      )}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" required>
          <IconInput
            required
            placeholder="Jane"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last name" required>
          <IconInput
            required
            placeholder="Smith"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Email address" required>
        <IconInput
          required
          type="email"
          icon={<Mail className="h-3.5 w-3.5" />}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </Field>

      {/* Phone */}
      <Field label="Phone number" error={phoneError} required>
        <IconInput
          required
          type="tel"
          icon={<Phone className="h-3.5 w-3.5" />}
          placeholder="07700 900000"
          value={phone}
          error={!!phoneError}
          onChange={(e) => { setPhone(e.target.value); setPhoneError('') }}
          autoComplete="tel"
        />
      </Field>

      {/* Treatment */}
      <Field label="Treatment">
        {hasTreatments ? (
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              <Stethoscope className="h-3.5 w-3.5" />
            </span>
            <Select value={treatment} onValueChange={setTreatment}>
              <SelectTrigger className="w-full pl-9 border-gray-200 text-sm focus:ring-gray-100 focus:border-gray-400 bg-white">
                <SelectValue placeholder="Select a treatment (optional)" />
              </SelectTrigger>
              <SelectContent>
                {treatments.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <IconInput
            icon={<Stethoscope className="h-3.5 w-3.5" />}
            placeholder="e.g. Botox, Dermal Fillers"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          />
        )}
      </Field>

      {/* Date of birth */}
      <Field label="Date of birth" error={dobError} required>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
          </span>
          <input
            required
            type="date"
            max={maxDobDate()}
            value={dateOfBirth}
            onChange={(e) => { setDateOfBirth(e.target.value); setDobError('') }}
            className={cn(
              'w-full rounded-lg border bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900',
              'transition-colors focus:outline-none focus:ring-2',
              dobError
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-gray-400 focus:ring-gray-100',
            )}
          />
        </div>
        <p className="text-[11px] text-gray-400">You must be 18 or over to request a consultation</p>
      </Field>

      <Button
        type="submit"
        className="w-full h-10 mt-1 text-sm font-medium"
        disabled={!canSubmit}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
      </Button>
    </form>
  )
}
