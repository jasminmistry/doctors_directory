'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Award, Plus, Save, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FormSection, Field } from './FormSection'

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
}

const EMPTY: PractitionerData = {
  slug: '', displayName: null, title: null, specialty: null, imageUrl: null,
  qualifications: [], awards: [], roles: [], media: [], experience: [],
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

export function PractitionerForm() {
  const [data, setData] = useState<PractitionerData>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string

  useEffect(() => {
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
        })
        setLoading(false)
      })
      .catch(() => router.push('/admin/practitioners'))
  }, [slug, router])

  function set<K extends keyof PractitionerData>(key: K, value: PractitionerData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!data.displayName?.trim()) { toast.error('Name is required'); return }
    if (isNew && !data.slug.trim()) { toast.error('Slug is required'); return }

    setSaving(true)
    const { slug: _s, ...rest } = data
    const body = isNew ? { slug: data.slug.trim(), ...rest } : rest
    const url = isNew ? '/directory/api/admin/practitioners' : `/directory/api/admin/practitioners/${slug}`
    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Practitioner saved')
        setTimeout(() => router.push('/admin/practitioners'), 300)
      } else {
        const err = await res.json().catch(() => ({}))
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => router.push('/admin/practitioners')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium">Practitioners</p>
            <h2 className="text-base font-semibold text-gray-900 truncate">{title}</h2>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className="shrink-0">
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Profile */}
      <FormSection title="Profile" icon={User}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Display Name" required>
            <Input
              value={data.displayName ?? ''}
              onChange={(e) => {
                set('displayName', e.target.value || null)
                if (isNew) {
                  set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                }
              }}
              placeholder="Dr. Jane Smith"
            />
          </Field>
          {isNew ? (
            <Field label="Slug" required hint="Auto-filled from name — editable">
              <Input
                value={data.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. dr-jane-smith"
                className="font-mono"
              />
            </Field>
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-xs text-gray-400 mb-1.5 font-medium">Slug</span>
              <code className="text-sm bg-gray-50 text-gray-600 px-3 py-2 rounded-md border border-gray-200 font-mono">{data.slug}</code>
            </div>
          )}
          <Field label="Title">
            <Input value={data.title ?? ''} onChange={(e) => set('title', e.target.value || null)} placeholder="e.g. Consultant Dermatologist" />
          </Field>
          <Field label="Specialty">
            <Input value={data.specialty ?? ''} onChange={(e) => set('specialty', e.target.value || null)} placeholder="e.g. Aesthetic Medicine" />
          </Field>
          <Field label="Image URL" fullWidth>
            <div className="flex gap-3 items-start">
              <Input
                value={data.imageUrl ?? ''}
                onChange={(e) => set('imageUrl', e.target.value || null)}
                placeholder="https://…"
                className="flex-1"
              />
              {data.imageUrl && (
                <img src={data.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
            </div>
          </Field>
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
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
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
