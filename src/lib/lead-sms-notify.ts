import { prisma } from '@/lib/db'
import { sendMpEvents, syntheticClientId } from '@/lib/analytics/measurement-protocol'
import { toE164 } from '@/lib/phone'
import { signSmsTrackingToken } from '@/lib/sms-tracking'
import {
  sendGhostLeadSms,
  sendLeadNotificationSms,
  sendLeadTeaserSms,
  type SmsSendResult,
} from '@/lib/sms'

export type SmsSendMode = 'fallback' | 'always' | 'off'

/** Global default when a clinic has no `smsNotifyMode` override. */
export function globalSmsSendMode(): SmsSendMode {
  const raw = (process.env.SMS_SEND_MODE ?? 'fallback').toLowerCase()
  return raw === 'always' || raw === 'off' ? raw : 'fallback'
}

export function resolveSmsSendMode(clinicOverride: string | null | undefined): SmsSendMode {
  const o = (clinicOverride ?? '').toLowerCase()
  if (o === 'always' || o === 'off' || o === 'fallback') return o
  return globalSmsSendMode()
}

interface NotifyArgs {
  leadId: number
  clinic: {
    id: number
    name: string | null
    slug: string
    claimed: boolean
    claimedPlan: string | null
    email: string | null
    gmapsPhone: string | null
    smsNotifyMode: string | null
    gaClientId: string | null
  }
  /** Best phone from the approved claim (clinicPhone → claimerPhone), if any. */
  claimPhone?: string | null
  leadSource?: 'consultation' | 'pricing'
  /** The clinic had an email and we attempted (or would have attempted) to send it. */
  emailAvailable: boolean
  /** The email path failed (no mail server, send threw). */
  emailFailed: boolean
  /** For ghost leads: only true when the clinic is genuinely still unclaimed. */
  ghostEligible: boolean
  baseUrl: string
}

/**
 * Decide whether to send the clinic a lead-notification SMS, send it, and record
 * the outcome on the lead. Never throws — a send failure is logged and swallowed
 * exactly like the email path, because the lead is already persisted.
 */
export async function notifyClinicBySms(args: NotifyArgs): Promise<void> {
  try {
    const { clinic } = args
    const mode = resolveSmsSendMode(clinic.smsNotifyMode)
    if (mode === 'off') return

    // Ghost lead where the clinic has since started/finished a claim — don't nag.
    if (!clinic.claimed && !args.ghostEligible) return

    const phone = toE164(args.claimPhone) ?? toE164(clinic.gmapsPhone)
    if (!phone) return

    const shouldSend = mode === 'always' ? true : !args.emailAvailable || args.emailFailed
    if (!shouldSend) return

    const clinicName = clinic.name ?? clinic.slug
    const trackedUrl = `${args.baseUrl}/directory/api/track/sms-click/${signSmsTrackingToken('lead', args.leadId)}/`

    let result: SmsSendResult | null
    if (!clinic.claimed) {
      result = await sendGhostLeadSms({ to: phone, clinicName, trackedUrl })
    } else if (clinic.claimedPlan === 'subscription') {
      result = await sendLeadNotificationSms({ to: phone, clinicName, leadSource: args.leadSource, trackedUrl })
    } else {
      result = await sendLeadTeaserSms({ to: phone, clinicName, leadSource: args.leadSource, trackedUrl })
    }

    // Twilio not configured — nothing sent, nothing to record.
    if (!result) return

    await prisma.consultationLead.updateMany({
      where: { id: args.leadId, notificationSmsSentAt: null },
      data: {
        notificationSmsTo: phone,
        notificationSmsSid: result.sid,
        notificationSmsStatus: result.status,
        notificationSmsSentAt: new Date(),
      },
    })

    await sendMpEvents(clinic.gaClientId ?? syntheticClientId(`clinic-${clinic.id}`), [
      {
        name: 'sms_notification_sent',
        params: {
          lead_source: args.leadSource ?? 'consultation',
          clinic_slug: clinic.slug,
          ghost: !clinic.claimed,
          plan: clinic.claimedPlan ?? 'unclaimed',
          send_mode: mode,
        },
      },
    ])
  } catch (err) {
    console.error('[leads] clinic notification SMS error:', err)
  }
}
