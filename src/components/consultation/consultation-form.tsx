'use client'

import { useRef, useState } from 'react'
import { track } from '@/lib/analytics/track'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ConsentCheckboxes,
  EMPTY_CONSENT,
  EMAIL_RE,
  Field,
  IconInput,
  NAME_MAX_LENGTH,
  NAME_RE,
  UK_PHONE_RE,
  consentComplete,
  isOver18,
  maxDobDate,
  normalizeName,
  type ConsentValues,
} from '@/components/consultation/consultation-form-parts'
import { IconCalendar, IconLoader2, IconLock, IconMail, IconPhone } from '@tabler/icons-react'

export interface ConsultationFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
}

interface ConsultationRichFormProps {
  defaultValues?: Partial<ConsultationFormData>
  clinicName: string
  description?: React.ReactNode
  submitLabel: string
  submitting: boolean
  onSubmit: (data: ConsultationFormData) => void
  /** True once the patient is logged in — locks the email field to their verified account email. */
  emailLocked?: boolean
}

export function ConsultationRichForm({
  defaultValues,
  clinicName,
  description,
  submitLabel,
  submitting,
  onSubmit,
  emailLocked,
}: ConsultationRichFormProps) {
  const [firstName, setFirstName] = useState(defaultValues?.firstName ?? '')
  const [lastName, setLastName] = useState(defaultValues?.lastName ?? '')
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [phone, setPhone] = useState(defaultValues?.phone ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(defaultValues?.dateOfBirth ?? '')

  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [dobError, setDobError] = useState('')

  const [consent, setConsent] = useState<ConsentValues>(EMPTY_CONSENT)
  const [consentError, setConsentError] = useState('')

  const formStarted = useRef(false)
  function markFormStart() {
    if (formStarted.current) return
    formStarted.current = true
    track('form_start', { form_name: 'consultation' })
  }

  const canSubmit =
    firstName.trim() && lastName.trim() && email.trim() && phone.trim() && dateOfBirth &&
    consentComplete(consent) && !submitting

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFirstNameError('')
    setLastNameError('')
    setEmailError('')
    setPhoneError('')
    setDobError('')
    setConsentError('')

    const normalizedFirstName = normalizeName(firstName)
    const normalizedLastName = normalizeName(lastName)
    if (normalizedFirstName !== firstName) setFirstName(normalizedFirstName)
    if (normalizedLastName !== lastName) setLastName(normalizedLastName)

    let hasError = false
    if (!normalizedFirstName) {
      setFirstNameError('First name is required.')
      hasError = true
    } else if (!NAME_RE.test(normalizedFirstName)) {
      setFirstNameError('Enter a valid first name (letters only, no numbers or symbols).')
      hasError = true
    }
    if (!normalizedLastName) {
      setLastNameError('Last name is required.')
      hasError = true
    } else if (!NAME_RE.test(normalizedLastName)) {
      setLastNameError('Enter a valid last name (letters only, no numbers or symbols).')
      hasError = true
    }
    if (!email.trim()) {
      setEmailError('Email address is required.')
      hasError = true
    } else if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Please enter a valid email address.')
      hasError = true
    }

    const cleanPhone = phone.replace(/\s/g, '')
    if (!UK_PHONE_RE.test(cleanPhone)) {
      setPhoneError('Enter a valid UK number — e.g. 07700 900000 or +447700 900000')
      hasError = true
    }
    if (!isOver18(dateOfBirth)) {
      setDobError('You must be 18 or over to use this service')
      hasError = true
    }

    if (!consentComplete(consent)) {
      setConsentError('Please confirm all four statements below to continue.')
      hasError = true
    }

    if (hasError) return

    track('form_submit', { form_name: 'consultation' })
    onSubmit({
      firstName: normalizedFirstName,
      lastName: normalizedLastName,
      email: email.trim(),
      phone: cleanPhone,
      dateOfBirth,
    })
  }

  return (
    <form className="flex flex-col gap-4 px-5 py-4" onSubmit={handleSubmit} onFocusCapture={markFormStart} noValidate>
      {description && (
        <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 leading-relaxed">
          {description}
        </p>
      )}

      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={firstNameError} required>
          <IconInput
            placeholder="Jane"
            value={firstName}
            error={!!firstNameError}
            onChange={(e) => { setFirstName(e.target.value); setFirstNameError('') }}
            onBlur={() => setFirstName((v) => normalizeName(v))}
            autoComplete="given-name"
            maxLength={NAME_MAX_LENGTH}
          />
        </Field>
        <Field label="Last name" error={lastNameError} required>
          <IconInput
            placeholder="Smith"
            value={lastName}
            error={!!lastNameError}
            onChange={(e) => { setLastName(e.target.value); setLastNameError('') }}
            onBlur={() => setLastName((v) => normalizeName(v))}
            autoComplete="family-name"
            maxLength={NAME_MAX_LENGTH}
          />
        </Field>
      </div>

      {/* Email */}
      <Field label="Email address" error={emailError} required>
        <IconInput
          type="email"
          icon={
            emailLocked
              ? <IconLock stroke={1.5} className="h-3.5 w-3.5" />
              : <IconMail stroke={1.5} className="h-3.5 w-3.5" />
          }
          placeholder="you@example.com"
          value={email}
          error={!!emailError}
          onChange={(e) => { if (!emailLocked) { setEmail(e.target.value); setEmailError('') } }}
          readOnly={emailLocked}
          autoComplete="email"
          maxLength={255}
          className={emailLocked ? 'bg-gray-50 text-gray-600' : undefined}
        />
      </Field>
      {emailLocked && (
        <p className="-mt-2.5 text-[11px] text-gray-500">
          This is the email on your account and can&apos;t be changed here.
        </p>
      )}

      {/* Phone */}
      <Field label="Phone number" error={phoneError} required>
        <IconInput
          type="tel"
          icon={<IconPhone stroke={1.5} className="h-3.5 w-3.5" />}
          placeholder="07700 900000"
          value={phone}
          error={!!phoneError}
          onChange={(e) => { setPhone(e.target.value); setPhoneError('') }}
          autoComplete="tel"
          maxLength={20}
        />
      </Field>

      {/* Date of birth */}
      <Field label="Date of birth" error={dobError} required>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
            <IconCalendar stroke={1.5} className="h-3.5 w-3.5" />
          </span>
          <input
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
        <p className="text-[11px] text-gray-600">You must be 18 or over to request a consultation</p>
      </Field>

      {/* Consent disclaimer + checkboxes */}
      <ConsentCheckboxes
        clinicName={clinicName}
        values={consent}
        onChange={(next) => { setConsent(next); setConsentError('') }}
        error={consentError}
      />

      <Button
        type="submit"
        className="w-full h-10 mt-1 text-sm font-medium"
        disabled={!canSubmit}
      >
        {submitting ? <IconLoader2 stroke={1.5} className="h-4 w-4 animate-spin" /> : submitLabel}
      </Button>
    </form>
  )
}
