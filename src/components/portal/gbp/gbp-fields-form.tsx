'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { GbpPhotoGallery } from '@/components/portal/gbp/gbp-photo-gallery'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const
type Day = (typeof DAYS)[number]

interface HourPeriod {
  openDay: Day
  openTime: string
  closeDay: Day
  closeTime: string
}
interface ServiceRow {
  name: string
  description?: string | null
  priceUnits?: number | null
}
interface Category {
  id: string
  name: string
}

interface FormState {
  placeId: string
  description: string
  website: string
  gbpBookingUrl: string
  gbpPrimaryPhone: string
  additionalPhones: string[]
  address: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
    regionCode: string
  }
  primaryCategory: Category
  additionalCategories: Category[]
  hourPeriods: HourPeriod[]
  services: ServiceRow[]
}

const EMPTY: FormState = {
  placeId: '',
  description: '',
  website: '',
  gbpBookingUrl: '',
  gbpPrimaryPhone: '',
  additionalPhones: [],
  address: { addressLines: [''], locality: '', administrativeArea: '', postalCode: '', regionCode: 'GB' },
  primaryCategory: { id: '', name: '' },
  additionalCategories: [],
  hourPeriods: [],
  services: [],
}

const inputCls =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none'
const labelCls = 'block text-xs font-medium text-gray-600 mb-1'

