'use client'

import { useEffect, useMemo, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { IconDeviceMobile, IconInfoCircle, IconMail, IconUserCheck } from '@tabler/icons-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const dynamic = 'force-dynamic'

interface Lead {
  id: number
  patientName: string | null
  patientPhone: string
  patientEmail: string | null
  treatment: string | null
  location: string | null
  source: 'consultation' | 'pricing'
  status: string
  pipelineStatus: string
  isUnlocked: boolean
  isGhostLead: boolean
  seenAt: string | null
  notificationEmailSentAt: string | null
  notificationEmailReadAt: string | null
  notificationSmsSentAt: string | null
  notificationSmsDeliveredAt: string | null
  notificationSmsReadAt: string | null
  createdAt: string
  clinic: { slug: string; name: string | null; claimedPlan: string | null }
  patient: { id: number; email: string } | null
}

/** Small info icon + hover tooltip, for explaining a column's meaning next to its header label. */
function HeaderTip({ label, tip }: { label: string; tip: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <Tooltip>
        <TooltipTrigger asChild>
          <IconInfoCircle stroke={1.5} className="h-3.5 w-3.5 text-gray-400" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{tip}</TooltipContent>
      </Tooltip>
    </span>
  )
}

function notifyState(sentAt: string | null, deliveredOrReadAt: string | null): 'none' | 'sent' | 'confirmed' {
  if (deliveredOrReadAt) return 'confirmed'
  if (sentAt) return 'sent'
  return 'none'
}

const NOTIFY_COLOR: Record<string, string> = {
  none: 'text-gray-300',
  sent: 'text-amber-500',
  confirmed: 'text-emerald-600',
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  booked: 'bg-emerald-100 text-emerald-700',
  lost: 'bg-gray-100 text-gray-600',
  spam: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-500',
  closed: 'bg-gray-100 text-gray-600',
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSource, setFilterSource] = useState<'all' | 'consultation' | 'pricing'>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetch('/directory/api/admin/leads/', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setLeads(data?.leads ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (filterSource !== 'all' && l.source !== filterSource) return false
      if (filterStatus !== 'all' && l.pipelineStatus !== filterStatus) return false
      return true
    })
  }, [leads, filterSource, filterStatus])

  const rows = useMemo(
    () =>
      filtered.map((l) => ({
        ...l,
        clinicName: l.clinic.name || l.clinic.slug,
      })),
    [filtered],
  )

  const columns: Column<(typeof rows)[number]>[] = [
    {
      key: 'patientName',
      label: 'Patient',
      render: (v: string | null, item) =>
        v ? (
          <span className="inline-flex items-center gap-1.5">
            {v}
            {item.patient && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <IconUserCheck stroke={1.5} className="h-3.5 w-3.5 text-cyan-600" />
                </TooltipTrigger>
                <TooltipContent>Registered patient account ({item.patient.email})</TooltipContent>
              </Tooltip>
            )}
          </span>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs italic text-gray-400 cursor-help">No name collected</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {item.isGhostLead
                ? 'The clinic was unclaimed when this enquiry came in, so it used the slimmed-down enquiry form — email, phone and reason only, no name or DOB.'
                : 'No name was captured for this lead.'}
            </TooltipContent>
          </Tooltip>
        ),
    },
    {
      key: 'patientPhone',
      label: 'Phone',
      render: (v: string) => <span className="text-gray-600 text-xs whitespace-nowrap">{v}</span>,
    },
    {
      key: 'patientEmail',
      label: 'Email',
      render: (v: string | null) => (v ? <span className="text-gray-600 text-xs">{v}</span> : <span className="text-gray-300">—</span>),
    },
    {
      key: 'clinicName',
      label: 'Clinic',
      render: (_v: string, item) => (
        <a
          href={`/directory/admin/clinics/${item.clinic.slug}`}
          className="text-xs text-gray-700 underline underline-offset-2 hover:text-gray-900"
        >
          {item.clinicName}
        </a>
      ),
    },
    {
      key: 'treatment',
      label: 'Treatment',
      render: (v: string | null) => (v ? <span className="text-xs">{v}</span> : <span className="text-gray-300">—</span>),
    },
    {
      key: 'location',
      label: 'Location',
      render: (v: string | null) => (v ? <span className="text-xs text-gray-600">{v}</span> : <span className="text-gray-300">—</span>),
    },
    {
      key: 'source',
      label: 'Source',
      render: (v: string) => <span className="text-xs capitalize text-gray-600">{v}</span>,
    },
    {
      key: 'pipelineStatus',
      label: 'Status',
      render: (v: string) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[v] ?? 'bg-gray-100 text-gray-600'}`}>
          {v}
        </span>
      ),
    },
    {
      key: 'seenAt',
      label: 'Seen',
      render: (v: string | null) =>
        v ? (
          <span className="text-xs text-gray-400">Seen</span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">New</span>
        ),
    },
    {
      key: 'notificationEmailSentAt',
      label: 'Notified',
      render: (_v: string | null, item) => {
        const emailState = notifyState(item.notificationEmailSentAt, item.notificationEmailReadAt)
        const smsState = notifyState(item.notificationSmsSentAt, item.notificationSmsDeliveredAt || item.notificationSmsReadAt)
        return (
          <span className="inline-flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <IconMail stroke={1.5} className={`h-4 w-4 ${NOTIFY_COLOR[emailState]}`} />
              </TooltipTrigger>
              <TooltipContent>
                {emailState === 'none' && 'Email: not sent'}
                {emailState === 'sent' && 'Email: sent, not opened yet'}
                {emailState === 'confirmed' && `Email: opened (${item.notificationEmailReadAt ? formatDistanceToNow(new Date(item.notificationEmailReadAt), { addSuffix: true }) : ''})`}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <IconDeviceMobile stroke={1.5} className={`h-4 w-4 ${NOTIFY_COLOR[smsState]}`} />
              </TooltipTrigger>
              <TooltipContent>
                {smsState === 'none' && 'SMS: not sent'}
                {smsState === 'sent' && 'SMS: sent, not delivered/read yet'}
                {smsState === 'confirmed' && (item.notificationSmsReadAt ? 'SMS: link tapped by clinic' : 'SMS: delivered')}
              </TooltipContent>
            </Tooltip>
          </span>
        )
      },
    },
    {
      key: 'isUnlocked',
      label: <HeaderTip label="Unlocked" tip="Pay-per-lead clinics pay £55 to reveal a lead's contact details. 'Unlocked' = they've paid for this one. Subscription and free plans see every lead unlocked by default, so this column only applies to pay-per-lead." />,
      render: (v: boolean, item) =>
        item.clinic.claimedPlan === 'pay_per_lead' ? (
          v ? (
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Unlocked</span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Locked</span>
          )
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      key: 'isGhostLead',
      label: <HeaderTip label="Ghost" tip="A ghost lead came in while the clinic's listing was still unclaimed — it's notified by a public contact detail, not the portal. The label reflects the clinic's state at the moment the lead arrived, so it stays set even after the clinic later claims their profile." />,
      render: (v: boolean) =>
        v ? <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Ghost</span> : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'createdAt',
      label: 'Received',
      render: (v: string) => <span className="text-xs text-gray-600 whitespace-nowrap">{formatDistanceToNow(new Date(v), { addSuffix: true })}</span>,
    },
  ]

  const filterControls = (
    <>
      <Select value={filterSource} onValueChange={(v) => setFilterSource(v as typeof filterSource)}>
        <SelectTrigger className="h-9 w-40 text-sm">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          <SelectItem value="consultation">Callback requests</SelectItem>
          <SelectItem value="pricing">Pricing enquiries</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filterStatus} onValueChange={setFilterStatus}>
        <SelectTrigger className="h-9 w-36 text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="contacted">Contacted</SelectItem>
          <SelectItem value="booked">Booked</SelectItem>
          <SelectItem value="lost">Lost</SelectItem>
          <SelectItem value="spam">Spam</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      {(filterSource !== 'all' || filterStatus !== 'all') && (
        <button onClick={() => { setFilterSource('all'); setFilterStatus('all') }} className="text-xs text-gray-600 underline hover:text-gray-700">
          Clear
        </button>
      )}
    </>
  )

  return (
    <TooltipProvider>
      <AdminLayout title="Leads">
        <DataTable data={rows} columns={columns} loading={loading} filters={filterControls} />
      </AdminLayout>
    </TooltipProvider>
  )
}
