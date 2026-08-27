'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconAlertTriangle, IconLoader2 } from '@tabler/icons-react'

interface DeleteAccountModalProps {
  open: boolean
  entityType: 'clinic' | 'practitioner'
  entityName: string
  /** Pass 'subscription' to surface a billing note — subscription billing stops immediately, before the grace period ends. */
  plan?: string | null
  onClose: () => void
  /** Called once deletion has been requested successfully — the caller should log the user out. */
  onDeleted: () => void
}

const GRACE_PERIOD_DAYS = 7

export function DeleteAccountModal({ open, entityType, entityName, plan, onClose, onDeleted }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const label = entityType === 'clinic' ? 'clinic' : 'practitioner'
  const canConfirm = confirmText.trim().toLowerCase() === entityName.trim().toLowerCase()

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen || submitting) return
    if (!success) {
      setConfirmText('')
      setError(null)
    }
    onClose()
  }

  async function handleDelete() {
    if (!canConfirm) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/directory/api/portal/delete-account/', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!submitting} className="sm:max-w-md">
        {success ? (
          <>
            <DialogHeader>
              <DialogTitle>Deletion scheduled</DialogTitle>
              <DialogDescription>
                Your listing has been hidden from the directory and will be permanently deleted in {GRACE_PERIOD_DAYS} days.
                We&apos;ve emailed you a link to cancel if you change your mind. You&apos;ll be signed out now.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" onClick={onDeleted} className="cursor-pointer">
                OK
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <IconAlertTriangle stroke={1.5} className="h-5 w-5 shrink-0" />
                Delete your {label} profile
              </DialogTitle>
              <DialogDescription className="space-y-2 text-left">
                <span className="block">
                  This deletes <strong>{entityName}</strong>&apos;s listing and portal access only — it won&apos;t affect any other
                  clinics or practitioners you manage.
                </span>
                <span className="block">
                  Your listing is hidden immediately and permanently deleted after a {GRACE_PERIOD_DAYS}-day grace period. You can
                  cancel any time before then via a link we&apos;ll email you.
                </span>
                {plan === 'subscription' && (
                  <span className="block">
                    You&apos;re on the Subscription plan — billing stops immediately, you won&apos;t be charged again while
                    this is pending.
                  </span>
                )}
                <span className="block">
                  Type <strong>{entityName}</strong> below to confirm.
                </span>
              </DialogDescription>
            </DialogHeader>

            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={entityName}
              disabled={submitting}
              autoComplete="off"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="cursor-pointer">
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={!canConfirm || submitting}
                className="cursor-pointer"
              >
                {submitting ? <IconLoader2 stroke={1.5} className="h-4 w-4 animate-spin" /> : null}
                Delete profile
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
