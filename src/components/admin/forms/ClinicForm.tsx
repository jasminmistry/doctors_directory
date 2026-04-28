'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Building2, ExternalLink, MapPin, Star, Share2, ShieldCheck, FileText, Save, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FormSection, Field } from './FormSection'

type ClinicData = {
  slug: string
  citySlug: string | null
  name: string | null
  image: string | null
  gmapsUrl: string | null
  gmapsAddress: string | null
  gmapsPhone: string | null
  category: string | null
  rating: number | null
  reviewCount: number | null
  aboutSection: string | null
  accreditations: string | null
  awards: string | null
  affiliations: string | null
  website: string | null
  email: string | null
  facebook: string | null
  twitter: string | null
  xTwitter: string | null
  instagram: string | null
  youtube: string | null
  linkedin: string | null
  isSaveFace: boolean
  isDoctor: boolean
  isJccp: boolean | null
  jccpUrl: string | null
  isCqc: boolean | null
  cqcUrl: string | null
  isHiw: boolean | null
  hiwUrl: string | null
  isHis: boolean | null
  hisUrl: string | null
  isRqia: boolean | null
  rqiaUrl: string | null
}

const EMPTY: ClinicData = {
  slug: '', citySlug: null, name: null, image: null, gmapsUrl: null, gmapsAddress: null, gmapsPhone: null,
  category: null, rating: null, reviewCount: null, aboutSection: null, accreditations: null,
  awards: null, affiliations: null, website: null, email: null, facebook: null, twitter: null,
  xTwitter: null, instagram: null, youtube: null, linkedin: null,
  isSaveFace: false, isDoctor: false, isJccp: null, jccpUrl: null, isCqc: null, cqcUrl: null,
  isHiw: null, hiwUrl: null, isHis: null, hisUrl: null, isRqia: null, rqiaUrl: null,
}

const REG_FLAGS = [
  { key: 'isJccp' as const, urlKey: 'jccpUrl' as const, label: 'JCCP' },
  { key: 'isCqc' as const, urlKey: 'cqcUrl' as const, label: 'CQC' },
  { key: 'isHiw' as const, urlKey: 'hiwUrl' as const, label: 'HIW' },
  { key: 'isHis' as const, urlKey: 'hisUrl' as const, label: 'HIS' },
  { key: 'isRqia' as const, urlKey: 'rqiaUrl' as const, label: 'RQIA' },
]

