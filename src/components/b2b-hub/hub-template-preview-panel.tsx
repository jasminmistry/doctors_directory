import type { TemplateEntry } from "@/lib/b2b-hub/templates-registry"
import { toDisplayTitle } from "@/lib/b2b-hub/text"

type Props = {
  entry: TemplateEntry
}

export function HubTemplatePreviewPanel({ entry }: Props) {
  const title = toDisplayTitle(entry.title)

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[#E2DDD7] bg-white shadow-sm lg:min-h-0">
      <div
        className="relative flex flex-1 flex-col overflow-hidden p-4 sm:p-6"
        style={{
          backgroundImage:
            "linear-gradient(165deg, #ebe4d9 0%, #d9cfc0 45%, #cfc4b4 100%)",
        }}
      >
        <div className="relative flex h-full w-full flex-1 flex-col overflow-hidden rounded-lg border border-[#d4ccc0] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)] lg:max-w-none">
          <div className="border-b border-[#EDE9E3] bg-[#FAFAFA] px-4 py-3">
            <div className="mb-2 h-2 w-16 rounded bg-[#1a877a]" />
            <p className="text-xs font-semibold leading-snug text-[#111111] line-clamp-2">{title}</p>
          </div>
          <div className="flex flex-1 flex-col gap-2.5 p-4">
            <div className="h-2 w-full rounded bg-[#eef7f2]" />
            <div className="h-2 w-[92%] rounded bg-[#eef7f2]" />
            <div className="h-2 w-[85%] rounded bg-[#eef7f2]" />
            <div className="mt-2 h-2 w-[70%] rounded bg-[#f2eee6]" />
            <div className="h-2 w-full rounded bg-[#f2eee6]" />
            <div className="h-2 w-[88%] rounded bg-[#f2eee6]" />
            <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
              <div className="h-8 rounded border border-[#E2DDD7] bg-white" />
              <div className="h-8 rounded border border-[#1a877a] bg-[#e0f1ed]" />
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-3 w-3 shrink-0 rounded-sm border border-[#ccc]" />
              <div className="h-2 flex-1 rounded bg-[#f2eee6]" />
            </div>
            <div className="flex gap-2">
              <div className="h-3 w-3 shrink-0 rounded-sm border border-[#ccc]" />
              <div className="h-2 flex-1 rounded bg-[#f2eee6]" />
            </div>
          </div>
          <div className="border-t border-[#EDE9E3] px-4 py-2.5">
            <div className="h-2 w-24 rounded bg-[#e6e0d8]" />
          </div>
        </div>
      </div>
      <p className="border-t border-[#E2DDD7] px-5 py-3 text-center text-sm text-[#6B6B6B]">
        Preview — {title}
      </p>
    </div>
  )
}
