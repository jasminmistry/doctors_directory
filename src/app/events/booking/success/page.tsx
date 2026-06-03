import { redirect } from 'next/navigation'
import Link from 'next/link'
import Stripe from 'stripe'
import { CheckCircle2, Video, Calendar, Mail } from 'lucide-react'

function formatSlotDate(isoStr: string): string {
  try {
    return new Date(isoStr).toLocaleString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London',
    })
  } catch {
    return isoStr
  }
}

export default async function EventBookingSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id
  if (!sessionId) redirect('/')

  let meta: Record<string, string> | null = null
  let amountPaid: number | null = null

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') redirect('/')

    meta = (session.metadata ?? {}) as Record<string, string>
    amountPaid = session.amount_total ? session.amount_total / 100 : null
  } catch {
    redirect('/')
  }

  if (!meta || meta.type !== 'event_booking') redirect('/')

  const {
    event_title,
    slot_start,
    patient_first_name,
    patient_last_name,
    patient_email,
  } = meta

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-green-50 px-6 py-8 text-center border-b border-green-100">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Booking Confirmed</h1>
          <p className="text-sm text-gray-500 mt-1">Payment received successfully</p>
        </div>

        {/* Details */}
        <div className="px-6 py-6 space-y-4">
          <div className="flex items-start gap-3">
            <Video className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Event</p>
              <p className="text-sm font-semibold text-gray-900">{event_title}</p>
              {amountPaid !== null && (
                <p className="text-xs text-gray-500 mt-0.5">£{amountPaid.toFixed(2)} paid</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Date &amp; Time</p>
              <p className="text-sm font-semibold text-gray-900">{formatSlotDate(slot_start)}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Confirmation sent to</p>
              <p className="text-sm font-semibold text-gray-900">{patient_email}</p>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700 leading-relaxed">
            A confirmation email with your video call link has been sent to{' '}
            <strong>{patient_first_name} {patient_last_name}</strong> at{' '}
            <strong>{patient_email}</strong>.
          </div>
        </div>

        <div className="px-6 pb-6">
          <Link
            href="/"
            className="block w-full text-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    </div>
  )
}
