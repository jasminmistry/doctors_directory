import { format } from 'date-fns'
import { CalendarCheck, Clock, ShieldCheck } from 'lucide-react'

const CQC_LABELS: Record<string, { label: string; color: string }> = {
  outstanding:          { label: 'Outstanding',          color: 'text-green-700 bg-green-50' },
  good:                 { label: 'Good',                 color: 'text-blue-700 bg-blue-50' },
  requires_improvement: { label: 'Requires Improvement', color: 'text-amber-700 bg-amber-50' },
  not_applicable:       { label: 'N/A',                  color: 'text-gray-500 bg-gray-50' },
}

const REPLY_LABELS: Record<string, string> = {
  within_24hrs:    'Within 24 hours',
  within_48hrs:    'Within 48 hours',
  more_than_48hrs: 'More than 48 hours',
}

interface TransparencyBoxProps {
  claimedAt: Date | null | undefined
  cqcStatus: string | null | undefined
  avgReplyTime: string | null | undefined
}

export function TransparencyBox({ claimedAt, cqcStatus, avgReplyTime }: TransparencyBoxProps) {
  const rows = [
    claimedAt && {
      icon: CalendarCheck,
      label: 'Member Since',
      value: format(new Date(claimedAt), 'MMMM yyyy'),
      extra: null,
    },
    cqcStatus && {
      icon: ShieldCheck,
      label: 'CQC Status',
      value: null,
      extra: CQC_LABELS[cqcStatus] ?? null,
    },
    avgReplyTime && {
      icon: Clock,
      label: 'Avg Reply Time',
      value: REPLY_LABELS[avgReplyTime] ?? avgReplyTime,
      extra: null,
    },
  ].filter(Boolean) as Array<{
    icon: typeof CalendarCheck
    label: string
    value: string | null
    extra: { label: string; color: string } | null
  }>

  if (rows.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Transparency</h3>
      {rows.map(({ icon: Icon, label, value, extra }) => (
        <div key={label} className="flex items-start gap-3">
          <Icon className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            {value && <p className="text-sm font-medium text-gray-900">{value}</p>}
            {extra && (
              <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${extra.color}`}>
                {extra.label}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
