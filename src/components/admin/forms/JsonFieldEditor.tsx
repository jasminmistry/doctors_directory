'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Code, Type, List, LayoutList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// ─── helpers ──────────────────────────────────────────────────────────────────

type DetectedType = 'empty' | 'text' | 'list' | 'object'

function detectType(value: unknown): DetectedType {
  if (value == null) return 'empty'
  if (typeof value === 'string') return 'text'
  if (Array.isArray(value)) return 'list'
  if (typeof value === 'object') return 'object'
  return 'text'
}

function toDisplayJson(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return JSON.stringify(value, null, 2)
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((v) => (typeof v === 'string' ? v : JSON.stringify(v)))
}

function toObjectEntries(value: unknown): [string, unknown][] {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return []
  return Object.entries(value as Record<string, unknown>)
}

// ─── sub-editors ──────────────────────────────────────────────────────────────

function StringEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm min-h-[80px] resize-y"
    />
  )
}

function ListEditor({
  items, onChange,
}: { items: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('')

  function add() {
    const t = draft.trim()
    if (!t) return
    onChange([...items, t])
    setDraft('')
  }

  function update(i: number, v: string) {
    const next = [...items]
    next[i] = v
    onChange(next)
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-center">
          <span className="text-gray-300 text-xs w-4 shrink-0 text-right">{i + 1}</span>
          <Input
            value={item}
            onChange={(e) => update(i, e.target.value)}
            className="h-8 text-sm flex-1"
          />
          <button
            onClick={() => remove(i)}
            className="text-gray-300 hover:text-red-400 transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <span className="w-4 shrink-0" />
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Add item…"
          className="h-8 text-sm flex-1"
        />
        <Button type="button" variant="outline" size="sm" className="h-8 px-2 shrink-0" onClick={add}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

function ObjectEditor({
  entries,
  onChange,
}: {
  entries: [string, unknown][]
  onChange: (v: Record<string, unknown>) => void
}) {
  function updateKey(key: string, newVal: unknown) {
    const obj = Object.fromEntries(entries)
    obj[key] = newVal
    onChange(obj)
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, val]) => {
        const sub = detectType(val)
        return (
          <div key={key} className="space-y-1.5">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{key}</span>
            {sub === 'text' || sub === 'empty' ? (
              <Textarea
                value={typeof val === 'string' ? val : ''}
                onChange={(e) => updateKey(key, e.target.value || null)}
                className="text-sm min-h-[60px] resize-y"
                placeholder={`Value for "${key}"…`}
              />
            ) : sub === 'list' ? (
              <ListEditor
                items={toStringArray(val)}
                onChange={(v) => updateKey(key, v.length ? v : null)}
              />
            ) : (
              // nested object or complex — raw textarea
              <RawJsonInput
                value={val}
                onChange={(v) => updateKey(key, v)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function RawJsonInput({
  value, onChange, error: externalError,
}: {
  value: unknown
  onChange: (v: unknown) => void
  error?: boolean
}) {
  const [text, setText] = useState(() => toDisplayJson(value))
  const [parseError, setParseError] = useState(false)

  // sync when value changes from outside (e.g. mode switch)
  useEffect(() => {
    setText(toDisplayJson(value))
    setParseError(false)
  }, [value])

  function handleChange(raw: string) {
    setText(raw)
    if (!raw.trim()) {
      setParseError(false)
      onChange(null)
      return
    }
    try {
      onChange(JSON.parse(raw))
      setParseError(false)
    } catch {
      setParseError(true)
    }
  }

  const hasError = parseError || externalError

  return (
    <div className="relative">
      <Textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          'font-mono text-xs min-h-[100px] resize-y',
          hasError && 'border-red-300 focus-visible:ring-red-400',
        )}
        placeholder='["…"] or {"key": "value"}'
      />
      {hasError && (
        <p className="text-xs text-red-500 mt-1">Invalid JSON — fix before switching to visual mode</p>
      )}
    </div>
  )
}

// ─── main component ────────────────────────────────────────────────────────────

interface JsonFieldEditorProps {
  value: unknown
  onChange: (v: unknown) => void
}

export function JsonFieldEditor({ value, onChange }: JsonFieldEditorProps) {
  const [showRaw, setShowRaw] = useState(false)
  const type = detectType(value)

  function switchToRaw() {
    setShowRaw(true)
  }

  function switchToVisual() {
    setShowRaw(false)
  }

  const modeToggle = (
    <button
      onClick={() => (showRaw ? switchToVisual() : switchToRaw())}
      className={cn(
        'flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
        showRaw
          ? 'bg-gray-900 text-white'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
      )}
    >
      <Code className="h-3 w-3" />
      {showRaw ? 'Visual' : 'Raw JSON'}
    </button>
  )

  // ── Raw JSON mode ────────────────────────────────────────────────────────────
  if (showRaw) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end">{modeToggle}</div>
        <RawJsonInput value={value} onChange={onChange} />
      </div>
    )
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (type === 'empty') {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-4">
        <p className="text-xs text-gray-400 mb-3 text-center">No value — choose a type to start</p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            type="button" variant="outline" size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => onChange('')}
          >
            <Type className="h-3 w-3" /> Plain text
          </Button>
          <Button
            type="button" variant="outline" size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => onChange([])}
          >
            <List className="h-3 w-3" /> List of items
          </Button>
          <Button
            type="button" variant="outline" size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => onChange({})}
          >
            <LayoutList className="h-3 w-3" /> Key-value object
          </Button>
        </div>
        <div className="flex justify-center mt-3">{modeToggle}</div>
      </div>
    )
  }

  // ── Text mode ────────────────────────────────────────────────────────────────
  if (type === 'text') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            onClick={() => onChange([])}
            title="Switch to list"
          >
            <List className="h-3 w-3" /> Switch to list
          </button>
          {modeToggle}
        </div>
        <StringEditor value={value as string} onChange={(v) => onChange(v || null)} />
      </div>
    )
  }

  // ── List mode ────────────────────────────────────────────────────────────────
  if (type === 'list') {
    const items = toStringArray(value)
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            onClick={() => onChange(null)}
            title="Clear"
          >
            <X className="h-3 w-3" /> Clear
          </button>
          {modeToggle}
        </div>
        <div className="bg-gray-50/60 rounded-lg p-3 border border-gray-100">
          <ListEditor
            items={items}
            onChange={(v) => onChange(v.length ? v : null)}
          />
        </div>
      </div>
    )
  }

  // ── Object mode ──────────────────────────────────────────────────────────────
  const entries = toObjectEntries(value)
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-400">{entries.length} field{entries.length !== 1 ? 's' : ''}</span>
        {modeToggle}
      </div>
      <div className="bg-gray-50/60 rounded-lg p-4 border border-gray-100 space-y-4">
        <ObjectEditor
          entries={entries}
          onChange={onChange}
        />
      </div>
    </div>
  )
}
