'use client'

import { ShieldCheck, BadgeCheck, Shield } from 'lucide-react'

interface VerifiedBadgeProps {
  idVerified?: boolean
  manualVerified?: boolean
  verified?: boolean
  className?: string
}

/**
 * Compact icon-only verified indicator for list cards.
 * Shows the highest trust level available.
 */
export function VerifiedBadge({ idVerified, manualVerified, verified, className = '' }: VerifiedBadgeProps) {
  if (idVerified) {
    return (
      <span
        title="ID Verified"
        aria-label="ID Verified"
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 ${className}`}
      >
        <ShieldCheck className="w-3 h-3" />
      </span>
    )
  }

  if (manualVerified) {
    return (
      <span
        title="Manually Verified"
        aria-label="Manually Verified"
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 shrink-0 ${className}`}
      >
        <BadgeCheck className="w-3 h-3" />
      </span>
    )
  }

  if (verified) {
    return (
      <span
        title="Verified"
        aria-label="Verified"
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-600 shrink-0 ${className}`}
      >
        <Shield className="w-3 h-3" />
      </span>
    )
  }

  return null
}
