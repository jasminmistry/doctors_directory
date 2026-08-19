import { NextResponse } from 'next/server'
import { getPortalUser } from '@/lib/portal'
import {
  requestClinicDeletion,
  requestPractitionerDeletion,
  signDeletionCancelToken,
} from '@/lib/account-deletion'
import { sendAccountDeletionRequestedEmail, sendAccountDeletionRequestedNotification } from '@/lib/email'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

export async function POST() {
  const user = await getPortalUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const scheduledDeletionAt =
      user.entityType === 'clinic' && user.clinicId
        ? await requestClinicDeletion(user.clinicId)
        : user.entityType === 'practitioner' && user.practitionerId
          ? await requestPractitionerDeletion(user.practitionerId)
          : null

    if (!scheduledDeletionAt) {
      return NextResponse.json({ error: 'No deletable entity found for this account' }, { status: 400 })
    }

    const entityId = user.entityType === 'clinic' ? user.clinicId! : user.practitionerId!
    const cancelToken = signDeletionCancelToken(user.entityType, entityId)
    const cancelUrl = `${BASE_URL}/directory/api/account-deletion/cancel?token=${cancelToken}`

    await sendAccountDeletionRequestedEmail({
      to: user.claimerEmail,
      entityName: user.entityName,
      scheduledDeletionAt,
      cancelUrl,
    }).catch((err) => console.error('Failed to send account deletion email:', err))

    sendAccountDeletionRequestedNotification({
      entityType: user.entityType,
      entityName: user.entityName,
      entitySlug: user.entitySlug,
      scheduledDeletionAt,
    }).catch((err) => console.error('Failed to send account deletion notification:', err))

    return NextResponse.json({ ok: true, scheduledDeletionAt })
  } catch (error) {
    console.error('Failed to request account deletion:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
