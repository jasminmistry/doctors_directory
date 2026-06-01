'use client'

import { useEffect, useState, useCallback } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DEFAULT_PERSON, FallbackImage } from '@/components/ui/fallback-image'
import { Search, X, ChevronUp, ChevronDown, Star } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface FeaturedEntry {
  id: number
  clinicSlug: string
  position: number
  name: string
  image: string | null
  category: string | null
  rating: number | null
  reviewCount: number
  gmapsAddress: string | null
}

interface ClinicOption {
  slug: string
  name: string
  image: string | null
  category: string | null
  rating: number | null
  gmapsAddress: string | null
}

export default function FeaturedProfilesPage() {
  const [featured, setFeatured] = useState<FeaturedEntry[]>([])
  const [allClinics, setAllClinics] = useState<ClinicOption[]>([])
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/directory/api/admin/featured-profiles').then((r) => r.json()),
      fetch('/directory/api/admin/clinics').then((r) => r.json()),
    ])
      .then(([feat, clinics]) => {
        setFeatured(Array.isArray(feat) ? feat : [])
        setAllClinics(Array.isArray(clinics) ? clinics : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = useCallback(async (entries: FeaturedEntry[]) => {
    setSaving(true)
    setSaved(false)
    try {
      await fetch('/directory/api/admin/featured-profiles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: entries.map((e) => e.clinicSlug) }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }, [])

  function addClinic(clinic: ClinicOption) {
    if (featured.some((f) => f.clinicSlug === clinic.slug)) return
    const next: FeaturedEntry[] = [
      ...featured,
      {
        id: 0,
        clinicSlug: clinic.slug,
        position: featured.length + 1,
        name: clinic.name || clinic.slug,
        image: clinic.image,
        category: clinic.category,
        rating: clinic.rating,
        reviewCount: 0,
        gmapsAddress: clinic.gmapsAddress,
      },
    ]
    setFeatured(next)
    setQuery('')
    save(next)
  }

  function removeClinic(slug: string) {
    const next = featured.filter((f) => f.clinicSlug !== slug)
    setFeatured(next)
    save(next)
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...featured]
    const swap = index + direction
    if (swap < 0 || swap >= next.length) return
    ;[next[index], next[swap]] = [next[swap], next[index]]
    setFeatured(next)
    save(next)
  }

  const featuredSlugs = new Set(featured.map((f) => f.clinicSlug))
  const filtered = query.trim().length > 1
    ? allClinics
        .filter(
          (c) =>
            !featuredSlugs.has(c.slug) &&
            (c.name?.toLowerCase().includes(query.toLowerCase()) ||
              c.slug.includes(query.toLowerCase()))
        )
        .slice(0, 8)
    : []

  return (
    <AdminLayout title="Featured Profiles">
      <div className="max-w-2xl space-y-6">
        <p className="text-sm text-gray-500">
          Choose up to 8 clinics to appear as featured tiles on the homepage. Drag or use the arrows to reorder.
        </p>

        {/* Search to add */}
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:border-gray-500 focus-within:ring-1 focus-within:ring-gray-300">
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder="Search clinics to add…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {filtered.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
              {filtered.map((clinic) => (
                <li key={clinic.slug}>
                  <button
                    type="button"
                    onClick={() => addClinic(clinic)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors"
                  >
                    <FallbackImage
                      src={clinic.image ?? ''}
                      alt={clinic.name ?? ''}
                      fallback={DEFAULT_PERSON}
                      className="h-8 w-8 rounded-md object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{clinic.name || clinic.slug}</p>
                      {clinic.category && <p className="text-xs text-gray-400 truncate">{clinic.category}</p>}
                    </div>
                    {clinic.rating && (
                      <span className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {clinic.rating}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Current featured list */}
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : featured.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
            No featured clinics yet. Search above to add one.
          </div>
        ) : (
          <ul className="space-y-2">
            {featured.map((entry, i) => (
              <li
                key={entry.clinicSlug}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-3"
              >
                <span className="w-5 shrink-0 text-center text-xs font-medium text-gray-400">{i + 1}</span>
                <FallbackImage
                  src={entry.image ?? ''}
                  alt={entry.name}
                  fallback={DEFAULT_PERSON}
                  className="h-10 w-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.name}</p>
                  {entry.category && <p className="text-xs text-gray-500 truncate">{entry.category}</p>}
                  {entry.gmapsAddress && <p className="text-xs text-gray-400 truncate">{entry.gmapsAddress}</p>}
                </div>
                {entry.rating && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 shrink-0">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {entry.rating}
                  </span>
                )}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === featured.length - 1}
                    className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeClinic(entry.clinicSlug)}
                  className="shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${entry.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {(saving || saved) && (
          <p className={`text-sm font-medium ${saved ? 'text-emerald-600' : 'text-gray-400'}`}>
            {saving ? 'Saving…' : 'Saved'}
          </p>
        )}
      </div>
    </AdminLayout>
  )
}
