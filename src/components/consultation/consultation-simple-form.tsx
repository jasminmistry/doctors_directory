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
  UK_PHONE_RE,
  consentComplete,
  type ConsentValues,
} from '@/components/consultation/consultation-form-parts'
import { CONTACT_REASONS } from '@/lib/consultation-reasons'
import { IconLoader2, IconLock, IconMail, IconMessage, IconPhone } from '@tabler/icons-react'

export interface SimpleEnquiryData {
  email: string
  phone: string
  contactReason: string
}

interface ConsultationSimpleFormProps {
  defaultValues?: Partial<SimpleEnquiryData>
  clinicName: string
  description?: React.ReactNode
  submitLabel: string
  submitting: boolean
  onSubmit: (data: SimpleEnquiryData) => void
  /** True once the patient is logged in — locks the email field to their verified account email. */
  emailLocked?: boolean
}

/**
 * Slimmed-down enquiry form shown for **unclaimed** clinics: no name, no date of
 * birth, phone optional, plus a required "Reason for contact". Claimed clinics
 * keep the full `ConsultationRichForm`.
 */
export function ConsultationSimpleForm({
  defaultValues,
  clinicName,
  description,
  submitLabel,
  submitting,
  onSubmit,
  emailLocked,
}: ConsultationSimpleFormProps) {
  const [email, setEmail] = useState(defaultValues?.email ?? '')
  const [phone, setPhone] = useState(defaultValues?.phone ?? '')
  const [contactReason, setContactReason] = useState(defaultValues?.contactReason ?? '')

  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [reasonError, setReasonError] = useState('')

  const [consent, setConsent] = useState<ConsentValues>(EMPTY_CONSENT)
  const [consentError, setConsentError] = useState('')

  const formStarted = useRef(false)
  function markFormStart() {
    if (formStarted.current) return
    formStarted.current = true
    track('form_start', { form_name: 'enquiry' })
  }

  const canSubmit =
    email.trim() && contactReason && consentComplete(consent) && !submitting

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEmailError('')
    setPhoneError('')
    setReasonError('')
    setConsentError('')

    let hasError = false
    if (!email.trim()) {
      setEmailError('Email address is required.')
      hasError = true
    } else if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Please enter a valid email address.')
      hasError = true
    }

    const cleanPhone = phone.replace(/\s/g, '')
    if (cleanPhone && !UK_PHONE_RE.test(cleanPhone)) {
      setPhoneError('Enter a valid UK number — e.g. 07700 900000 or +447700 900000')
      hasError = true
    }

    if (!contactReason) {
      setReasonError('Please choose a reason for contacting the clinic.')
      hasError = true
    }

    if (!consentComplete(consent)) {
      setConsentError('Please confirm all four statements below to continue.')
      hasError = true
    }

    if (hasError) return

    track('form_submit', { form_name: 'enquiry' })
    onSubmit({ email: email.trim(), phone: cleanPhone, contactReason })
  }

  return (
    <form className="flex flex-col gap-4 px-5 py-4" onSubmit={handleSubmit} onFocusCapture={markFormStart} noValidate>
      {description && (
        <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 leading-relaxed">
          {description}
        </p>
      )}

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

      {/* Phone — optional */}
      <Field label="Phone number (optional)" error={phoneError}>
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

      {/* Reason for contact */}
      <Field label="Reason for contact" error={reasonError} required>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
            <IconMessage stroke={1.5} className="h-3.5 w-3.5" />
          </span>
          <select
            value={contactReason}
            onChange={(e) => { setContactReason(e.target.value); setReasonError('') }}
            className={cn(
              'w-full appearance-none rounded-lg border bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900',
              'transition-colors focus:outline-none focus:ring-2',
              contactReason ? '' : 'text-gray-400',
              reasonError
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-gray-400 focus:ring-gray-100',
            )}
          >
            <option value="" disabled>Select a reason…</option>
            {CONTACT_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>{reason.label}</option>
            ))}
          </select>
        </div>
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
