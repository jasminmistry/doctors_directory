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

  if (badges.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Accreditations &amp; Certifications</h3>
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
      <p className="text-xs text-gray-400 leading-relaxed">
        Self-reported by the clinic. Confirm directly with the relevant regulatory body.
      </p>
    </div>
  )
}
