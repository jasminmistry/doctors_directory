'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, User, Award, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormSection, Field } from './FormSection'

type PractitionerData = {
  slug: string
  displayName: string | null
  title: string | null
  specialty: string | null
  imageUrl: string | null
  qualifications: unknown
  awards: unknown
  roles: unknown
  media: unknown
  experience: unknown
}

const EMPTY: PractitionerData = {
  slug: '', displayName: null, title: null, specialty: null, imageUrl: null,
  qualifications: null, awards: null, roles: null, media: null, experience: null,
}

function toJsonText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

function fromJsonText(text: string): unknown {
  if (!text.trim()) return null
  try { return JSON.parse(text) } catch { return text }
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
      .then((d) => { setData(d); setLoading(false) })
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
          <Field label="Image URL">
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
      <FormSection title="Credentials" icon={Award} description={'Enter as JSON arrays, e.g. ["MBBS", "FRCS"]'}>
        <div className="grid grid-cols-1 gap-5">
          {[
            { key: 'qualifications' as const, label: 'Qualifications', placeholder: '["MBBS", "FRCS"]' },
            { key: 'awards' as const, label: 'Awards', placeholder: '["Best Clinic 2023"]' },
            { key: 'roles' as const, label: 'Roles', placeholder: '["Clinical Lead", "Trainer"]' },
          ].map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Textarea
                value={toJsonText(data[key])}
                onChange={(e) => set(key, fromJsonText(e.target.value))}
                placeholder={placeholder}
                className="font-mono text-sm min-h-[80px]"
              />
            </Field>
          ))}
        </div>
      </FormSection>

      {/* Experience & Media */}
      <FormSection title="Experience & Media" description="Additional profile content as JSON arrays">
        <div className="grid grid-cols-1 gap-5">
          {[
            { key: 'experience' as const, label: 'Experience', placeholder: '["10 years in aesthetics", "Former NHS consultant"]' },
            { key: 'media' as const, label: 'Media', placeholder: '["https://example.com/video"]' },
          ].map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Textarea
                value={toJsonText(data[key])}
                onChange={(e) => set(key, fromJsonText(e.target.value))}
                placeholder={placeholder}
                className="font-mono text-sm min-h-[80px]"
              />
            </Field>
          ))}
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
