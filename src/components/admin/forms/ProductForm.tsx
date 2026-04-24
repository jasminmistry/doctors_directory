'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Package, FileText, FlaskConical, ShieldCheck, Save, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FormSection, Field } from './FormSection'

type ProductData = {
  slug: string
  productName: string
  productCategory: string | null
  productSubcategory: string | null
  category: string | null
  brand: string | null
  manufacturer: string | null
  distributor: string | null
  distributorCleaned: string | null
  sku: string | null
  imageUrl: string | null
  documentPdfUrl: string | null
  description: string | null
  treatmentDuration: string | null
  onsetOfEffect: string | null
  mhraApproved: string | null
  ceMarked: string | null
  mhraLink: string | null
  brandAbout: string | null
  sellerAbout: string | null
  isAestheticsDermatologyRelated: boolean | null
  keyBenefits: string[] | null
  indications: string[] | null
  composition: string[] | null
  formulation: string[] | null
  packaging: string[] | null
  usageInstructions: string[] | null
  contraindications: string[] | null
  adverseEffects: string[] | null
  storageConditions: string[] | null
  certifications: string[] | null
  verificationSources: string[] | null
  allPrices: unknown
}

const EMPTY: ProductData = {
  slug: '', productName: '', productCategory: null, productSubcategory: null, category: null,
  brand: null, manufacturer: null, distributor: null, distributorCleaned: null, sku: null,
  imageUrl: null, documentPdfUrl: null, description: null, treatmentDuration: null,
  onsetOfEffect: null, mhraApproved: null, ceMarked: null, mhraLink: null, brandAbout: null,
  sellerAbout: null, isAestheticsDermatologyRelated: null, keyBenefits: null, indications: null,
  composition: null, formulation: null, packaging: null, usageInstructions: null,
  contraindications: null, adverseEffects: null, storageConditions: null, certifications: null,
  verificationSources: null, allPrices: null,
}

