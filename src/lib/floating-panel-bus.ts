'use client'

import { useEffect, useState } from 'react'

// Coordinates the floating request/chat panels (consultation chat, request-pricing,
// request-consultation) so opening one closes any other that's already open — they
// share the same fixed bottom-right position and would otherwise stack.
const PANEL_OPEN_EVENT = 'directory:floating-panel-open'
const PANEL_STATE_EVENT = 'directory:floating-panel-state'

const openPanelIds = new Set<string>()

export function useExclusiveFloatingPanel(id: string, open: boolean, setOpen: (open: boolean) => void) {
  useEffect(() => {
    if (open) {
      openPanelIds.add(id)
      window.dispatchEvent(new CustomEvent<string>(PANEL_OPEN_EVENT, { detail: id }))
    } else {
      openPanelIds.delete(id)
    }
    window.dispatchEvent(new Event(PANEL_STATE_EVENT))
  }, [open, id])

  useEffect(() => {
    function handlePanelOpen(e: Event) {
      if ((e as CustomEvent<string>).detail !== id) setOpen(false)
    }
    window.addEventListener(PANEL_OPEN_EVENT, handlePanelOpen)
    return () => window.removeEventListener(PANEL_OPEN_EVENT, handlePanelOpen)
  }, [id, setOpen])

  useEffect(() => {
    return () => {
      openPanelIds.delete(id)
      window.dispatchEvent(new Event(PANEL_STATE_EVENT))
    }
  }, [id])
}

// True while any floating request/chat panel is open — lets other fixed,
// bottom-right UI (e.g. the scroll-to-top button) hide itself instead of
// overlapping the panel, since they share the same corner.
export function useAnyFloatingPanelOpen(): boolean {
  const [anyOpen, setAnyOpen] = useState(() => openPanelIds.size > 0)

  useEffect(() => {
    const sync = () => setAnyOpen(openPanelIds.size > 0)
    sync()
    window.addEventListener(PANEL_STATE_EVENT, sync)
    return () => window.removeEventListener(PANEL_STATE_EVENT, sync)
  }, [])

  return anyOpen
}
