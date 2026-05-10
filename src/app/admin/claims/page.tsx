'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { DataTable } from '@/components/admin/DataTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  pending_otp: 'bg-gray-100 text-gray-700',
  otp_verified: 'bg-blue-100 text-blue-700',
  pending_approval: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending_otp: 'Awaiting OTP',
  otp_verified: 'OTP Verified',
  pending_approval: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
}

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pay_per_lead: 'Pay-Per-Lead £15',
  subscription: 'Subscription £99',
}

const columns = [
  {
    key: 'entityType',
    label: 'Type',
    render: (value: string) => (
      <Badge variant={value === 'practitioner' ? 'secondary' : 'outline'} className="text-xs capitalize">
        {value}
      </Badge>
    ),
  },
  { key: 'entityName', label: 'Profile' },
  { key: 'claimerName', label: 'Claimer' },
  { key: 'claimerEmail', label: 'Email' },
  {
    key: 'selectedPlan',
    label: 'Plan',
    render: (value: string) => value ? PLAN_LABELS[value] ?? value : '—',
  },
  {
    key: 'requiresManualReview',
    label: 'Manual',
    render: (value: boolean) =>
      value
        ? <Badge variant="destructive" className="text-xs">Yes</Badge>
        : <span className="text-muted-foreground text-xs">No</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[value] ?? 'bg-gray-100 text-gray-600'}`}>
        {STATUS_LABELS[value] ?? value}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Submitted',
    render: (value: string) =>
      value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
  },
]

interface Claim {
  id: number
  entityType: 'clinic' | 'practitioner'
  entityName: string
  clinicSlug: string | null
  practitionerSlug: string | null
  claimerName: string
  claimerEmail: string
  clinicNameInput: string | null
  clinicPhone: string | null
  clinicWebsite: string | null
  googleBusinessLink: string | null
  profession: string | null
  licenseNumber: string | null
  registryName: string | null
  domainVerified: boolean
  affiliated: boolean
  requiresManualReview: boolean
  selectedPlan: string | null
  status: string
  adminNotes: string | null
  createdAt: string
  consentzUserId: number | null
  clinic: { name: string | null; gmapsAddress: string | null; category: string | null } | null
  practitioner: { displayName: string | null; specialty: string | null } | null
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending_approval')
  const [reviewClaim, setReviewClaim] = useState<Claim | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [markingPaid, setMarkingPaid] = useState<number | null>(null)
  const [reprovisioning, setReprovisioning] = useState<number | null>(null)

  function fetchClaims(status?: string) {
    setLoading(true)
    const qs = status && status !== 'all' ? `?status=${status}` : ''
    fetch(`/directory/api/admin/claims${qs}`)
      .then((r) => r.json())
      .then((data: Claim[]) => {
        if (!Array.isArray(data)) { setClaims([]); setLoading(false); return }
        const rows = data.map((c) => ({
          ...c,
          entityName:
            c.entityType === 'practitioner'
              ? (c.practitioner?.displayName ?? c.practitionerSlug ?? '—')
              : (c.clinic?.name ?? c.clinicSlug ?? '—'),
        }))
        setClaims(rows)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchClaims(filter) }, [filter])

  async function handleMarkPaid(claim: Claim) {
    setMarkingPaid(claim.id)
    try {
      const res = await fetch(`/directory/api/admin/claims/${claim.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_paid' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Claim moved to Pending Review')
      fetchClaims(filter)
    } catch {
      toast.error('Failed to update claim')
    } finally {
      setMarkingPaid(null)
    }
  }

  async function handleReprovision(claim: Claim) {
    setReprovisioning(claim.id)
    try {
      const res = await fetch(`/directory/api/admin/claims/${claim.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reprovision' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Consentz account provisioned — welcome email sent')
      fetchClaims(filter)
    } catch {
      toast.error('Reprovisioning failed — check server logs')
    } finally {
      setReprovisioning(null)
    }
  }

  async function handleReview(action: 'approve' | 'reject') {
    if (!reviewClaim) return
    setSubmitting(true)
    try {
      const res = await fetch(`/directory/api/admin/claims/${reviewClaim.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? 'Failed to update claim')
      if (data.alreadyApproved) {
        toast.info('Claim was already approved — use Reprovision if Consentz account is missing')
      } else {
        toast.success(action === 'approve' ? 'Claim approved' : 'Claim rejected')
      }
      setReviewClaim(null)
      setAdminNotes('')
      fetchClaims(filter)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update claim')
    } finally {
      setSubmitting(false)
    }
  }

  const filterTabs = [
    { value: 'pending_approval', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All' },
  ]

  return (
    <AdminLayout title="Claim Requests">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Claim Requests</h1>

        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={[
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                filter === tab.value
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <DataTable
          columns={[
            ...columns,
            {
              key: 'id',
              label: '',
              render: (_: unknown, row: Claim) => {
                if (row.status === 'otp_verified' && row.selectedPlan && row.selectedPlan !== 'free') {
                  return (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleMarkPaid(row) }}
                      disabled={markingPaid === row.id}
                      className="px-2 py-1 text-xs rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200 font-medium disabled:opacity-50"
                    >
                      {markingPaid === row.id ? 'Updating…' : 'Mark as Paid'}
                    </button>
                  )
                }
                if (row.status === 'approved' && !row.consentzUserId) {
                  return (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReprovision(row) }}
                      disabled={reprovisioning === row.id}
                      className="px-2 py-1 text-xs rounded-md bg-purple-100 text-purple-800 hover:bg-purple-200 font-medium disabled:opacity-50"
                    >
                      {reprovisioning === row.id ? 'Provisioning…' : 'Reprovision'}
                    </button>
                  )
                }
                return null
              },
            },
          ]}
          data={claims}
          loading={loading}
          onEdit={(row) => {
            if (row.status === 'pending_approval') {
              setReviewClaim(row)
              setAdminNotes(row.adminNotes ?? '')
            }
          }}
        />
      </div>

      <Dialog
        open={!!reviewClaim}
        onOpenChange={(open) => { if (!open) { setReviewClaim(null); setAdminNotes('') } }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Claim</DialogTitle>
          </DialogHeader>

          {reviewClaim && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <p className="font-medium capitalize">{reviewClaim.entityType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Profile</span>
                  <p className="font-medium">{reviewClaim.entityName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Claimer</span>
                  <p className="font-medium">{reviewClaim.claimerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">{reviewClaim.claimerEmail}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Plan</span>
                  <p className="font-medium">{PLAN_LABELS[reviewClaim.selectedPlan ?? ''] ?? '—'}</p>
                </div>

                {reviewClaim.entityType === 'clinic' && (
                  <>
                    {reviewClaim.clinicNameInput && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Clinic name</span>
                        <p className="font-medium">{reviewClaim.clinicNameInput}</p>
                      </div>
                    )}
                    {reviewClaim.clinicPhone && (
                      <div>
                        <span className="text-muted-foreground">Phone</span>
                        <p className="font-medium">{reviewClaim.clinicPhone}</p>
                      </div>
                    )}
                    {reviewClaim.clinicWebsite && (
                      <div>
                        <span className="text-muted-foreground">Website</span>
                        <a href={reviewClaim.clinicWebsite} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline truncate block">
                          {reviewClaim.clinicWebsite}
                        </a>
                      </div>
                    )}
                    {reviewClaim.googleBusinessLink && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Google Business</span>
                        <a href={reviewClaim.googleBusinessLink} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline truncate block">
                          {reviewClaim.googleBusinessLink}
                        </a>
                      </div>
                    )}
                  </>
                )}

                {reviewClaim.entityType === 'practitioner' && (
                  <>
                    {reviewClaim.profession && (
                      <div>
                        <span className="text-muted-foreground">Profession</span>
                        <p className="font-medium">{reviewClaim.profession}</p>
                      </div>
                    )}
                    {reviewClaim.clinicNameInput && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Stated clinic</span>
                        <p className="font-medium">{reviewClaim.clinicNameInput}</p>
                      </div>
                    )}
                    {reviewClaim.licenseNumber && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Licence number</span>
                        <p className="font-medium">
                          {reviewClaim.licenseNumber}
                          {reviewClaim.registryName && (
                            <span className="text-muted-foreground ml-1">({reviewClaim.registryName})</span>
                          )}
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">Verify manually on the registry website before approving.</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {reviewClaim.domainVerified && (
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">Domain verified</Badge>
                )}
                {reviewClaim.affiliated && (
                  <Badge className="bg-emerald-100 text-emerald-800 text-xs">Affiliated</Badge>
                )}
                {reviewClaim.requiresManualReview && (
                  <Badge variant="destructive" className="text-xs">Manual review — personal email</Badge>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-notes">Notes (optional)</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Reason for approval or rejection…"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="destructive" onClick={() => handleReview('reject')} disabled={submitting}>
              Reject
            </Button>
            <Button onClick={() => handleReview('approve')} disabled={submitting}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
