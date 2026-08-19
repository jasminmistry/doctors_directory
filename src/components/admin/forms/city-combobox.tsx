'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface City {
  name: string
  slug: string
}

interface Props {
  onChange: (citySlug: string | null) => void
  initialLabel?: string | null
  placeholder?: string
  invalid?: boolean
}

/**
 * City picker for the admin clinic form. Cities are a small, bounded list
 * (unlike clinics), so the full list is fetched once from the public
 * /api/cities endpoint and filtered client-side.
 */
export function CityCombobox({ onChange, initialLabel, placeholder, invalid }: Readonly<Props>) {
  const [cities, setCities] = useState<City[]>([])
  const [query, setQuery] = useState(initialLabel ?? '')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/directory/api/cities/')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: City[]) => setCities(Array.isArray(data) ? data : []))
      .catch(() => setCities([]))
  }, [])

  useEffect(() => {
    setQuery(initialLabel ?? '')
  }, [initialLabel])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const matches =
    query.trim().length === 0
      ? cities
      : cities.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))

  function select(c: City) {
    onChange(c.slug)
    setQuery(c.name)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        type="text"
        placeholder={placeholder ?? 'Start typing a city…'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          onChange(null)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        aria-invalid={!!invalid}
        className={cn(invalid && 'border-destructive')}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-background shadow-md">
          {matches.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => select(c)}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim().length > 0 && matches.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground shadow-md">
          No matching city.
        </div>
      )}
    </div>
  )
}
