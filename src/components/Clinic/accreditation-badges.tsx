import { IconExternalLink } from '@tabler/icons-react'

interface Badge {
  label: string
  url?: string | null
}

interface AccreditationBadgesProps {
  isConsentz?: boolean
  isSaveFace?: boolean
  isDoctor?: boolean
  isJccp?: boolean | null; jccpUrl?: string | null
  isCqc?: boolean | null;  cqcUrl?: string | null
  isHiw?: boolean | null;  hiwUrl?: string | null
  isHis?: boolean | null;  hisUrl?: string | null
  isRqia?: boolean | null; rqiaUrl?: string | null
  aestheticsAwards?: Array<{ year: number; result: string; category: string }>
  tatlerGuideYears?: number[]
  awardsBadgeLabel?: string | null
  tatlerBadgeLabel?: string | null
}

const pillClass =
  'inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700'
const prestigePillClass =
  'inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200'

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
  const prestigePills = [
    props.awardsBadgeLabel,
    props.tatlerBadgeLabel,
  ].filter((label): label is string => Boolean(label))
  const hasPrestige = awards.length > 0 || tatlerYears.length > 0 || prestigePills.length > 0

  if (badges.length === 0 && !hasPrestige) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
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
                className={`${pillClass} gap-1.5 hover:bg-gray-100 transition-colors`}
              >
                {label}
                <IconExternalLink stroke={1.5} className="h-3 w-3 text-gray-400" />
              </a>
            ) : (
              <span key={label} className={pillClass}>
                {label}
              </span>
            )
          )}
        </div>
      )}
      {prestigePills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {prestigePills.map((label) => (
            <span key={label} className={prestigePillClass}>
              <span aria-hidden>🏆</span>
              {label}
            </span>
          ))}
        </div>
      )}
      {awards.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900">
            <span aria-hidden>🏆</span>
            UK Aesthetics Awards
          </p>
          <ul className="space-y-1.5">
            {awards.slice(0, 8).map((a) => (
              <li
                key={`${a.year}-${a.result}-${a.category}`}
                className={`${pillClass} w-full justify-start`}
              >
                <span className="font-semibold">{a.result} {a.year}</span>
                <span className="text-gray-500"> — {a.category}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tatlerYears.length > 0 && (
        <div className="space-y-2 border-t border-gray-100 pt-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900">
            <span aria-hidden>🏆</span>
            Tatler Beauty &amp; Cosmetic Surgery Guide
          </p>
          <div className="flex flex-wrap gap-2">
            {tatlerYears.map((year) => (
              <span key={year} className={pillClass}>
                Featured {year}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-gray-600 leading-relaxed">
        Self-reported by the clinic. Confirm directly with the relevant regulatory body.
      </p>
    </div>
  )
}