function TagListField({
  value, onChange, placeholder,
}: { value: string[] | null; onChange: (v: string[] | null) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('')
  const items = value ?? []

  function add() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...items, trimmed])
    setDraft('')
  }

  function remove(i: number) {
    const next = items.filter((_, idx) => idx !== i)
    onChange(next.length ? next : null)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder ?? 'Add item…'}
          className="h-8 text-sm"
        />
        <Button type="button" variant="outline" size="sm" className="h-8 px-2 shrink-0" onClick={add}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md">
              {item}
              <button onClick={() => remove(i)} className="text-gray-400 hover:text-gray-600 ml-0.5">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProductForm() {
  const [data, setData] = useState<ProductData>(EMPTY)
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
    fetch(`/directory/api/admin/products/${slug}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => router.push('/admin/products'))
  }, [slug, router])

  function set<K extends keyof ProductData>(key: K, value: ProductData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    if (!data.productName.trim()) { toast.error('Product name is required'); return }
    if (isNew && !data.slug.trim()) { toast.error('Slug is required'); return }

    setSaving(true)
    const { slug: _s, ...rest } = data
    const body = isNew ? { slug: data.slug.trim(), ...rest } : rest
    const url = isNew ? '/directory/api/admin/products' : `/directory/api/admin/products/${slug}`
    try {
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('Product saved')
        setTimeout(() => router.push('/admin/products'), 300)
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

  const title = isNew ? 'New Product' : (data.productName || data.slug || 'Edit Product')

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium">Products</p>
            <h2 className="text-base font-semibold text-gray-900 truncate">{title}</h2>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className="shrink-0">
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>

      {/* Basic Info */}
      <FormSection title="Basic Info" icon={Package}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Product Name" required>
            <Input
              value={data.productName}
              onChange={(e) => {
                set('productName', e.target.value)
                if (isNew) {
                  set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
                }
              }}
              placeholder="e.g. Juvederm Ultra 3"
            />
          </Field>
          {isNew ? (
            <Field label="Slug" required hint="Auto-filled from name — editable">
              <Input
                value={data.slug}
                onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. juvederm-ultra-3"
                className="font-mono"
              />
            </Field>
          ) : (
            <div className="flex flex-col justify-end">
              <span className="text-xs text-gray-400 mb-1.5 font-medium">Slug</span>
              <code className="text-sm bg-gray-50 text-gray-600 px-3 py-2 rounded-md border border-gray-200 font-mono">{data.slug}</code>
            </div>
          )}
          <Field label="Brand">
            <Input value={data.brand ?? ''} onChange={(e) => set('brand', e.target.value || null)} placeholder="e.g. Allergan" />
          </Field>
          <Field label="Category">
            <Input value={data.productCategory ?? ''} onChange={(e) => set('productCategory', e.target.value || null)} placeholder="e.g. Dermal Filler" />
          </Field>
          <Field label="Subcategory">
            <Input value={data.productSubcategory ?? ''} onChange={(e) => set('productSubcategory', e.target.value || null)} placeholder="e.g. Hyaluronic Acid" />
          </Field>
          <Field label="Manufacturer">
            <Input value={data.manufacturer ?? ''} onChange={(e) => set('manufacturer', e.target.value || null)} />
          </Field>
          <Field label="SKU">
            <Input value={data.sku ?? ''} onChange={(e) => set('sku', e.target.value || null)} />
          </Field>
          <Field label="Image URL" fullWidth>
            <div className="flex gap-3 items-start">
              <Input value={data.imageUrl ?? ''} onChange={(e) => set('imageUrl', e.target.value || null)} placeholder="https://…" className="flex-1" />
              {data.imageUrl && (
                <img src={data.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
            </div>
          </Field>
          <Field label="Product PDF URL" fullWidth>
            <Input value={data.documentPdfUrl ?? ''} onChange={(e) => set('documentPdfUrl', e.target.value || null)} placeholder="https://…" />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer col-span-full">
            <Checkbox
              checked={data.isAestheticsDermatologyRelated ?? false}
              onCheckedChange={(v) => set('isAestheticsDermatologyRelated', v ? true : null)}
            />
            <span className="text-sm font-medium text-gray-700">Aesthetics / Dermatology related</span>
          </label>
        </div>
      </FormSection>

      {/* Description */}
      <FormSection title="Description" icon={FileText}>
        <div className="space-y-5">
          <Field label="Description">
            <Textarea value={data.description ?? ''} onChange={(e) => set('description', e.target.value || null)} placeholder="Product description…" className="min-h-[120px]" />
          </Field>
          <Field label="Brand About">
            <Textarea value={data.brandAbout ?? ''} onChange={(e) => set('brandAbout', e.target.value || null)} placeholder="About the brand…" className="min-h-[80px]" />
          </Field>
          <Field label="Seller About">
            <Textarea value={data.sellerAbout ?? ''} onChange={(e) => set('sellerAbout', e.target.value || null)} className="min-h-[80px]" />
          </Field>
        </div>
      </FormSection>

      {/* Clinical */}
      <FormSection title="Clinical Info" icon={FlaskConical}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Treatment Duration">
            <Input value={data.treatmentDuration ?? ''} onChange={(e) => set('treatmentDuration', e.target.value || null)} placeholder="e.g. 30–60 minutes" />
          </Field>
          <Field label="Onset of Effect">
            <Input value={data.onsetOfEffect ?? ''} onChange={(e) => set('onsetOfEffect', e.target.value || null)} placeholder="e.g. Immediate" />
          </Field>
          {[
            { key: 'keyBenefits' as const, label: 'Key Benefits' },
            { key: 'indications' as const, label: 'Indications' },
            { key: 'composition' as const, label: 'Composition' },
            { key: 'formulation' as const, label: 'Formulation' },
            { key: 'packaging' as const, label: 'Packaging' },
            { key: 'usageInstructions' as const, label: 'Usage Instructions' },
            { key: 'contraindications' as const, label: 'Contraindications' },
            { key: 'adverseEffects' as const, label: 'Adverse Effects' },
            { key: 'storageConditions' as const, label: 'Storage Conditions' },
          ].map(({ key, label }) => (
            <Field key={key} label={label} fullWidth>
              <TagListField value={data[key]} onChange={(v) => set(key, v)} />
            </Field>
          ))}
        </div>
      </FormSection>

      {/* Regulatory */}
      <FormSection title="Regulatory" icon={ShieldCheck}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="MHRA Approved">
            <Input value={data.mhraApproved ?? ''} onChange={(e) => set('mhraApproved', e.target.value || null)} placeholder="Yes / No / Pending" />
          </Field>
          <Field label="CE Marked">
            <Input value={data.ceMarked ?? ''} onChange={(e) => set('ceMarked', e.target.value || null)} placeholder="Yes / No" />
          </Field>
          <Field label="MHRA Link" fullWidth>
            <Input value={data.mhraLink ?? ''} onChange={(e) => set('mhraLink', e.target.value || null)} placeholder="https://…" />
          </Field>
          <Field label="Certifications & Compliance" fullWidth>
            <TagListField value={data.certifications} onChange={(v) => set('certifications', v)} placeholder="Add certification…" />
          </Field>
          <Field label="Verification Sources" fullWidth>
            <TagListField value={data.verificationSources} onChange={(v) => set('verificationSources', v)} placeholder="Add source URL…" />
          </Field>
        </div>
      </FormSection>

      <div className="flex justify-end pt-2">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? 'Saving…' : 'Save Product'}
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
            {[1, 2, 3, 4].map((j) => <div key={j} className="h-9 bg-gray-100 rounded animate-pulse" />)}
          </div>
        </div>
      ))}
    </div>
  )
}
