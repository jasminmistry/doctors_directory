'use client'

import { useEffect } from 'react'

// Coordinates the floating request/chat panels (consultation chat, request-pricing,
// request-consultation) so opening one closes any other that's already open — they
// share the same fixed bottom-right position and would otherwise stack.
const PANEL_OPEN_EVENT = 'directory:floating-panel-open'

export function useExclusiveFloatingPanel(id: string, open: boolean, setOpen: (open: boolean) => void) {
  useEffect(() => {
    if (!open) return
    window.dispatchEvent(new CustomEvent<string>(PANEL_OPEN_EVENT, { detail: id }))
  }, [open, id])

  useEffect(() => {
    function handlePanelOpen(e: Event) {
      if ((e as CustomEvent<string>).detail !== id) setOpen(false)
    }
    window.addEventListener(PANEL_OPEN_EVENT, handlePanelOpen)
    return () => window.removeEventListener(PANEL_OPEN_EVENT, handlePanelOpen)
  }, [id, setOpen])
}
