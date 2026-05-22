import { prisma } from '@/lib/db'

/**
 * Returns true if an approved claim for this clinic has a confirmed schedule.
 * Used to gate booking and call routes before hitting Core API.
 */
export async function isClinicScheduleConfigured(clinicId: number): Promise<boolean> {
  const claim = await prisma.claimRequest.findFirst({
    where: { clinicId, status: 'approved', scheduleConfigured: true },
    select: { id: true },
  })
  return claim !== null
}

export const SCHEDULE_NOT_CONFIGURED_RESPONSE = {
  error: 'Bookings are not available yet — the clinic has not configured their schedule.',
  code: 'SCHEDULE_NOT_CONFIGURED',
} as const
