'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

export interface AdminFormProps {
  entityType: 'clinics' | 'practitioners' | 'products' | 'treatments'
  apiBasePath: string
  redirectPath: string
}

const SYSTEM_FIELDS = new Set(['id', 'createdAt', 'updatedAt', 'cityId', 'clinicId'])
const READONLY_FIELDS = new Set(['slug'])

const FIELD_LABELS: Record<string, string> = {
  gmapsUrl: 'Google Maps URL',
  gmapsAddress: 'Address',
  gmapsPhone: 'Phone',
  aboutSection: 'About',
  reviewCount: 'Review Count',
  isSaveFace: 'Save Face',
  isDoctor: 'Doctor',
  isJccp: 'JCCP',
  jccpUrl: 'JCCP URL',
  isCqc: 'CQC',
  cqcUrl: 'CQC URL',
  isHiw: 'HIW',
  hiwUrl: 'HIW URL',
  isHis: 'HIS',
  hisUrl: 'HIS URL',
  isRqia: 'RQIA',
  rqiaUrl: 'RQIA URL',
  xTwitter: 'X / Twitter',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  displayName: 'Display Name',
  imageUrl: 'Image URL',
  image_url: 'Image URL',
  product_name: 'Product Name',
  product_category: 'Category',
  product_subcategory: 'Subcategory',
  brand_about: 'Brand About',
  seller_about: 'Seller About',
  mhra_approved: 'MHRA Approved',
  ce_marked: 'CE Marked',
  mhra_link: 'MHRA Link',
  key_benefits: 'Key Benefits',
  usage_instructions: 'Usage Instructions',
  treatment_duration: 'Treatment Duration',
  onset_of_effect: 'Onset of Effect',
  adverse_effects: 'Adverse Effects',
  storage_conditions: 'Storage Conditions',
  certifications_and_compliance: 'Certifications & Compliance',
  verification_sources: 'Verification Sources',
  data_confidence_score: 'Data Confidence Score',
  source_verified_on: 'Source Verified On',
  product_document_pdf_from_manufacturer: 'Product PDF',
}

function humanize(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (s) => s.toUpperCase())
}

function isRelation(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0 && typeof value[0] === 'object' && value[0] !== null && 'id' in (value[0] as object)
  }
  if (typeof value === 'object' && value !== null) {
    return 'id' in (value as object)
  }
  return false
}

function FieldInput({
  fieldKey, value, onChange,
}: {
  fieldKey: string
  value: unknown
  onChange: (v: unknown) => void
}) {
  if (typeof value === 'boolean') {
    return (
      <div className="flex items-center gap-2 h-9">
        <Checkbox
          id={fieldKey}
          checked={value}
          onCheckedChange={(checked) => onChange(!!checked)}
        />
      </div>
    )
  }

  if (typeof value === 'number') {
    return (
      <Input
        id={fieldKey}
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 text-sm"
      />
    )
  }

  if (typeof value === 'string' && value.length > 200) {
    return (
      <Textarea
        id={fieldKey}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm min-h-[120px] resize-y"
      />
    )
  }

  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return (
      <Textarea
        id={fieldKey}
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try { onChange(JSON.parse(e.target.value)) } catch { onChange(e.target.value) }
        }}
        className="text-sm font-mono min-h-[100px] resize-y"
      />
    )
  }

  return (
    <Input
      id={fieldKey}
      value={value == null ? '' : String(value)}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 text-sm"
    />
  )
}

export default function AdminForm({ entityType, apiBasePath, redirectPath }: AdminFormProps) {
  const [entity, setEntity] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string

  useEffect(() => {
    if (slug === 'new') {
      setIsNew(true)
      setLoading(false)
      return
    }
    fetch(`/directory/api/admin/${entityType}/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => { setEntity(data); setLoading(false) })
      .catch(() => router.push(`/admin/${entityType}`))
  }, [slug, entityType, router])

  function handleChange(key: string, value: unknown) {
    setEntity((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit() {
    setSaving(true)
    const url = isNew
      ? `/directory/api/admin/${entityType}`
      : `${apiBasePath}/${slug}`
    const method = isNew ? 'POST' : 'PUT'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entity),
      })
      if (res.ok) {
        toast.success('Saved successfully')
        const destination = searchParams.get('returnTo') || redirectPath
        setTimeout(() => router.push(destination), 350)
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

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-9 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  const slugValue = entity.slug as string | undefined
  const visibleEntries = Object.entries(entity).filter(([key, value]) => {
    if (SYSTEM_FIELDS.has(key)) return false
    if (READONLY_FIELDS.has(key)) return false
    if (isRelation(value)) return false
    return true
  })

  const title = isNew
    ? `New ${entityType.slice(0, -1)}`
    : `Edit: ${(entity.slug ?? entity.name ?? entity.displayName ?? entity.practitioner_name ?? slug) as string}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(redirectPath)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {slugValue && (
          <div className="mb-5 pb-5 border-b border-gray-100">
            <Label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Slug</Label>
            <p className="mt-1 text-sm font-mono text-gray-600 bg-gray-50 rounded px-2 py-1.5 border border-gray-200">{slugValue}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {visibleEntries.map(([key, value]) => (
            <div
              key={key}
              className={
                typeof value === 'string' && value.length > 200
                  ? 'md:col-span-2'
                  : Array.isArray(value) || (typeof value === 'object' && value !== null && typeof value !== 'boolean')
                    ? 'md:col-span-2'
                    : ''
              }
            >
              <Label htmlFor={key} className="text-sm font-medium text-gray-700 mb-1.5 block">
                {humanize(key)}
              </Label>
              <FieldInput fieldKey={key} value={value} onChange={(v) => handleChange(key, v)} />
            </div>
          ))}
          {visibleEntries.length === 0 && !isNew && (
            <p className="md:col-span-2 text-sm text-gray-400">No editable fields found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
