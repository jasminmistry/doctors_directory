'use client'

import { useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  shape?: 'square' | 'circle'
  className?: string
}

export function ImageUpload({ value, onChange, shape = 'square', className }: Readonly<Props>) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setError(null)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/directory/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Upload failed')
        return
      }
      onChange(data.url)
    } catch {
      setError('Network error — upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex gap-3 items-start">
        {/* Preview */}
        {value ? (
          <div className="relative shrink-0">
            <img
              src={value}
              alt=""
              className={cn(
                'object-cover border border-gray-200',
                shape === 'circle' ? 'w-12 h-12 rounded-full' : 'w-12 h-12 rounded-lg'
              )}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ) : (
          <div
            className={cn(
              'shrink-0 w-12 h-12 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400',
              shape === 'circle' ? 'rounded-full' : 'rounded-lg'
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <Upload className="h-4 w-4" />
          </div>
        )}

        {/* URL input */}
        <Input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="https://… or upload a file"
          className="flex-1"
        />

        {/* Upload button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="shrink-0"
        >
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
