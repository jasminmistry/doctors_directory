'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { consentDisclaimer, consentCheckboxWording, TERMS_URL } from '@/lib/consent'
import { cn } from '@/lib/utils'

/**
 * Shared building blocks for the two patient enquiry forms:
 * - `ConsultationRichForm` (claimed clinics — full details)
 * - `ConsultationSimpleForm` (unclaimed clinics — email + phone + reason)
 *
 * Keeping the consent block here means the four-checkbox wording lives in one
 * place regardless of which form is rendered.
 */

export const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/
export const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
export const NAME_RE = /^[A-Za-z]+(?:[-' ][A-Za-z]+)*$/
export const NAME_MAX_LENGTH = 50

export const PRIVACY_POLICY_URL =
  `${process.env.NEXT_PUBLIC_MARKETING_BASE_URL || 'https://www.consentz.com'}/privacy-policy/`

// Collapses internal double/triple spaces (e.g. "William  Arthur") so stray extra
// whitespace doesn't trip the letters-only NAME_RE check.
export function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function isOver18(dob: string): boolean {
  const birth = new Date(dob)
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 18)
  return birth <= cutoff
}

export function maxDobDate(): string {
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

export function Field({ label, error, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
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

export function IconInput({ icon, error, className, ...props }: IconInputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
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

export interface ConsentValues {
  share: boolean
  privacy: boolean
  age: boolean
  terms: boolean
}

export const EMPTY_CONSENT: ConsentValues = { share: false, privacy: false, age: false, terms: false }

export function consentComplete(v: ConsentValues): boolean {
  return v.share && v.privacy && v.age && v.terms
}

interface ConsentCheckboxesProps {
  clinicName: string
  values: ConsentValues
  onChange: (next: ConsentValues) => void
  error?: string
}

/** The four required consent tick-boxes, identical across both enquiry forms. */
export function ConsentCheckboxes({ clinicName, values, onChange, error }: ConsentCheckboxesProps) {
  const wording = consentCheckboxWording(clinicName)
  const set = (key: keyof ConsentValues) => (checked: boolean | 'indeterminate') =>
    onChange({ ...values, [key]: checked === true })

  return (
    <div className="space-y-2.5">
      <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 leading-relaxed">
        {consentDisclaimer(clinicName)}
      </p>
      <label className="flex items-start gap-2 text-xs text-gray-600">
        <Checkbox checked={values.share} onCheckedChange={set('share')} className="mt-0.5" />
        <span>{wording.share}</span>
      </label>
      <label className="flex items-start gap-2 text-xs text-gray-600">
        <Checkbox checked={values.privacy} onCheckedChange={set('privacy')} className="mt-0.5" />
        <span>
          I have read and agree to the{' '}
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-900"
          >
            Privacy Policy
          </a>
          , which explains how Consentz uses my information and how I can withdraw my consent.
        </span>
      </label>
      <label className="flex items-start gap-2 text-xs text-gray-600">
        <Checkbox checked={values.age} onCheckedChange={set('age')} className="mt-0.5" />
        <span>{wording.age}</span>
      </label>
      <label className="flex items-start gap-2 text-xs text-gray-600">
        <Checkbox checked={values.terms} onCheckedChange={set('terms')} className="mt-0.5" />
        <span>
          I have read and agree to the Consentz{' '}
          <a
            href={TERMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-900"
          >
            Terms &amp; Conditions
          </a>
          .
        </span>
      </label>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
