'use client'

import { useEffect, useRef, useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { Input } from '@/components/ui/input'

type TreatmentOption = { id: number; name: string; slug: string }

interface Props {
  value: number[]
  onChange: (treatmentIds: number[]) => void
  placeholder?: string
}

/**
 * Treatment picker for the clinic admin form. Treatments are a small, bounded
 * list, so the full id/name/slug set is fetched once and filtered client-side
 * (mirrors CityCombobox's approach).
 */
export function TreatmentsMultiSelect({ value, onChange, placeholder }: Readonly<Props>) {
  const [options, setOptions] = useState<TreatmentOption[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/directory/api/admin/treatments/?select=options')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: TreatmentOption[]) => setOptions(Array.isArray(data) ? data : []))
      .catch(() => setOptions([]))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = options.filter((o) => value.includes(o.id))
  const matches = options.filter(
    (o) => !value.includes(o.id) && o.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  function add(o: TreatmentOption) {
    onChange([...value, o.id])
    setQuery('')
  }

  function remove(id: number) {
    onChange(value.filter((v) => v !== id))
  }

  return (
    <div ref={containerRef} className="relative">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {o.name}
              <button
                type="button"
                onClick={() => remove(o.id)}
                aria-label={`Remove ${o.name}`}
                className="text-gray-400 hover:text-gray-700"
              >
                <IconX stroke={1.5} className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        type="text"
        placeholder={placeholder ?? 'Start typing a treatment…'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-background shadow-md">
          {matches.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => add(o)}
                className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
              >
                {o.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && query.trim().length > 0 && matches.length === 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground shadow-md">
          No matching treatment.
        </div>
      )}
    </div>
  )
}
