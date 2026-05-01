'use client'

import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormSectionProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  className?: string
}

export function FormSection({ title, description, icon: Icon, children, className }: FormSectionProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden', className)}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-gray-600" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
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
  fullWidth?: boolean
  children: ReactNode
}

export function Field({ label, required, hint, fullWidth, children }: FieldProps) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <label className="text-sm font-medium text-gray-700 mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