export function GbpFieldsForm({ plan }: { plan: 'pay_per_lead' | 'subscription' }) {
  const [state, setState] = useState<FormState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/directory/api/portal/gbp/fields/', { cache: 'no-store' })
      if (!res.ok) return
      const d = await res.json()
      setState({
        placeId: d.placeId ?? '',
        description: d.aboutSection ?? '',
        website: d.website ?? '',
        gbpBookingUrl: d.gbpBookingUrl ?? '',
        gbpPrimaryPhone: d.gbpPrimaryPhone ?? '',
        additionalPhones: Array.isArray(d.additionalPhones) ? d.additionalPhones : [],
        address: {
          addressLines:
            Array.isArray(d.address?.addressLines) && d.address.addressLines.length
              ? d.address.addressLines
              : [''],
          locality: d.address?.locality ?? '',
          administrativeArea: d.address?.administrativeArea ?? '',
          postalCode: d.address?.postalCode ?? '',
          regionCode: d.address?.regionCode ?? 'GB',
        },
        primaryCategory: {
          id: d.gbpPrimaryCategoryId ?? '',
          name: d.gbpPrimaryCategoryName ?? '',
        },
        additionalCategories: Array.isArray(d.gbpAdditionalCategories) ? d.gbpAdditionalCategories : [],
        hourPeriods: Array.isArray(d.hourPeriods)
          ? d.hourPeriods.map((p: HourPeriod) => ({
              openDay: p.openDay,
              openTime: p.openTime,
              closeDay: p.closeDay,
              closeTime: p.closeTime,
            }))
          : [],
        services: Array.isArray(d.services)
          ? d.services.map((s: ServiceRow) => ({
              name: s.name,
              description: s.description ?? '',
              priceUnits: s.priceUnits ?? null,
            }))
          : [],
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function save() {
    setSaving(true)
    try {
      const payload = {
        placeId: state.placeId.trim() || null,
        description: state.description || null,
        website: state.website || '',
        gbpBookingUrl: state.gbpBookingUrl || '',
        gbpPrimaryPhone: state.gbpPrimaryPhone || null,
        additionalPhones: state.additionalPhones.filter(Boolean),
        address: {
          addressLines: state.address.addressLines.filter(Boolean),
          locality: state.address.locality || null,
          administrativeArea: state.address.administrativeArea || null,
          postalCode: state.address.postalCode || null,
          regionCode: state.address.regionCode || null,
        },
        primaryCategory: state.primaryCategory.name.trim()
          ? { id: state.primaryCategory.id.trim(), name: state.primaryCategory.name.trim() }
          : null,
        additionalCategories: state.additionalCategories.filter((c) => c.name.trim()),
        hourPeriods: state.hourPeriods,
        services: state.services
          .filter((s) => s.name.trim())
          .map((s) => ({
            name: s.name.trim(),
            description: s.description?.trim() || null,
            priceUnits: s.priceUnits ?? null,
            isFreeForm: true,
          })),
      }
      const res = await fetch('/directory/api/portal/gbp/fields/', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const d = await res.json().catch(() => null)
      if (!res.ok) {
        const firstErr = d?.fieldErrors ? Object.values(d.fieldErrors)[0] : d?.error
        toast.error((firstErr as string) ?? 'Failed to save')
        return
      }
      toast.success('Saved')
      void load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">Loading…</div>
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }))

  return (
    <div className="space-y-6">
      {plan === 'pay_per_lead' && (
        <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          These details improve your directory listing now. One-click sync to Google is part of the
          Verified Subscription plan.
        </p>
      )}

      {/* Identity */}
      <Section title="Profile basics">
        <div>
          <label className={labelCls}>Google Place ID</label>
          <input
            className={inputCls}
            value={state.placeId}
            onChange={(e) => set('placeId', e.target.value)}
            placeholder="ChIJ… (used for your Google review link)"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            Find it at developers.google.com/maps/documentation/places/web-service/place-id
          </p>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea
            className={`${inputCls} resize-none`}
            rows={3}
            maxLength={750}
            value={state.description}
            onChange={(e) => set('description', e.target.value)}
          />
          <p className="mt-1 text-[11px] text-gray-400">{state.description.length}/750</p>
        </div>
        <div>
          <label className={labelCls}>Website</label>
          <input className={inputCls} value={state.website} onChange={(e) => set('website', e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Appointment / booking link</label>
          <input
            className={inputCls}
            value={state.gbpBookingUrl}
            onChange={(e) => set('gbpBookingUrl', e.target.value)}
            placeholder="https://…"
          />
        </div>
      </Section>

      {/* Contact */}
      <Section title="Phone">
        <div>
          <label className={labelCls}>Primary phone</label>
          <input
            className={inputCls}
            value={state.gbpPrimaryPhone}
            onChange={(e) => set('gbpPrimaryPhone', e.target.value)}
          />
        </div>
        {state.additionalPhones.map((p, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls}
              value={p}
              onChange={(e) => {
                const next = [...state.additionalPhones]
                next[i] = e.target.value
                set('additionalPhones', next)
              }}
            />
            <IconButton onClick={() => set('additionalPhones', state.additionalPhones.filter((_, j) => j !== i))}>
              <IconTrash className="h-4 w-4" />
            </IconButton>
          </div>
        ))}
        {state.additionalPhones.length < 5 && (
          <AddButton onClick={() => set('additionalPhones', [...state.additionalPhones, ''])}>
            Add another phone
          </AddButton>
        )}
      </Section>

      {/* Address */}
      <Section title="Address">
        {state.address.addressLines.map((line, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls}
              placeholder={`Address line ${i + 1}`}
              value={line}
              onChange={(e) => {
                const next = [...state.address.addressLines]
                next[i] = e.target.value
                set('address', { ...state.address, addressLines: next })
              }}
            />
            {state.address.addressLines.length > 1 && (
              <IconButton
                onClick={() =>
                  set('address', {
                    ...state.address,
                    addressLines: state.address.addressLines.filter((_, j) => j !== i),
                  })
                }
              >
                <IconTrash className="h-4 w-4" />
              </IconButton>
            )}
          </div>
        ))}
        {state.address.addressLines.length < 5 && (
          <AddButton
            onClick={() => set('address', { ...state.address, addressLines: [...state.address.addressLines, ''] })}
          >
            Add address line
          </AddButton>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Town / city</label>
            <input
              className={inputCls}
              value={state.address.locality}
              onChange={(e) => set('address', { ...state.address, locality: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>County / region</label>
            <input
              className={inputCls}
              value={state.address.administrativeArea}
              onChange={(e) => set('address', { ...state.address, administrativeArea: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Postcode</label>
            <input
              className={inputCls}
              value={state.address.postalCode}
              onChange={(e) => set('address', { ...state.address, postalCode: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Country code</label>
            <input
              className={inputCls}
              maxLength={2}
              value={state.address.regionCode}
              onChange={(e) => set('address', { ...state.address, regionCode: e.target.value.toUpperCase() })}
            />
          </div>
        </div>
      </Section>

      {/* Categories */}
      <Section title="Categories">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Primary category name</label>
            <input
              className={inputCls}
              value={state.primaryCategory.name}
              onChange={(e) => set('primaryCategory', { ...state.primaryCategory, name: e.target.value })}
              placeholder="e.g. Medical spa"
            />
          </div>
          <div>
            <label className={labelCls}>Primary category ID (gcid)</label>
            <input
              className={inputCls}
              value={state.primaryCategory.id}
              onChange={(e) => set('primaryCategory', { ...state.primaryCategory, id: e.target.value })}
              placeholder="gcid:medical_spa"
            />
          </div>
        </div>
        {state.additionalCategories.map((c, i) => (
          <div key={i} className="flex gap-2">
            <input
              className={inputCls}
              placeholder="Category name"
              value={c.name}
              onChange={(e) => {
                const next = [...state.additionalCategories]
                next[i] = { ...next[i], name: e.target.value }
                set('additionalCategories', next)
              }}
            />
            <input
              className={inputCls}
              placeholder="gcid:…"
              value={c.id}
              onChange={(e) => {
                const next = [...state.additionalCategories]
                next[i] = { ...next[i], id: e.target.value }
                set('additionalCategories', next)
              }}
            />
            <IconButton onClick={() => set('additionalCategories', state.additionalCategories.filter((_, j) => j !== i))}>
              <IconTrash className="h-4 w-4" />
            </IconButton>
          </div>
        ))}
        {state.additionalCategories.length < 9 && (
          <AddButton onClick={() => set('additionalCategories', [...state.additionalCategories, { id: '', name: '' }])}>
            Add secondary category
          </AddButton>
        )}
      </Section>

      {/* Hours */}
      <Section title="Opening hours">
        {state.hourPeriods.map((p, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select
              className={`${inputCls} w-auto`}
              value={p.openDay}
              onChange={(e) => updatePeriod(state, set, i, { openDay: e.target.value as Day, closeDay: e.target.value as Day })}
            >
              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <input
              type="time"
              className={`${inputCls} w-auto`}
              value={p.openTime}
              onChange={(e) => updatePeriod(state, set, i, { openTime: e.target.value })}
            />
            <span className="text-sm text-gray-400">to</span>
            <input
              type="time"
              className={`${inputCls} w-auto`}
              value={p.closeTime}
              onChange={(e) => updatePeriod(state, set, i, { closeTime: e.target.value })}
            />
            <IconButton onClick={() => set('hourPeriods', state.hourPeriods.filter((_, j) => j !== i))}>
              <IconTrash className="h-4 w-4" />
            </IconButton>
          </div>
        ))}
        <AddButton
          onClick={() =>
            set('hourPeriods', [
              ...state.hourPeriods,
              { openDay: 'Monday', openTime: '09:00', closeDay: 'Monday', closeTime: '17:00' },
            ])
          }
        >
          Add opening period
        </AddButton>
      </Section>

      {/* Services */}
      <Section title="Services">
        {state.services.map((s, i) => (
          <div key={i} className="flex flex-wrap items-start gap-2">
            <input
              className={`${inputCls} flex-1 min-w-[140px]`}
              placeholder="Service name"
              value={s.name}
              onChange={(e) => {
                const next = [...state.services]
                next[i] = { ...next[i], name: e.target.value }
                set('services', next)
              }}
            />
            <input
              className={`${inputCls} w-28`}
              placeholder="£ from"
              inputMode="numeric"
              value={s.priceUnits ?? ''}
              onChange={(e) => {
                const next = [...state.services]
                const n = Number(e.target.value)
                next[i] = { ...next[i], priceUnits: Number.isFinite(n) && e.target.value ? n : null }
                set('services', next)
              }}
            />
            <IconButton onClick={() => set('services', state.services.filter((_, j) => j !== i))}>
              <IconTrash className="h-4 w-4" />
            </IconButton>
          </div>
        ))}
        <AddButton onClick={() => set('services', [...state.services, { name: '', description: '', priceUnits: null }])}>
          Add service
        </AddButton>
      </Section>

      <Section title="Photos">
        <GbpPhotoGallery />
      </Section>

      <div className="sticky bottom-0 -mx-1 flex justify-end border-t border-gray-100 bg-white/90 px-1 py-3 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function updatePeriod(
  state: FormState,
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void,
  index: number,
  patch: Partial<HourPeriod>,
) {
  const next = [...state.hourPeriods]
  next[index] = { ...next[index], ...patch }
  set('hourPeriods', next)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">{title}</h2>
      {children}
    </section>
  )
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900"
    >
      <IconPlus className="h-3.5 w-3.5" /> {children}
    </button>
  )
}

function IconButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-red-600"
    >
      {children}
    </button>
  )
}
