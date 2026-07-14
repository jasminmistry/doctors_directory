import { ExternalLink } from 'lucide-react'

interface Badge {
  label: string
  url?: string | null
}

interface AccreditationBadgesProps {
  isSaveFace?: boolean
  isDoctor?: boolean
  isJccp?: boolean | null; jccpUrl?: string | null
  isCqc?: boolean | null;  cqcUrl?: string | null
  isHiw?: boolean | null;  hiwUrl?: string | null
  isHis?: boolean | null;  hisUrl?: string | null
  isRqia?: boolean | null; rqiaUrl?: string | null
  aestheticsAwards?: Array<{ year: number; result: string; category: string }>
  tatlerGuideYears?: number[]
}

export function AccreditationBadges(props: AccreditationBadgesProps) {
  const badges: Badge[] = [
    props.isSaveFace && { label: 'Save Face' },
    props.isDoctor   && { label: 'Registered Doctor' },
    props.isJccp     && { label: 'JCCP',  url: props.jccpUrl },
    props.isCqc      && { label: 'CQC',   url: props.cqcUrl },
    props.isHiw      && { label: 'HIW',   url: props.hiwUrl },
    props.isHis      && { label: 'HIS',   url: props.hisUrl },
    props.isRqia     && { label: 'RQIA',  url: props.rqiaUrl },
  ].filter(Boolean) as Badge[]

  const awards = props.aestheticsAwards ?? []
  const tatlerYears = props.tatlerGuideYears ?? []
  const hasPrestige = awards.length > 0 || tatlerYears.length > 0

  if (badges.length === 0 && !hasPrestige) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Accreditations &amp; Certifications</h3>
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map(({ label, url }) =>
            url ? (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {label}
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </a>
            ) : (
              <span
                key={label}
                className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700"
              >
                {label}
              </span>
            )
          )}
        </div>
      )}
      {awards.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900">
            <span aria-hidden>🏆</span>
            UK Aesthetics Awards
          </p>
          <ul className="space-y-1.5">
            {awards.slice(0, 8).map((a) => (
              <li
                key={`${a.year}-${a.result}-${a.category}`}
                className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-950 ring-1 ring-amber-100"
              >
                <span className="font-semibold">{a.result} {a.year}</span>
                <span className="text-amber-800/80"> — {a.category}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tatlerYears.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900">
            <span aria-hidden>🏆</span>
            Tatler Beauty &amp; Cosmetic Surgery Guide
          </p>
          <div className="flex flex-wrap gap-2">
            {tatlerYears.map((year) => (
              <span
                key={year}
                className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-950 ring-1 ring-amber-100"
              >
                Featured {year}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-gray-400 leading-relaxed">
        Self-reported by the clinic. Confirm directly with the relevant regulatory body.
      </p>
    </div>
  )
}
