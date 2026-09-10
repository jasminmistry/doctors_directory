'use client'

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { IconBrandGoogle, IconRefresh, IconCloudUpload, IconPlugConnectedX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

interface ConnectionState {
  status: 'pending_location' | 'connected' | 'needs_reauth' | 'revoked'
  googleEmail: string | null
  accountName: string | null
  locationName: string | null
  placeId: string | null
  lastPulledAt: string | null
  lastSyncedAt: string | null
  lastSyncError: string | null
  syncFieldState: Record<string, string> | null
}
interface StatusResponse {
  available: boolean
  plan: 'pay_per_lead' | 'subscription'
  canPush: boolean
  connection: ConnectionState | null
}
interface GbpAccount {
  name: string
  accountName?: string
}
interface GbpLocation {
  name: string
  title?: string
  storefrontAddress?: { addressLines?: string[]; locality?: string }
}

export function GbpConnectionCard({ onChange }: { onChange?: () => void }) {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/directory/api/portal/gbp/status/', { cache: 'no-store' })
    if (res.ok) setStatus(await res.json())
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function disconnect() {
    if (!confirm('Disconnect this clinic from Google Business Profile?')) return
    setBusy(true)
    try {
      await fetch('/directory/api/portal/gbp/disconnect/', { method: 'POST' })
      toast.success('Disconnected')
      await load()
      onChange?.()
    } finally {
      setBusy(false)
    }
  }

  async function pull() {
    setBusy(true)
    try {
      const res = await fetch('/directory/api/portal/gbp/pull/?apply=1', { method: 'POST' })
      if (res.ok) {
        toast.success('Imported the latest details from Google')
        onChange?.()
        await load()
      } else {
        const d = await res.json().catch(() => null)
        toast.error(d?.error === 'reauth_required' ? 'Reconnect Google to continue' : d?.error ?? 'Import failed')
      }
    } finally {
      setBusy(false)
    }
  }

  if (!status) {
    return <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">Loading…</div>
  }

  if (!status.available) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        The Google Business Profile connection isn&rsquo;t enabled yet. You can still edit the fields
        below; syncing to Google will be available once the integration is switched on.
      </div>
    )
  }

  const conn = status.connection

  if (!conn) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900">Connect Google Business Profile</h2>
        <p className="mt-1 text-sm text-gray-600">
          Link your Google account to import your existing details
          {status.canPush ? ' and push updates back to Google in one click.' : '.'}
        </p>
        <Button asChild size="md" className="mt-3">
          <a href="/directory/api/portal/gbp/connect/">
            <IconBrandGoogle /> Connect Google
          </a>
        </Button>
      </div>
    )
  }

  if (conn.status === 'needs_reauth' || conn.status === 'revoked') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-amber-900">Reconnect Google</h2>
        <p className="mt-1 text-sm text-amber-800">
          Your Google authorisation has expired. Reconnect to keep importing and syncing.
        </p>
        <Button asChild size="md" className="mt-3">
          <a href="/directory/api/portal/gbp/connect/">
            <IconBrandGoogle /> Reconnect
          </a>
        </Button>
      </div>
    )
  }

  if (conn.status === 'pending_location') {
    return <LocationPicker email={conn.googleEmail} onBound={async () => { await load(); onChange?.() }} onDisconnect={disconnect} busy={busy} />
  }

  // connected
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Connected to Google</h2>
          <p className="text-xs text-gray-500">
            {conn.googleEmail} · {conn.locationName}
          </p>
          {conn.lastSyncedAt && (
            <p className="text-xs text-gray-400">Last synced {new Date(conn.lastSyncedAt).toLocaleString()}</p>
          )}
        </div>
        <Button type="button" variant="outline" size="md" onClick={disconnect} disabled={busy} className="normal-case">
          <IconPlugConnectedX /> Disconnect
        </Button>
      </div>

      {conn.lastSyncError && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {conn.lastSyncError}
        </p>
      )}

      {conn.syncFieldState && Object.keys(conn.syncFieldState).length > 0 && (
        <ul className="grid grid-cols-2 gap-1 text-[11px] sm:grid-cols-3">
          {Object.entries(conn.syncFieldState).map(([field, result]) => (
            <li key={field} className={result === 'ok' ? 'text-green-700' : 'text-amber-700'}>
              {result === 'ok' ? '✓' : '⚠'} {field}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="md" onClick={pull} disabled={busy} className="normal-case">
          <IconRefresh /> Import from Google
        </Button>
        {status.canPush ? (
          <SyncButton onDone={load} />
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500">
            <IconCloudUpload className="h-4 w-4" /> One-click sync is a Verified Subscription feature
          </span>
        )}
      </div>
    </div>
  )
}

function LocationPicker({
  email,
  onBound,
  onDisconnect,
  busy,
}: {
  email: string | null
  onBound: () => void
  onDisconnect: () => void
  busy: boolean
}) {
  const [accounts, setAccounts] = useState<GbpAccount[]>([])
  const [account, setAccount] = useState('')
  const [locations, setLocations] = useState<GbpLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [binding, setBinding] = useState(false)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/directory/api/portal/gbp/accounts/', { cache: 'no-store' })
      const d = await res.json().catch(() => null)
      if (res.ok) {
        setAccounts(d.accounts)
        if (d.accounts.length === 1) setAccount(d.accounts[0].name)
      } else {
        toast.error(d?.error === 'reauth_required' ? 'Reconnect Google to continue' : 'Failed to load Google accounts')
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (!account) return
    ;(async () => {
      const res = await fetch(`/directory/api/portal/gbp/locations/?account=${encodeURIComponent(account)}`, {
        cache: 'no-store',
      })
      const d = await res.json().catch(() => null)
      if (res.ok) setLocations(d.locations)
    })()
  }, [account])

  async function bind(locationName: string) {
    setBinding(true)
    try {
      const res = await fetch('/directory/api/portal/gbp/bind/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountName: account, locationName }),
      })
      const d = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(d?.error ?? 'Failed to link this location')
        return
      }
      toast.success('Linked — imported your Google details')
      onBound()
    } finally {
      setBinding(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Choose your business location</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onDisconnect} disabled={busy}>
          Cancel
        </Button>
      </div>
      <p className="text-xs text-gray-500">Signed in as {email}</p>

      {loading ? (
        <p className="text-sm text-gray-600">Loading your Google accounts…</p>
      ) : accounts.length === 0 ? (
        <p className="text-sm text-gray-600">
          This Google account doesn&rsquo;t manage any business profiles. Connect the account that manages
          your listing.
        </p>
      ) : (
        <>
          {accounts.length > 1 && (
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            >
              <option value="">Select an account…</option>
              {accounts.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.accountName ?? a.name}
                </option>
              ))}
            </select>
          )}

          <ul className="divide-y divide-gray-100">
            {locations.map((loc) => (
              <li key={loc.name} className="flex items-center justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{loc.title ?? loc.name}</p>
                  <p className="truncate text-xs text-gray-500">
                    {[loc.storefrontAddress?.addressLines?.[0], loc.storefrontAddress?.locality]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
                <Button type="button" size="md" onClick={() => bind(loc.name)} disabled={binding}>
                  Link
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function SyncButton({ onDone }: { onDone: () => void }) {
  const [running, setRunning] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function run(confirmNameAddress: boolean) {
    setRunning(true)
    try {
      const res = await fetch('/directory/api/portal/gbp/sync/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmNameAddress }),
      })
      const d = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(d?.error === 'reauth_required' ? 'Reconnect Google to continue' : d?.error ?? 'Sync failed')
        return
      }
      if (d.needsConfirm?.length) {
        setConfirmOpen(true)
        return
      }
      toast[d.ok ? 'success' : 'warning'](d.ok ? 'Synced to Google' : 'Synced with some warnings')
      setConfirmOpen(false)
      onDone()
    } finally {
      setRunning(false)
    }
  }

  return (
    <>
      <Button type="button" size="md" onClick={() => run(false)} disabled={running}>
        <IconCloudUpload /> {running ? 'Syncing…' : 'Sync to Google'}
      </Button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-gray-900">Update name &amp; address on Google?</h3>
            <p className="mt-2 text-sm text-gray-600">
              Changing your business name or address on Google can put your listing into a pending state
              and may require re-verification (by postcard or phone). Other fields have already been synced.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => setConfirmOpen(false)}
                className="flex-1 normal-case"
              >
                Skip these
              </Button>
              <Button type="button" size="lg" onClick={() => run(true)} disabled={running} className="flex-1">
                {running ? 'Syncing…' : 'Sync everything'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
