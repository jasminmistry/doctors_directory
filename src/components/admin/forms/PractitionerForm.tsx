'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Award, ExternalLink, Plus, Save, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { Badge } from '@/components/ui/badge'
import { FormSection, Field } from './FormSection'
import { cn } from '@/lib/utils'

type PractitionerData = {
  slug: string
  displayName: string | null
  title: string | null
  specialty: string | null
  imageUrl: string | null
  qualifications: string[]
  awards: string[]
  roles: string[]
  media: string[]
  experience: string[]
  citySlug: string | null
  clinicId: number | null
}

type ClinicOption = {
  id: number
  name: string | null
  slug: string
  cityName: string | null
}

const EMPTY: PractitionerData = {
  slug: '', displayName: null, title: null, specialty: null, imageUrl: null,
  qualifications: [], awards: [], roles: [], media: [], experience: [], citySlug: null, clinicId: null,
}

function toStringArray(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter((v) => typeof v === 'string')
  if (typeof value === 'string') {
    try { const p = JSON.parse(value); if (Array.isArray(p)) return p } catch {}
  }
  return []
}

function StringArrayField({
  value,
  onChange,
  placeholder,
}: {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function add() {
    const trimmed = draft.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setDraft('')
    inputRef.current?.focus()
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="gap-1 pr-1 text-xs font-normal max-w-full"
            >
              <span className="truncate max-w-[220px]">{item}</span>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 focus:outline-none"
                aria-label={`Remove ${item}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 px-2.5 shrink-0"
          onClick={add}
          disabled={!draft.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

interface PractitionerFormProps {
  /** Override the fetch/save URL (portal use: '/directory/api/portal/practitioner'). Omit for admin. */
  fetchUrl?: string
  saveUrl?: string
  /** Portal mode: hides slug display and back navigation. */
  mode?: 'portal'
  /** When true, all fields are locked (e.g. pending ID verification). */
  disabled?: boolean
  /** Called after a successful save instead of navigating back to /admin/practitioners. */
  onSaved?: () => void
  /** Override the preview link href (portal: direct profile URL). */
  previewHref?: string
}

export function PractitionerForm({ fetchUrl, saveUrl, mode, disabled, onSaved, previewHref }: PractitionerFormProps = {}) {
  const [data, setData] = useState<PractitionerData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const [clinics, setClinics] = useState<ClinicOption[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const params = useParams()
  const slug = (params?.slug as string) ?? ''
  const isPortal = mode === 'portal'

  useEffect(() => {
    if (isPortal) return
    fetch('/directory/api/admin/clinics')
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((list) => {
        setClinics(
          Array.isArray(list)
            ? list
                .filter((c: any) => c.citySlug)
                .map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, cityName: c.cityName }))
            : []
        )
      })
      .catch(() => setClinics([]))
  }, [isPortal])

  useEffect(() => {
    if (fetchUrl) {
      fetch(fetchUrl)
        .then((r) => { if (!r.ok) throw new Error(); return r.json() })
        .then((d) => {
          setData({
            slug: d.slug ?? '',
            displayName: d.displayName ?? null,
            title: d.title ?? null,
            specialty: d.specialty ?? null,
            imageUrl: d.imageUrl ?? null,
            qualifications: toStringArray(d.qualifications),
            awards: toStringArray(d.awards),
            roles: toStringArray(d.roles),
            media: toStringArray(d.media),
            experience: toStringArray(d.experience),
            citySlug: d.citySlug ?? null,
            clinicId: d.clinicId ?? null,
          })
          setLoading(false)
        })
        .catch(() => setLoading(false))
      return
    }
    if (slug === 'new') {
      setIsNew(true)
      setLoading(false)
      return
    }
    fetch(`/directory/api/admin/practitioners/${slug}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((d) => {
        setData({
          slug: d.slug ?? '',
          displayName: d.displayName ?? null,
          title: d.title ?? null,
          specialty: d.specialty ?? null,
          imageUrl: d.imageUrl ?? null,
          qualifications: toStringArray(d.qualifications),
          awards: toStringArray(d.awards),
          roles: toStringArray(d.roles),
          media: toStringArray(d.media),
          experience: toStringArray(d.experience),
          citySlug: d.citySlug ?? null,
          clinicId: d.clinicId ?? null,
        })
        setLoading(false)
      })
      .catch(() => router.push('/admin/practitioners'))
  }, [fetchUrl, slug, router])

  function set<K extends keyof PractitionerData>(key: K, value: PractitionerData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key as string]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  async function handleSave() {
    if (!data.displayName?.trim()) { toast.error('Name is required'); return }
    if (isNew && !data.slug.trim()) { toast.error('Slug is required'); return }
    if (!isPortal && !data.clinicId) { toast.error('City is required'); return }
    const nextErrors: Record<string, string> = {}
    if (!data.displayName?.trim()) nextErrors.displayName = 'Display name is required'
    if (isNew && !data.slug.trim()) nextErrors.slug = 'Slug is required'
    else if (isNew && !/^[a-z0-9-]+$/.test(data.slug.trim())) {
      nextErrors.slug = 'Slug must be kebab-case'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      toast.error('Please fix the highlighted fields')
      return
    }

    setFieldErrors({})
    setSaving(true)
    const { slug: _s, ...rest } = data
    const body = isNew ? { slug: data.slug.trim(), ...rest } : rest
    const url = saveUrl ?? (isNew ? '/directory/api/admin/practitioners' : `/directory/api/admin/practitioners/${slug}`)
    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Practitioner saved')
        if (onSaved) {
          onSaved()
        } else {
          setTimeout(() => router.push('/admin/practitioners'), 300)
        }
      } else {
        const err = await res.json().catch(() => ({})) as {
          error?: string
          fieldErrors?: Record<string, string>
        }
        if (err.fieldErrors) setFieldErrors(err.fieldErrors)
        toast.error(err.error || 'Failed to save')
      }
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSkeleton />

  const title = isNew ? 'New Practitioner' : (data.displayName || data.slug || 'Edit Practitioner')

  return (
    <div className={cn('space-y-5', disabled && 'pointer-events-none opacity-60 select-none')}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {!isPortal && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => router.push('/admin/practitioners')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0">
            {!isPortal && <p className="text-xs text-gray-600 font-medium">Practitioners</p>}
            <h2 className="text-base font-semibold text-gray-900 truncate">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isNew && data.slug && (previewHref || data.citySlug ? (
            <a
              href={previewHref ?? `/directory/practitioners/${data.citySlug}/profile/${data.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Preview
              </Button>
            </a>
          ) : (
            <Button variant="outline" size="sm" disabled title="Set a city before previewing">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Preview
            </Button>
          ))}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Profile */}
      <FormSection title="Profile" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Display Name" required error={fieldErrors.displayName}>
            <Input
              value={data.displayName ?? ''}
              onChange={(e) => {
                set('displayName', e.target.value || null)
                if (isNew) {
                  set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                }
              }}
              placeholder="Dr. Jane Smith"
              className={cn(fieldErrors.displayName && 'border-red-500 focus-visible:ring-red-500')}
              aria-invalid={Boolean(fieldErrors.displayName)}
            />
          </Field>
          {!isPortal && (isNew ? (
            <Field label="Slug" required hint="Auto-filled from name — editable" error={fieldErrors.slug}>
              <Input
                value={data.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. dr-jane-smith"
                className={cn('font-mono', fieldErrors.slug && 'border-red-500 focus-visible:ring-red-500')}
                aria-invalid={Boolean(fieldErrors.slug)}
              />
            </Field>
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-xs text-gray-600 mb-1.5 font-medium">Slug</span>
              <code className="text-sm bg-gray-50 text-gray-600 px-3 py-2 rounded-lg border border-gray-200 font-mono">{data.slug}</code>
            </div>
          ))}
          {!isPortal && (
            <Field label="City" required hint="Determines the practitioner's public profile URL">
              <select
                value={data.clinicId ?? ''}
                onChange={(e) => set('clinicId', e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a city / clinic…</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.cityName} — {c.name || c.slug}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Title">
            <Input value={data.title ?? ''} onChange={(e) => set('title', e.target.value || null)} placeholder="e.g. Consultant Dermatologist" />
          </Field>
          <Field label="Specialty">
            <Input value={data.specialty ?? ''} onChange={(e) => set('specialty', e.target.value || null)} placeholder="e.g. Aesthetic Medicine" />
          </Field>
          {!isPortal && (
            <Field label="Image" fullWidth>
              <ImageUpload value={data.imageUrl ?? null} onChange={(url) => set('imageUrl', url)} shape="circle" />
            </Field>
          )}
        </div>
      </FormSection>

      {/* Credentials */}
      <FormSection title="Credentials" icon={Award}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Qualifications" hint='e.g. MBBS, FRCS'>
            <StringArrayField
              value={data.qualifications}
              onChange={(v) => set('qualifications', v)}
              placeholder="Add qualification…"
            />
          </Field>
          <Field label="Awards" hint='e.g. Best Clinic 2023'>
            <StringArrayField
              value={data.awards}
              onChange={(v) => set('awards', v)}
              placeholder="Add award…"
            />
          </Field>
          <Field label="Roles" hint='e.g. Clinical Lead, Trainer'>
            <StringArrayField
              value={data.roles}
              onChange={(v) => set('roles', v)}
              placeholder="Add role…"
            />
          </Field>
        </div>
      </FormSection>

      {/* Experience & Media */}
      <FormSection title="Experience & Media">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Experience" hint='e.g. 10 years in aesthetics'>
            <StringArrayField
              value={data.experience}
              onChange={(v) => set('experience', v)}
              placeholder="Add experience…"
            />
          </Field>
          <Field label="Media URLs" hint='Links to videos, articles, etc.'>
            <StringArrayField
              value={data.media}
              onChange={(v) => set('media', v)}
              placeholder="https://…"
            />
          </Field>
        </div>
      </FormSection>

      <div className="flex justify-end pt-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Saving…' : 'Save Practitioner'}
        </Button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
        <div className="space-y-1">
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-9 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
