import { redirect } from 'next/navigation'
import { getPortalUser } from '@/lib/portal'
import { prisma } from '@/lib/db'
import { ChatInbox } from '@/components/portal/chat-inbox'

export const metadata = { title: 'Chat — Clinic Portal' }

export default async function ClinicChatPage() {
  const user = await getPortalUser()
  if (!user?.clinicId) redirect('/portal/login?next=/portal/clinic/chat')

  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    select: { claimedPlan: true },
  })

  const isFree = !clinic?.claimedPlan || clinic.claimedPlan === 'free'

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Consultation Chat</h1>

      {isFree && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Free plan — limited chat.</strong> You can receive and reply to patient chats, but
          conversations are not synced to Consentz Core and patient contact details are not stored in
          your Core inbox. Upgrade to Pay-Per-Lead or Subscription to unlock full Core integration.{' '}
          <a href="/portal/clinic/upgrade" className="underline font-medium">
            View plans →
          </a>
        </div>
      )}

      <ChatInbox />
    </div>
  )
}
