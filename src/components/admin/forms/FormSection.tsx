'use client'

import type { ReactNode } from 'react'
import type { Icon } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  icon?: Icon
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, icon: Icon, children, className }: FormSectionProps) {
  return (
    <div className={cn('rounded-lg bg-white border border-gray-200 overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-[#e0e0e0] flex items-center gap-3">
        {Icon && (
          <div className="flex items-center justify-center">
            <Icon stroke={1.5} className="h-6 w-6 text-black" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-600 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

interface FieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  fullWidth?: boolean
  children: ReactNode
}

export function Field({ label, required, hint, error, fullWidth, children }: FieldProps) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-gray-600 mt-1">{hint}</p>
      ) : null}
    </div>
  )
}