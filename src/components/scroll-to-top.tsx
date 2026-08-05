"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAnyFloatingPanelOpen } from "@/lib/floating-panel-bus"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const panelOpen = useAnyFloatingPanelOpen()

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <Button
      onClick={scrollToTop}
      size="sm"
      className={cn(
        "fixed bottom-8 right-8 z-50 rounded-full w-12 h-12 p-0 transition-all duration-300",
        isVisible && !panelOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
      )}
    >
      <ChevronUp className="h-4 w-4" />
    </Button>
  )
}
