"use client"

import { useCallback, useRef, useState } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type PendingConfirm = ConfirmOptions & {
  open: boolean
}

export function useConfirmDialog() {
  const [pending, setPending] = useState<PendingConfirm | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const close = useCallback((value: boolean) => {
    resolverRef.current?.(value)
    resolverRef.current = null
    setPending(null)
  }, [])

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
      setPending({ ...options, open: true })
    })
  }, [])

  const dialog = (
    <ConfirmDialog
      open={Boolean(pending?.open)}
      title={pending?.title ?? ""}
      description={pending?.description}
      confirmLabel={pending?.confirmLabel}
      cancelLabel={pending?.cancelLabel}
      destructive={pending?.destructive ?? true}
      onCancel={() => close(false)}
      onConfirm={() => close(true)}
    />
  )

  return { confirm, dialog }
}
