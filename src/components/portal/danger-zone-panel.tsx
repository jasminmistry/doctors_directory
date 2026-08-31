'use client'

import { useState } from 'react'
import { IconTrash } from '@tabler/icons-react'
import { DeleteAccountModal } from '@/components/portal/delete-account-modal'

interface DangerZonePanelProps {
  entityType: 'clinic' | 'practitioner'
  entityName: string
  plan?: string | null
}

export function DangerZonePanel({ entityType, entityName, plan }: DangerZonePanelProps) {
  const [modalOpen, setModalOpen] = useState(false)

  async function handleDeleted() {
    await fetch('/directory/api/auth/logout/', { method: 'POST' })
    window.location.href = '/directory/portal/login'
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-medium text-gray-900">Delete this {entityType} profile</p>
          <p className="text-xs text-gray-500 mt-1 max-w-md">
            Hidden immediately, then permanently removed after a 7-day grace period. You can cancel any
            time before then via an emailed link.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition shrink-0"
        >
          <IconTrash stroke={1.5} className="h-3.5 w-3.5" />
          Delete profile
        </button>
      </div>

      <DeleteAccountModal
        open={modalOpen}
        entityType={entityType}
        entityName={entityName}
        plan={plan}
        onClose={() => setModalOpen(false)}
        onDeleted={handleDeleted}
      />
    </div>
  )
}
