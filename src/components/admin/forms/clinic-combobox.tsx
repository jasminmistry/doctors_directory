'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ClinicMatch {
  id: number
  name: string | null
  slug: string
  cityName: string | null
}

interface Props {
  onChange: (clinicId: number | null) => void
  initialLabel?: string | null
  placeholder?: string
  invalid?: boolean
}

function labelFor(c: ClinicMatch): string {
  return c.cityName ? `${c.cityName} — ${c.name || c.slug}` : c.name || c.slug
}

/**
 * Clinic picker for the practitioner admin form. Searches server-side (capped
 * to 20 matches) instead of loading every clinic in the directory up front —
 * that used to mean fetching and rendering 4,000+ <SelectItem>s on every
 * open, which is what made the old dropdown slow to load and slow to use.
 */
export function ClinicCombobox({ onChange, initialLabel, placeholder, invalid }: Readonly<Props>) {
  const [query, setQuery] = useState(initialLabel ?? '')
  const [dirty, setDirty] = useState(false)
  const [matches, setMatches] = useState<ClinicMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const requestId = useRef(0)

  // Re-seed the display text once the practitioner record (and its current
  // clinic) has loaded — not on every keystroke, only when the caller passes
  // a genuinely new label.
  useEffect(() => {
    setQuery(initialLabel ?? '')
    setDirty(false)
  }, [initialLabel])

  useEffect(() => {
    if (!open || !dirty) return
    const term = query.trim()
    if (term.length === 0) {
      setMatches([])
      setLoading(false)
      return
    }
    const id = ++requestId.current
    setLoading(true)
    const handle = setTimeout(() => {
      fetch(`/directory/api/admin/clinics/?search=${encodeURIComponent(term)}`)
        .then((r) => (r.ok ? r.json() : []))
        .then((data: ClinicMatch[]) => {
          if (id !== requestId.current) return
          setMatches(Array.isArray(data) ? data : [])
        })
        .catch(() => { if (id === requestId.current) setMatches([]) })
        .finally(() => { if (id === requestId.current) setLoading(false) })
    }, 250)
    return () => clearTimeout(handle)
  }, [query, open, dirty])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function select(c: ClinicMatch) {
    onChange(c.id)
    setQuery(labelFor(c))
    setDirty(false)
    setMatches([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder={placeholder ?? 'Start typing a clinic or city…'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setDirty(true)
          onChange(null)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        aria-invalid={!!invalid}
        className={cn(invalid && 'border-destructive')}
        autoComplete="off"
      />
      {open && dirty && query.trim().length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground shadow-md">
          Start typing to search clinics…
        </div>
      )}
      {open && dirty && loading && query.trim().length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground shadow-md">
          Searching…
        </div>
      )}
      {open && dirty && !loading && query.trim().length > 0 && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-background shadow-md">
          {matches.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => select(c)}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
              >
                {labelFor(c)}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && dirty && !loading && query.trim().length > 0 && matches.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground shadow-md">
          No matching clinic.
        </div>
      )}
    </div>
  )
}
