'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DEFAULT_PERSON, FallbackImage } from '@/components/ui/fallback-image'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { IconEye, IconEyeOff, IconLinkOff, IconLoader2, IconUsers, IconX } from '@tabler/icons-react'

export const dynamic = 'force-dynamic'

interface UnlinkClinic {
  slug: string
  name: string | null
  image: string | null
  email: string | null
  coreClinicId: number | null
  coreUnlinkRequestedAt: string
  isHidden: boolean
  practitioners: {
    slug: string
    displayName: string | null
    imageUrl: string | null
    isHidden: boolean
  }[]
}

export default function UnlinkRequestsPage() {
  const [rows, setRows] = useState<UnlinkClinic[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/directory/api/admin/unlink-requests/')
      .then((r) => r.json())
      .then((data) => { setRows(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function doAction(slug: string, action: string, fn: () => Promise<Response>) {
    setBusy((b) => ({ ...b, [slug]: action }))
    try {
      const res = await fn()
      if (!res.ok) { toast.error('Action failed'); return }
      return res
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setBusy((b) => { const n = { ...b }; delete n[slug]; return n })
    }
  }

  async function handleUnlink(slug: string) {
    const res = await doAction(slug, 'unlink', () =>
      fetch(`/directory/api/admin/clinics/${slug}/unlink-core/`, { method: 'POST' })
    )
    if (res) {
      toast.success('Core account unlinked.')
      setRows((prev) => prev.filter((r) => r.slug !== slug))
    }
  }

  async function handleDismiss(slug: string) {
    const res = await doAction(slug, 'dismiss', () =>
      fetch(`/directory/api/admin/clinics/${slug}/dismiss-unlink/`, { method: 'POST' })
    )
    if (res) {
      toast.success('Unlink request dismissed.')
      setRows((prev) => prev.filter((r) => r.slug !== slug))
    }
  }

  async function handleToggleHidden(slug: string, hide: boolean) {
    const res = await doAction(slug, 'hide', () =>
      fetch(`/directory/api/admin/clinics/${slug}/toggle-hidden/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hidden: hide }),
      })
    )
    if (res) {
      const data = await res.json()
      toast.success(
        hide
          ? `Clinic hidden. ${data.practitionersAffected} practitioner(s) also hidden.`
          : 'Clinic made visible.'
      )
      setRows((prev) =>
        prev.map((r) =>
          r.slug === slug
            ? {
                ...r,
                isHidden: hide,
                practitioners: r.practitioners.map((p) => ({ ...p, isHidden: hide })),
              }
            : r
        )
      )
    }
  }

  return (
    <AdminLayout title="Unlink Requests">
      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-600">
          Loading…
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-600">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <IconLinkOff stroke={1.5} className="h-5 w-5 text-gray-600" />
          </div>
          <p className="text-sm font-medium">No pending unlink requests</p>
          <p className="text-xs text-gray-600">Clinics that request to disconnect from Consentz Core will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {rows.length} pending unlink request{rows.length !== 1 ? 's' : ''}.
            Approving removes the Core Clinic ID and disables calendar, booking sync, and Core chat.
          </p>

          <div className="space-y-3">
            {rows.map((row) => {
              const isBusy = !!busy[row.slug]
              const displayName = row.name || row.slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

              return (
                <div key={row.slug} className="rounded-lg border border-gray-200 bg-white p-5">
                  {/* Clinic header */}
                  <div className="flex items-start gap-4">
                    {row.image
                      ? <FallbackImage src={row.image.replaceAll('"', '')} alt={displayName} className="h-12 w-12 rounded-lg object-cover shrink-0" fallback={DEFAULT_PERSON} />
                      : <div className="h-12 w-12 rounded-lg bg-gray-100 shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                        {row.isHidden && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                            <IconEyeOff stroke={1.5} className="h-3 w-3" /> Hidden
                          </span>
                        )}
                      </div>
                      {row.email && <p className="text-xs text-gray-600 mt-0.5">{row.email}</p>}
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600">
                        <span>Core ID: <span className="font-medium text-gray-700">{row.coreClinicId ?? '—'}</span></span>
                        <span>Requested: <span className="font-medium text-gray-700">{format(new Date(row.coreUnlinkRequestedAt), 'd MMM yyyy, HH:mm')}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Associated practitioners */}
                  {row.practitioners.length > 0 && (
                    <div className="mt-4 rounded-lg bg-gray-50 border border-gray-100 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <IconUsers stroke={1.5} className="h-3.5 w-3.5 text-gray-600" />
                        <p className="text-xs font-medium text-gray-600">{row.practitioners.length} associated practitioner{row.practitioners.length !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.practitioners.map((p) => (
                          <div key={p.slug} className="flex items-center gap-1.5">
                            {p.imageUrl
                              ? <FallbackImage src={p.imageUrl} alt={p.displayName ?? ''} className="h-6 w-6 rounded-full object-cover" fallback={DEFAULT_PERSON} />
                              : <div className="h-6 w-6 rounded-full bg-gray-200 shrink-0" />
                            }
                            <span className="text-xs text-gray-700">{p.displayName ?? p.slug}</span>
                            {p.isHidden && <IconEyeOff stroke={1.5} className="h-3 w-3" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUnlink(row.slug)}
                      disabled={isBusy}
                    >
                      {busy[row.slug] === 'unlink' ? <IconLoader2 stroke={1.5} className="h-3.5 w-3.5 animate-spin" /> : <IconLinkOff stroke={1.5} className="h-3.5 w-3.5" />}
                      Approve &amp; unlink
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismiss(row.slug)}
                      disabled={isBusy}
                    >
                      {busy[row.slug] === 'dismiss' ? <IconLoader2  className="h-3.5 w-3.5 animate-spin" /> : <IconX stroke={1.5} className="h-3.5 w-3.5" />}
                      Dismiss request
                    </Button>

                    {row.isHidden ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleToggleHidden(row.slug, false)}
                        disabled={isBusy}
                      >
                        {busy[row.slug] === 'hide' ? <IconLoader2 stroke={1.5} className="h-3.5 w-3.5 animate-spin" /> : <IconEye stroke={1.5} className="h-3.5 w-3.5" />}
                        Make visible
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleToggleHidden(row.slug, true)}
                        disabled={isBusy}
                      >
                        {busy[row.slug] === 'hide' ? <IconLoader2 stroke={1.5} className="h-3.5 w-3.5 animate-spin" /> : <IconEyeOff stroke={1.5} className="h-3.5 w-3.5" />}
                        Hide clinic &amp; practitioners
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
