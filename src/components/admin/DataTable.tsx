'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp, IconCircleCheck, IconPencil, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'

export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  searchable?: boolean
  render?: (value: any, item: T) => React.ReactNode
}

interface DataTableProps<T extends Record<string, any>> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onAdd?: () => void
  onApprove?: (item: T) => void
  loading?: boolean
  addLabel?: string
  filters?: React.ReactNode
}

const PAGE_SIZES = [10, 25, 50, 100]

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <IconChevronDown stroke={1.5} className="h-3 w-3 opacity-30" />
  return active && dir === 'asc'
    ? <IconChevronUp stroke={1.5} className="h-3 w-3" />
    : <IconChevronDown stroke={1.5} className="h-3 w-3" />
}

function getPages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export function DataTable<T extends Record<string, any>>({
  data, columns, onEdit, onDelete, onAdd, onApprove, loading, addLabel = 'Add New', filters,
}: Readonly<DataTableProps<T>>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const nonSearchableKeys = useMemo(
    () => new Set(columns.filter(c => c.searchable === false).map(c => String(c.key))),
    [columns]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase().replace(/\s+/g, '')
    if (!q) return data
    return data.filter(item =>
      Object.entries(item).some(
        ([key, v]) =>
          !nonSearchableKeys.has(key) &&
          String(v ?? '').toLowerCase().replace(/\s+/g, '').includes(q)
      )
    )
  }, [data, search, nonSearchableKeys])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = String(a[sortKey] ?? '')
      const bv = String(b[sortKey] ?? '')
      return sortDir === 'asc' ? av.localeCompare(bv, undefined, { numeric: true }) : bv.localeCompare(av, undefined, { numeric: true })
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const curPage = Math.min(page, totalPages)
  const start = (curPage - 1) * pageSize
  const pageData = sorted.slice(start, start + pageSize)
  const from = sorted.length === 0 ? 0 : start + 1
  const to = Math.min(start + pageSize, sorted.length)

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <IconSearch stroke={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-9 h-9 text-sm"
            />
          </div>
          {filters}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span>Rows</span>
            <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1) }}>
              <SelectTrigger className="h-9 w-20 min-w-20 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-20">
                {PAGE_SIZES.map(s => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {onAdd && (
            <Button onClick={onAdd} size="md">
              <IconPlus stroke={1.5} />
              {addLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                {columns.map(col => (
                  <th key={String(col.key)} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">
                    {col.sortable !== false ? (
                      <button
                        onClick={() => toggleSort(String(col.key))}
                        className="inline-flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                      >
                        {col.label}
                        <SortIcon active={sortKey === String(col.key)} dir={sortDir} />
                      </button>
                    ) : col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {columns.map((col, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-100 rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : pageData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-16 text-center text-gray-600 text-sm">
                    {search ? 'No results match your search.' : 'No records yet.'}
                  </td>
                </tr>
              ) : (
                pageData.map((item, i) => (
                  <tr
                    key={String(item.slug ?? item.id ?? item.key ?? i)}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50/60 transition-colors"
                  >
                    {columns.map(col => (
                      <td key={String(col.key)} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                        {col.render
                          ? col.render(item[col.key as string], item)
                          : <span className="block max-w-xs truncate">{String(item[col.key as string] ?? '—')}</span>
                        }
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {onApprove && (
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                            onClick={() => onApprove(item)}
                          >
                            <IconCircleCheck stroke={1.5} className="h-3.5 w-3.5 mr-1" />
                            Approve
                          </Button>
                        )}
                        {onEdit && (
                          <Button variant="ghost" size="sm" className="h-8" onClick={() => onEdit(item)}>
                            <IconPencil stroke={1.5} className="h-3.5 w-3.5 mr-1" />
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => onDelete(item)}
                          >
                            <IconTrash stroke={1.5} className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-600">
          <span>
            {sorted.length === 0 ? 'No records' : `Showing ${from}–${to} of ${sorted.length.toLocaleString()}`}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 rounded"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={curPage === 1}
              >
                <IconChevronLeft stroke={1.5} className="h-3.5 w-3.5" />
              </Button>
              {getPages(curPage, totalPages).map((p, i) =>
                p === '…' ? (
                  <span key={`e${i}`} className="w-7 text-center">…</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === curPage ? 'default' : 'ghost'}
                    size="sm"
                    className="h-7 w-7 p-0 rounded text-xs"
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 rounded"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={curPage === totalPages}
              >
                <IconChevronRight stroke={1.5} className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
