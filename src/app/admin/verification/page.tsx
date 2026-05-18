'use client'

import { useEffect, useState } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface VerificationRequest {
  id: number
  entityType: 'clinic' | 'practitioner'
  entitySlug: string
  claimerName: string
  claimerEmail: string
  govIdFile: string | null
  selfieFile: string | null
  proofType: string | null
  proofFile: string | null
  status: 'pending' | 'approved' | 'rejected'
  adminNotes: string | null
  createdAt: string
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
}

const PROOF_LABELS: Record<string, string> = {
  work_email: 'Work email screenshot',
  contract: 'Contract / payslip',
  website: 'Website showing name',
  letter: 'Letter from clinic',
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState<VerificationRequest | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function fetchRequests(status?: string) {
    setLoading(true)
    const qs = status && status !== 'all' ? `?status=${status}` : ''
    fetch(`/directory/api/admin/verification${qs}`)
      .then((r) => r.json())
      .then((data) => { setRequests(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchRequests(filter) }, [filter])

  async function handleReview(action: 'approve' | 'reject') {
    if (!selected) return
    setSubmitting(true)
    try {
      const res = await fetch(`/directory/api/admin/verification/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNotes }),
      })
      if (!res.ok) throw new Error()
      toast.success(action === 'approve' ? 'ID verified — profile updated' : 'Request rejected')
      setSelected(null)
      setAdminNotes('')
      fetchRequests(filter)
    } catch {
      toast.error('Failed to update verification request')
    } finally {
      setSubmitting(false)
    }
  }

  const filterTabs = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'all', label: 'All' },
  ]

  return (
    <AdminLayout title="ID Verification">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">ID Verification Requests</h1>

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

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests found.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{r.claimerName}</span>
                  <span className="text-muted-foreground">{r.claimerEmail}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {r.entityType} · {r.entitySlug}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={STATUS_BADGE[r.status] ?? ''}>{r.status}</Badge>
                  {r.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSelected(r); setAdminNotes(r.adminNotes ?? '') }}
                    >
                      Review
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => { if (!open) { setSelected(null); setAdminNotes('') } }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review ID Verification</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 text-sm">
              {/* Claimer details */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <span className="text-muted-foreground text-xs">Type</span>
                  <p className="font-medium capitalize">{selected.entityType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Profile</span>
                  <p className="font-medium">{selected.entitySlug}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Full name</span>
                  <p className="font-medium">{selected.claimerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Email</span>
                  <p className="font-medium">{selected.claimerEmail}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documents</p>
                {[
                  { label: 'Government ID', file: selected.govIdFile },
                  { label: 'Selfie', file: selected.selfieFile },
                  { label: PROOF_LABELS[selected.proofType ?? ''] ?? 'Proof', file: selected.proofFile },
                ].filter((d) => d.file).map((doc) => {
                  const fileUrl = `/directory/api/admin/verification/file?path=${encodeURIComponent(doc.file!)}`
                  const isImage = /\.(jpe?g|png|webp|gif)$/i.test(doc.file!)
                  return (
                    <div key={doc.file} className="rounded-lg border bg-muted/30 p-3 space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="font-medium text-xs shrink-0">{doc.label}</span>
                        <a
                          href={fileUrl}
                          download
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline shrink-0"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                      {isImage && (
                        <img
                          src={fileUrl}
                          alt={doc.label}
                          className="max-h-64 max-w-full rounded-md border object-contain bg-white"
                        />
                      )}
                      {!isImage && (
                        <p className="text-xs text-muted-foreground font-mono truncate">
                          {doc.file!.split('/').pop()}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vr-notes">Admin notes (optional)</Label>
                <Textarea
                  id="vr-notes"
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes…"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-gray-900 hover:bg-gray-700 text-white"
                  disabled={submitting}
                  onClick={() => handleReview('approve')}
                >
                  {submitting ? 'Saving…' : 'Approve — set ID Verified'}
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={submitting}
                  onClick={() => handleReview('reject')}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