export function ClinicForm() {
  const [data, setData] = useState<ClinicData>(EMPTY)
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
    fetch(`/directory/api/admin/clinics/${slug}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((d) => {
        if (!d.name) {
          d.name = d.slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        }
        setData(d)
        setLoading(false)
      })
      .catch(() => router.push('/admin/clinics'))
  }, [slug, router])

  function set<K extends keyof ClinicData>(key: K, value: ClinicData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!data.name?.trim()) { toast.error('Name is required'); return }
    if (isNew && !data.slug.trim()) { toast.error('Slug is required'); return }

    setSaving(true)
    const { slug: _s, ...rest } = data
    const body = isNew ? { slug: data.slug.trim(), ...rest } : rest
    const url = isNew ? '/directory/api/admin/clinics' : `/directory/api/admin/clinics/${slug}`
    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Clinic saved')
        setTimeout(() => router.push('/admin/clinics'), 300)
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

  const title = isNew ? 'New Clinic' : (data.name || data.slug || 'Edit Clinic')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => router.push('/admin/clinics')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium">Clinics</p>
            <h2 className="text-base font-semibold text-gray-900 truncate">{title}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isNew && (
            <a
              href={
                data.citySlug
                  ? `/directory/clinics/${data.citySlug}/clinic/${data.slug}`
                  : `/directory/search?type=Clinic&q=${encodeURIComponent(data.name || data.slug)}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Preview
              </Button>
            </a>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Basic Info */}
      <FormSection title="Basic Info" icon={Building2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Clinic Name" required>
            <div className="flex gap-2">
              <Input
                value={data.name ?? ''}
                onChange={(e) => {
                  set('name', e.target.value || null)
                  if (isNew) {
                    set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                  }
                }}
                placeholder="e.g. The Dermatology Clinic"
                className="flex-1"
              />
              {!data.name && data.slug && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-9"
                  title="Fill name from slug"
                  onClick={() => set('name', data.slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </Field>
          {isNew ? (
            <Field label="Slug" required hint="Auto-filled from name — editable">
              <Input
                value={data.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. the-dermatology-clinic"
                className="font-mono"
              />
            </Field>
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-xs text-gray-400 mb-1.5 font-medium">Slug</span>
              <code className="text-sm bg-gray-50 text-gray-600 px-3 py-2 rounded-md border border-gray-200 font-mono">{data.slug}</code>
            </div>
          )}
          <Field label="Category">
            <Input value={data.category ?? ''} onChange={(e) => set('category', e.target.value || null)} placeholder="e.g. Aesthetics" />
          </Field>
          <Field label="Image URL" fullWidth>
            <div className="flex gap-3 items-start">
              <Input
                value={data.image ?? ''}
                onChange={(e) => set('image', e.target.value || null)}
                placeholder="https://…"
                className="flex-1"
              />
              {data.image && (
                <img src={data.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
            </div>
          </Field>
        </div>
      </FormSection>

      {/* Location & Contact */}
      <FormSection title="Location & Contact" icon={MapPin}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Address" fullWidth>
            <Input value={data.gmapsAddress ?? ''} onChange={(e) => set('gmapsAddress', e.target.value || null)} placeholder="123 Harley Street, London" />
          </Field>
          <Field label="Phone">
            <Input value={data.gmapsPhone ?? ''} onChange={(e) => set('gmapsPhone', e.target.value || null)} placeholder="+44 20 0000 0000" />
          </Field>
          <Field label="Google Maps URL">
            <Input value={data.gmapsUrl ?? ''} onChange={(e) => set('gmapsUrl', e.target.value || null)} placeholder="https://maps.google.com/…" />
          </Field>
          <Field label="Website">
            <Input value={data.website ?? ''} onChange={(e) => set('website', e.target.value || null)} placeholder="https://…" />
          </Field>
          <Field label="Email">
            <Input type="email" value={data.email ?? ''} onChange={(e) => set('email', e.target.value || null)} placeholder="info@clinic.com" />
          </Field>
        </div>
      </FormSection>

      {/* Reputation */}
      <FormSection title="Reputation" icon={Star}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Rating">
            <Input type="number" min={0} max={5} step={0.1} value={data.rating ?? ''} onChange={(e) => set('rating', e.target.value ? Number(e.target.value) : null)} placeholder="4.8" />
          </Field>
          <Field label="Review Count">
            <Input type="number" min={0} value={data.reviewCount ?? ''} onChange={(e) => set('reviewCount', e.target.value ? Number(e.target.value) : null)} placeholder="124" />
          </Field>
          <Field label="About" fullWidth>
            <Textarea value={data.aboutSection ?? ''} onChange={(e) => set('aboutSection', e.target.value || null)} placeholder="Brief description of the clinic…" className="min-h-[100px]" />
          </Field>
        </div>
      </FormSection>

      {/* Content */}
      <FormSection title="Content" icon={FileText}>
        <div className="grid grid-cols-1 gap-5">
          <Field label="Accreditations">
            <Textarea value={data.accreditations ?? ''} onChange={(e) => set('accreditations', e.target.value || null)} placeholder="List of accreditations…" className="min-h-[80px]" />
          </Field>
          <Field label="Awards">
            <Textarea value={data.awards ?? ''} onChange={(e) => set('awards', e.target.value || null)} placeholder="Awards and recognitions…" className="min-h-[80px]" />
          </Field>
          <Field label="Affiliations">
            <Textarea value={data.affiliations ?? ''} onChange={(e) => set('affiliations', e.target.value || null)} placeholder="Professional affiliations…" className="min-h-[80px]" />
          </Field>
        </div>
      </FormSection>

      {/* Social Media */}
      <FormSection title="Social Media" icon={Share2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: 'facebook' as const, label: 'Facebook', placeholder: 'https://facebook.com/…' },
            { key: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/…' },
            { key: 'twitter' as const, label: 'Twitter', placeholder: 'https://twitter.com/…' },
            { key: 'xTwitter' as const, label: 'X (Twitter)', placeholder: 'https://x.com/…' },
            { key: 'youtube' as const, label: 'YouTube', placeholder: 'https://youtube.com/…' },
            { key: 'linkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/…' },
          ].map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <Input value={data[key] ?? ''} onChange={(e) => set(key, e.target.value || null)} placeholder={placeholder} />
            </Field>
          ))}
        </div>
      </FormSection>

      {/* Regulatory */}
      <FormSection title="Regulatory Flags" icon={ShieldCheck} description="Certifications and regulatory body memberships">
        <div className="space-y-4">
          <div className="flex items-center gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={data.isSaveFace} onCheckedChange={(v) => set('isSaveFace', !!v)} />
              <span className="text-sm font-medium text-gray-700">Save Face</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={data.isDoctor} onCheckedChange={(v) => set('isDoctor', !!v)} />
              <span className="text-sm font-medium text-gray-700">Doctor</span>
            </label>
          </div>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
            {REG_FLAGS.map(({ key, urlKey, label }) => (
              <div key={key} className="flex items-center gap-4 px-4 py-3 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <label className="flex items-center gap-2 cursor-pointer w-24 shrink-0">
                  <Checkbox checked={data[key] ?? false} onCheckedChange={(v) => set(key, v ? true : null)} />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </label>
                <Input
                  value={data[urlKey] ?? ''}
                  onChange={(e) => set(urlKey, e.target.value || null)}
                  placeholder={`${label} profile URL`}
                  className="h-8 text-sm flex-1"
                />
              </div>
            ))}
          </div>
        </div>
      </FormSection>

      {/* Footer save */}
      <div className="flex justify-end pt-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Saving…' : 'Save Clinic'}
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
          <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
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
