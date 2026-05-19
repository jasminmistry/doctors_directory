import type { ReactNode } from "react"

export const HUB_CONTENT_START_CLASS =
  "w-full min-w-0 overflow-x-clip bg-white pt-10 md:pt-12 pb-0 [font-family:Inter,system-ui,sans-serif]"

type Props = {
  children: ReactNode
  className?: string
}

export function HubContentStart({ children, className = "" }: Props) {
  return (
    <article className={`mx-auto w-full max-w-[1280px] px-4 ${HUB_CONTENT_START_CLASS} ${className}`.trim()}>
      {children}
    </article>
  )
}
