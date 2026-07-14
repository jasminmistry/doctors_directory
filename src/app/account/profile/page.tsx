'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Loader2, Trash2, Mail, Phone, Calendar, User, CheckCircle2, AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDobValidationError, maxDobDate } from '@/lib/dob'

interface PatientProfile {
  id: number
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  dateOfBirth: string | null
  createdAt: string
}

const UK_PHONE_RE = /^(\+44|0)[0-9]{9,10}$/

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}

function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <span className="inline-block h-1 w-1 rounded-full bg-red-500 shrink-0" />
          {error}
        </p>
      )}
      {!error && hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  )
}

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  hasError?: boolean
}

function IconInput({ icon, hasError, className, ...props }: IconInputProps) {
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
          hasError
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-gray-200 focus:border-gray-400 focus:ring-gray-100',
          props.readOnly && 'bg-gray-50 text-gray-500 cursor-default',
          className,
        )}
      />
    </div>
  )
}

function ProfileCompleteness({ profile, dob }: { profile: PatientProfile; dob: string }) {
  const fields = [
    { label: 'First name', filled: !!profile.firstName },
    { label: 'Last name', filled: !!profile.lastName },
    { label: 'Phone', filled: !!profile.phone },
    { label: 'Date of birth', filled: !!dob && !getDobValidationError(dob) },
  ]
  const filled = fields.filter((f) => f.filled).length
  const total = fields.length
  const complete = filled === total

  return (
    <div className={cn(
      'flex items-start gap-3 rounded-lg border px-4 py-3.5',
      complete ? 'border-green-100 bg-green-50' : 'border-amber-100 bg-amber-50',
    )}>
      {complete
        ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
        : <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
      }
      <div className="min-w-0">
        <p className={cn('text-xs font-medium', complete ? 'text-green-800' : 'text-amber-800')}>
          {complete ? 'Profile complete' : `Profile ${Math.round((filled / total) * 100)}% complete`}
        </p>
        <p className={cn('text-[11px] mt-0.5 leading-relaxed', complete ? 'text-green-700' : 'text-amber-700')}>
          {complete
            ? 'Consultation forms will be pre-filled with your details.'
            : `Missing: ${fields.filter((f) => !f.filled).map((f) => f.label).join(', ')}. Complete your profile to skip these fields in consultation forms.`
          }
        </p>
      </div>
    </div>
  )
}

export default function AccountProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [dobError, setDobError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    fetch('/directory/api/patient/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((data: PatientProfile | null) => {
        if (!data) return
        setProfile(data)
        setFirstName(data.firstName ?? '')
        setLastName(data.lastName ?? '')
        setPhone(data.phone ?? '')
        setDateOfBirth(data.dateOfBirth ?? '')
      })
  }, [])

  function markDirty() {
    if (!isDirty) setIsDirty(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setPhoneError('')
    setDobError('')

    if (phone) {
      const clean = phone.replace(/\s/g, '')
      if (!UK_PHONE_RE.test(clean)) {
        setPhoneError('Enter a valid UK number — e.g. 07700 900000 or +447700 900000')
        return
      }
    }

    if (dateOfBirth) {
      const dobMessage = getDobValidationError(dateOfBirth)
      if (dobMessage) {
        setDobError(dobMessage)
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch('/directory/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
          phone: phone.replace(/\s/g, '') || null,
          dateOfBirth: dateOfBirth || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const message = typeof data?.error === 'string' ? data.error : 'Failed to save — please try again'
        if (message.toLowerCase().includes('phone')) {
          setPhoneError(message)
        } else if (message.toLowerCase().includes('date of birth') || message.toLowerCase().includes('18 or over')) {
          setDobError(message)
        } else {
          toast.error(message)
        }
        return
      }
      const updated = await res.json() as PatientProfile
      setProfile((p) => p ? { ...p, ...updated } : p)
      setIsDirty(false)
      toast.success('Profile saved')
    } catch {
      toast.error('Failed to save — please try again')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await fetch('/directory/api/patient/profile', { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Account deleted')
      window.location.href = '/directory'
    } catch {
      toast.error('Failed to delete — please try again')
      setDeleting(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Details saved here pre-fill consultation request forms automatically.
        </p>
      </div>

      {/* Completeness badge */}
      <ProfileCompleteness profile={{ ...profile, firstName, lastName, phone, dateOfBirth }} dob={dateOfBirth} />

      {/* Personal details form */}
      <form onSubmit={handleSave} noValidate className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Personal details</p>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <IconInput
                icon={<User className="h-3.5 w-3.5" />}
                placeholder="Jane"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); markDirty() }}
                autoComplete="given-name"
              />
            </Field>
            <Field label="Last name">
              <IconInput
                placeholder="Smith"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); markDirty() }}
                autoComplete="family-name"
              />
            </Field>
          </div>

          {/* Email — read-only */}
          <Field label="Email address" hint="Your email address cannot be changed">
            <IconInput
              icon={<Mail className="h-3.5 w-3.5" />}
              value={profile.email}
              readOnly
              tabIndex={-1}
            />
          </Field>

          {/* Phone */}
          <Field label="Phone number" error={phoneError} hint="UK numbers only — e.g. 07700 900000">
            <IconInput
              icon={<Phone className="h-3.5 w-3.5" />}
              type="tel"
              placeholder="07700 900000"
              value={phone}
              hasError={!!phoneError}
              onChange={(e) => { setPhone(e.target.value); setPhoneError(''); markDirty() }}
              autoComplete="tel"
            />
          </Field>

          {/* Date of birth */}
          <Field
            label="Date of birth"
            error={dobError}
            hint="You must be 18 or over to request consultations"
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Calendar className="h-3.5 w-3.5" />
              </span>
              <input
                type="date"
                max={maxDobDate()}
                value={dateOfBirth}
                onChange={(e) => { setDateOfBirth(e.target.value); setDobError(''); markDirty() }}
                className={cn(
                  'w-full rounded-lg border bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900 transition-colors focus:outline-none focus:ring-2',
                  dobError
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-200 focus:border-gray-400 focus:ring-gray-100',
                )}
              />
            </div>
          </Field>
        </div>

        <div className="px-5 py-4 flex items-center gap-3">
          <Button
            type="submit"
            disabled={saving || !isDirty}
            className="h-9 px-5 text-sm"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
          </Button>
          {isDirty && !saving && (
            <p className="text-xs text-amber-600">You have unsaved changes</p>
          )}
          {!isDirty && !saving && (
            <p className="text-xs text-gray-400">All changes saved</p>
          )}
        </div>
      </form>

      {/* GDPR delete */}
      <div className="rounded-xl border border-red-200 bg-red-50 divide-y divide-red-100">
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-400">Danger zone</p>
        </div>
        <div className="px-5 py-5 space-y-3">
          <div>
            <p className="text-sm font-medium text-red-700">Delete account</p>
            <p className="text-xs text-red-500/80 mt-1 leading-relaxed">
              Permanently delete your account and anonymise all associated bookings and consultations. This cannot be undone.
            </p>
          </div>
          {!confirmDelete ? (
            <Button
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400 hover:text-red-700"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete my account
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white border-0"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Yes, delete permanently'}
              </Button>
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
