'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Stethoscope, FileText, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormSection, Field } from './FormSection'
import { JsonFieldEditor } from './JsonFieldEditor'

type TreatmentData = {
  slug: string
  name: string
  description: string | null
  goals: unknown
  prosAndCons: unknown
  cost: unknown
  choosingDoctor: unknown
  alternatives: unknown
  goodCandidate: unknown
  preparation: unknown
  safetyAndPain: unknown
  howLongResultsLast: unknown
  mildVsSevere: unknown
  whatHappensDuring: unknown
  recovery: unknown
  regulation: unknown
  maintenance: unknown
  qualifications: unknown
  niceGuidelines: unknown
}

const EMPTY: TreatmentData = {
  slug: '', name: '', description: null, goals: null, prosAndCons: null, cost: null,
  choosingDoctor: null, alternatives: null, goodCandidate: null, preparation: null,
  safetyAndPain: null, howLongResultsLast: null, mildVsSevere: null, whatHappensDuring: null,
  recovery: null, regulation: null, maintenance: null, qualifications: null, niceGuidelines: null,
}

const RICH_FIELDS: { key: keyof TreatmentData; label: string; hint: string }[] = [
  { key: 'goals', label: 'Goals', hint: 'Typically a list of goal strings' },
  { key: 'prosAndCons', label: 'Pros & Cons', hint: 'Object with "pros" and "cons" arrays' },
  { key: 'cost', label: 'Cost', hint: 'Object with "typicalCosts" and "whyItVaries" keys' },
  { key: 'choosingDoctor', label: 'Choosing a Doctor', hint: 'List of advice strings' },
  { key: 'alternatives', label: 'Alternatives', hint: 'List of alternative treatment names' },
  { key: 'goodCandidate', label: 'Good Candidate', hint: 'Object with "typical", "notIdeal", "notes" keys' },
  { key: 'preparation', label: 'Preparation', hint: 'List of preparation steps' },
  { key: 'safetyAndPain', label: 'Safety & Pain', hint: 'Object with "safety" and "pain" keys' },
  { key: 'howLongResultsLast', label: 'How Long Results Last', hint: 'Plain text or object with "duration" key' },
  { key: 'mildVsSevere', label: 'Mild vs Severe', hint: 'Object with "mildCases", "severeCases", "limitations" keys' },
  { key: 'whatHappensDuring', label: 'What Happens During', hint: 'Plain text or list of steps' },
  { key: 'recovery', label: 'Recovery', hint: 'Object with "recovery" and "sideEffects" keys' },
  { key: 'regulation', label: 'Regulation', hint: 'List of regulatory notes or object with details' },
  { key: 'maintenance', label: 'Maintenance', hint: 'Plain text or object with "maintenance" key' },
  { key: 'qualifications', label: 'Qualifications Required', hint: 'List of qualification strings' },
  { key: 'niceGuidelines', label: 'NICE Guidelines', hint: 'Object with "UK" and/or "USA" keys' },
]

export function TreatmentForm() {
  const [data, setData] = useState<TreatmentData>(EMPTY)
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
    fetch(`/directory/api/admin/treatments/${slug}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => router.push('/admin/treatments'))
  }, [slug, router])

  function set<K extends keyof TreatmentData>(key: K, value: TreatmentData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!data.name.trim()) { toast.error('Name is required'); return }
    if (isNew && !data.slug.trim()) { toast.error('Slug is required'); return }

    setSaving(true)
    const url = isNew
      ? '/directory/api/admin/treatments'
      : `/directory/api/admin/treatments/${slug}`

    const body: Record<string, unknown> = {
      name: data.name,
      description: data.description,
      goals: data.goals,
      prosAndCons: data.prosAndCons,
      cost: data.cost,
      choosingDoctor: data.choosingDoctor,
      alternatives: data.alternatives,
      goodCandidate: data.goodCandidate,
      preparation: data.preparation,
      safetyAndPain: data.safetyAndPain,
      howLongResultsLast: data.howLongResultsLast,
      mildVsSevere: data.mildVsSevere,
      whatHappensDuring: data.whatHappensDuring,
      recovery: data.recovery,
      regulation: data.regulation,
      maintenance: data.maintenance,
      qualifications: data.qualifications,
      niceGuidelines: data.niceGuidelines,
    }
    if (isNew) body.slug = data.slug.trim()

    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Treatment saved')
        setTimeout(() => router.push('/admin/treatments'), 300)
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

  const title = isNew ? 'New Treatment' : (data.name || data.slug || 'Edit Treatment')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => router.push('/admin/treatments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium">Treatments</p>
            <h2 className="text-base font-semibold text-gray-900 truncate">{title}</h2>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className="shrink-0">
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Basic Info */}
      <FormSection title="Basic Info" icon={Stethoscope}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Name" required>
            <Input
              value={data.name}
              onChange={(e) => {
                set('name', e.target.value)
                if (isNew) {
                  set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                }
              }}
              placeholder="e.g. Botox"
            />
          </Field>

          {isNew ? (
            <Field label="Slug" required hint="Auto-filled from name — editable">
              <Input
                value={data.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. botox"
                className="font-mono"
              />
            </Field>
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-xs text-gray-400 mb-1.5 font-medium">Slug</span>
              <code className="text-sm bg-gray-50 text-gray-600 px-3 py-2 rounded-md border border-gray-200 font-mono">{data.slug}</code>
            </div>
          )}

          <Field label="Description" fullWidth>
            <Textarea
              value={data.description ?? ''}
              onChange={(e) => set('description', e.target.value || null)}
              placeholder="Overview of the treatment…"
              className="min-h-[100px]"
            />
          </Field>
        </div>
      </FormSection>

      {/* Rich content fields */}
      <FormSection
        title="Rich Content"
        icon={FileText}
        description="Each field is displayed as a section on the public treatment page. Use the visual editor or switch to Raw JSON for complex structures."
      >
        <div className="divide-y divide-gray-100">
          {RICH_FIELDS.map(({ key, label, hint }) => (
            <div key={key} className="py-5 first:pt-0 last:pb-0">
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
              </div>
              <JsonFieldEditor
                value={data[key]}
                onChange={(v) => set(key, v as TreatmentData[typeof key])}
              />
            </div>
          ))}
        </div>
      </FormSection>

      <div className="flex justify-end pt-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Saving…' : 'Save Treatment'}
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-9 bg-gray-100 rounded animate-pulse" />
          <div className="h-9 bg-gray-100 rounded animate-pulse" />
          <div className="col-span-2 h-20 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2 py-4 border-t border-gray-100 first:border-0 first:pt-0">
            <div className="h-3.5 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-20 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
