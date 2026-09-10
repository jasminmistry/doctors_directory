'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { IconTrash, IconUpload } from '@tabler/icons-react'

const CATEGORIES = [
  'ADDITIONAL',
  'PROFILE',
  'COVER',
  'LOGO',
  'EXTERIOR',
  'INTERIOR',
  'PRODUCT',
  'AT_WORK',
  'TEAMS',
] as const

interface Photo {
  id: number
  url: string
  category: (typeof CATEGORIES)[number]
  sortOrder: number
}

export function GbpPhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const res = await fetch('/directory/api/portal/gbp/photos/', { cache: 'no-store' })
    if (res.ok) setPhotos((await res.json()).photos)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const up = await fetch('/directory/api/portal/upload/', { method: 'POST', body: form })
      const upData = await up.json().catch(() => null)
      if (!up.ok || !upData?.url) {
        toast.error(upData?.error ?? 'Upload failed')
        return
      }
      const res = await fetch('/directory/api/portal/gbp/photos/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: upData.url, category: 'ADDITIONAL' }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        toast.error(d?.error ?? 'Failed to add photo')
        return
      }
      void load()
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function updateCategory(id: number, category: Photo['category']) {
    const next = photos.map((p) => (p.id === id ? { ...p, category } : p))
    setPhotos(next)
    await fetch('/directory/api/portal/gbp/photos/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photos: next.map((p) => ({ id: p.id, category: p.category, sortOrder: p.sortOrder })),
      }),
    })
  }

  async function remove(id: number) {
    await fetch(`/directory/api/portal/gbp/photos/?id=${id}`, { method: 'DELETE' })
    void load()
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p) => (
          <div key={p.id} className="rounded-lg border border-gray-200 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt="" className="h-28 w-full rounded object-cover" />
            <div className="mt-2 flex items-center gap-1.5">
              <select
                className="flex-1 rounded border border-gray-200 px-1.5 py-1 text-[11px]"
                value={p.category}
                onChange={(e) => updateCategory(p.id, e.target.value as Photo['category'])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label="Remove photo"
                className="rounded border border-gray-200 p-1 text-gray-500 hover:text-red-600"
              >
                <IconTrash className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
      >
        <IconUpload className="h-3.5 w-3.5" /> {uploading ? 'Uploading…' : 'Upload photo'}
      </button>
    </div>
  )
}
