import nodemailer from 'nodemailer'
import { PPL_LEAD_PRICE } from './pricing'

let cachedTransport: nodemailer.Transporter | null = null

function createTransport() {
  if (cachedTransport) return cachedTransport

  const host = process.env.SMTP_HOST ?? 'localhost'
  const port = parseInt(process.env.SMTP_PORT ?? '1025', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    // Pooled + rate-limited so bulk sends (e.g. claim-invite campaigns) reuse
    // connections instead of paying a fresh TLS/SMTP handshake per email.
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 3,
  })
  return cachedTransport
}

const FROM = process.env.EMAIL_FROM ?? 'Consentz Directory <noreply@consentz.com>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'dax@consent.com'

const EMAIL_HEADER_IMAGE_URL =
  'https://assets.unlayer.com/projects/0/1777556490007-Frame%205%20(1).png'
const EMAIL_HEADER = `<img src="${EMAIL_HEADER_IMAGE_URL}" alt="Consentz" style="width:100%;max-width:560px;height:auto;display:block;margin:0 0 24px;border-radius:8px;" />`

export async function sendClaimOtp({
  to,
  entityName,
  otp,
}: {
  to: string
  entityName: string
  otp: string
}) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to,
    subject: `Your verification code for ${entityName}`,
    text: `
Hi,

Your verification code for claiming ${entityName} on Consentz Directory is:

${otp}

This code expires in 10 minutes. Do not share it with anyone.

If you didn't request this, you can safely ignore this email.

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Your verification code</h2>
  <p>Enter this code to verify your claim for <strong>${entityName}</strong> on Consentz Directory.</p>
  <div style="margin:24px 0;padding:20px;background:#f5f5f5;border-radius:8px;text-align:center;">
    <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111;">${otp}</span>
  </div>
  <p style="color:#666;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendPasswordResetOtp({ to, otp }: { to: string; otp: string }) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to,
    subject: 'Reset your Consentz Directory password',
    text: `Your password reset code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, you can safely ignore this email.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Reset your password</h2>
  <p>Enter this code to set a new password for your Consentz Directory account.</p>
  <div style="margin:24px 0;padding:20px;background:#f5f5f5;border-radius:8px;text-align:center;">
    <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111;">${otp}</span>
  </div>
  <p style="color:#666;font-size:13px;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendWelcomeEmail({
  to,
  entityName,
  username,
  tempPassword,
}: {
  to: string
  entityName: string
  username: string
  tempPassword: string
}) {
  const transport = createTransport()
  const loginUrl = `${BASE_URL}/directory/portal/login`

  await transport.sendMail({
    from: FROM,
    to,
    subject: `Welcome to Consentz Directory — your account is ready`,
    text: `
Hi,

Your claim for ${entityName} on Consentz Directory has been approved and your account is ready.

Log in at: ${loginUrl}

Username: ${username}
Temporary password: ${tempPassword}

For your security, you will be asked to set a new password when you first log in. Do not share these credentials with anyone.

If you have any questions, contact us at support@consentz.com.

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Welcome to Consentz Directory</h2>
  <p>Your claim for <strong>${entityName}</strong> has been approved. Here are your login details:</p>
  <table style="margin:24px 0;background:#f5f5f5;border-radius:8px;width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:12px 16px;font-weight:600;width:45%;border-bottom:1px solid #e5e5e5;">Username</td>
      <td style="padding:12px 16px;font-family:monospace;font-size:15px;border-bottom:1px solid #e5e5e5;">${username}</td>
    </tr>
    <tr>
      <td style="padding:12px 16px;font-weight:600;">Temporary password</td>
      <td style="padding:12px 16px;font-family:monospace;font-size:15px;">${tempPassword}</td>
    </tr>
  </table>
  <a href="${loginUrl}"
     style="display:inline-block;margin:0 0 24px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
    Log in to your dashboard
  </a>
  <p style="color:#666;font-size:13px;">For your security, you will be asked to set a new password when you first log in. Do not share these credentials with anyone.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— The Consentz Team</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendClaimApprovedEmail({
  to,
  clinicName,
  plan,
}: {
  to: string
  clinicName: string
  plan: string
}) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to,
    subject: `Your claim for ${clinicName} has been approved`,
    text: `
Hi,

Great news — your claim for ${clinicName} on Consentz Directory has been approved.

You're now on the ${plan} plan. Log in to your dashboard to start managing your profile.

${BASE_URL}/directory/portal/login

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Claim approved!</h2>
  <p>Your claim for <strong>${clinicName}</strong> on Consentz Directory has been approved.</p>
  <p>You're now on the <strong>${plan}</strong> plan.</p>
  <a href="${BASE_URL}/directory/portal/login"
     style="display:inline-block;margin:24px 0;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
    Go to Dashboard
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— The Consentz Team</p>
</body>
</html>
    `.trim(),
  })
}

const PLAN_LABEL: Record<string, string> = {
  free: 'Free',
  pay_per_lead: 'Pay Per Lead',
  subscription: 'Subscription',
}

export async function sendPlanChangeEmail({
  to,
  entityName,
  action,
  fromPlan,
  toPlan,
  effectiveDate,
}: {
  to: string
  entityName: string
  action: 'scheduled_cancel' | 'immediate_downgrade' | 'resumed'
  fromPlan: string
  toPlan: string | null
  effectiveDate: Date | null
}) {
  const transport = createTransport()
  const fromLabel = PLAN_LABEL[fromPlan] ?? fromPlan
  const toLabel = toPlan ? (PLAN_LABEL[toPlan] ?? toPlan) : null
  const effectiveDateLabel = effectiveDate
    ? effectiveDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  let subject: string
  let heading: string
  let bodyText: string
  let bodyHtml: string

  if (action === 'scheduled_cancel') {
    subject = `Your plan change for ${entityName} is scheduled`
    heading = 'Plan change scheduled'
    bodyText = `Your ${fromLabel} plan will change to ${toLabel} on ${effectiveDateLabel}. You'll keep full access to your current plan until then.`
    bodyHtml = `<p>Your <strong>${fromLabel}</strong> plan for <strong>${entityName}</strong> will change to <strong>${toLabel}</strong> on <strong>${effectiveDateLabel}</strong>.</p><p>You'll keep full access to your current plan until then.</p>`
  } else if (action === 'immediate_downgrade') {
    subject = `${entityName} has been moved to the ${toLabel} plan`
    heading = 'Plan changed'
    bodyText = `Your plan for ${entityName} has changed from ${fromLabel} to ${toLabel}, effective immediately.`
    bodyHtml = `<p>Your plan for <strong>${entityName}</strong> has changed from <strong>${fromLabel}</strong> to <strong>${toLabel}</strong>, effective immediately.</p>`
  } else {
    subject = `Your ${entityName} subscription cancellation was undone`
    heading = 'Cancellation undone'
    bodyText = `Your scheduled cancellation for ${entityName} has been reversed. You'll stay on the ${fromLabel} plan and continue to be billed as normal.`
    bodyHtml = `<p>Your scheduled cancellation for <strong>${entityName}</strong> has been reversed. You'll stay on the <strong>${fromLabel}</strong> plan and continue to be billed as normal.</p>`
  }

  await transport.sendMail({
    from: FROM,
    to,
    subject,
    text: `
Hi,

${bodyText}

View your plan in your portal:
${BASE_URL}/directory/portal/login

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">${heading}</h2>
  ${bodyHtml}
  <a href="${BASE_URL}/directory/portal/login"
     style="display:inline-block;margin:24px 0;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
    Go to Dashboard
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— The Consentz Team</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendPplLeadTeaserEmail({
  to,
  clinicName,
  treatment,
  location,
  portalUrl,
  trackingPixelUrl,
}: {
  to: string
  clinicName: string
  treatment?: string
  location?: string
  portalUrl: string
  /** Open-tracking pixel URL — appended as a hidden 1x1 image when present. */
  trackingPixelUrl?: string
}) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to,
    subject: `New consultation request for ${clinicName} — unlock to view`,
    text: `
Hi,

A patient has requested a consultation at ${clinicName} via Consentz Directory.${treatment ? `\nTreatment interest: ${treatment}` : ''}${location ? `\nLocation: ${location}` : ''}

Their contact details are hidden until you unlock this lead (£${PPL_LEAD_PRICE}).

View lead in your portal:
${portalUrl}

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">New consultation request</h2>
  <p>A patient has requested a consultation at <strong>${clinicName}</strong> via Consentz Directory.</p>
  <table style="margin:20px 0;background:#f5f5f5;border-radius:8px;width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:10px 16px;font-weight:600;width:35%;border-bottom:1px solid #e5e5e5;">Patient</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;color:#999;font-style:italic;">Hidden — unlock to reveal</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #e5e5e5;">Contact</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;color:#999;font-style:italic;">Hidden — unlock to reveal</td>
    </tr>
    ${treatment ? `<tr><td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #e5e5e5;">Treatment</td><td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;">${treatment}</td></tr>` : ''}
    ${location ? `<tr><td style="padding:10px 16px;font-weight:600;">Location</td><td style="padding:10px 16px;">${location}</td></tr>` : ''}
  </table>
  <p style="color:#666;font-size:14px;">Unlock this lead for <strong>£${PPL_LEAD_PRICE}</strong> to see the patient's name and contact details.</p>
  <a href="${portalUrl}"
     style="display:inline-block;margin:0 0 24px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
    Unlock lead — £${PPL_LEAD_PRICE}
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— The Consentz Team</p>
  ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none" />` : ''}
</body>
</html>
    `.trim(),
  })
}

export async function sendLeadNotificationEmail({
  to,
  clinicName,
  patientName,
  contact,
  treatment,
  location,
  portalUrl,
  trackingPixelUrl,
}: {
  to: string
  clinicName: string
  patientName: string
  contact: string
  treatment?: string
  location?: string
  portalUrl: string
  /** Open-tracking pixel URL — appended as a hidden 1x1 image when present. */
  trackingPixelUrl?: string
}) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to,
    subject: `New consultation request for ${clinicName}`,
    text: `
Hi,

A new consultation request has been submitted for ${clinicName} on Consentz Directory.

Patient: ${patientName}
Contact: ${contact}${treatment ? `\nTreatment: ${treatment}` : ''}${location ? `\nLocation: ${location}` : ''}

View this lead in your portal:
${portalUrl}

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">New consultation request</h2>
  <p>A patient has requested a consultation at <strong>${clinicName}</strong> via Consentz Directory.</p>
  <table style="margin:20px 0;background:#f5f5f5;border-radius:8px;width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:10px 16px;font-weight:600;width:35%;border-bottom:1px solid #e5e5e5;">Patient</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;">${patientName}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #e5e5e5;">Contact</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;">${contact}</td>
    </tr>
    ${treatment ? `<tr><td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #e5e5e5;">Treatment</td><td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;">${treatment}</td></tr>` : ''}
    ${location ? `<tr><td style="padding:10px 16px;font-weight:600;">Location</td><td style="padding:10px 16px;">${location}</td></tr>` : ''}
  </table>
  <a href="${portalUrl}"
     style="display:inline-block;margin:0 0 24px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
    View lead in portal
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— The Consentz Team</p>
  ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none" />` : ''}
</body>
</html>
    `.trim(),
  })
}

export async function sendMagicLinkEmail({ to, magicLink }: { to: string; magicLink: string }) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to,
    subject: 'Sign in to Consentz Directory',
    text: `Hi,\n\nClick the link below to sign in to your Consentz Directory account:\n\n${magicLink}\n\nThis link expires in 15 minutes and can only be used once.\n\nIf you didn't request this, you can safely ignore this email.\n\n— The Consentz Team`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Sign in to Consentz Directory</h2>
  <p>Click the button below to sign in to your account. No password needed.</p>
  <a href="${magicLink}"
     style="display:inline-block;margin:24px 0;padding:14px 28px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
    Sign in to your account
  </a>
  <p style="color:#666;font-size:13px;">This link expires in <strong>15 minutes</strong> and can only be used once.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">If you didn't request this, you can safely ignore this email.</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendReviewRequestEmail({
  to,
  clinicName,
  feedbackUrl,
}: {
  to: string
  clinicName: string
  feedbackUrl: string
}) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to,
    subject: `How was your visit to ${clinicName}?`,
    text: `Hi,\n\n${clinicName} would love to hear about your experience. It takes less than a minute:\n\n${feedbackUrl}\n\nThank you,\n${clinicName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">How was your visit to ${clinicName}?</h2>
  <p>${clinicName} would love to hear about your experience. It takes less than a minute and helps other patients.</p>
  <a href="${feedbackUrl}"
     style="display:inline-block;margin:24px 0;padding:14px 28px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
    Leave your feedback
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">If this wasn't meant for you, you can ignore this email.</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendClaimRejectedEmail({
  to,
  entityName,
  adminNotes,
}: {
  to: string
  entityName: string
  adminNotes?: string | null
}) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to,
    subject: `Your claim for ${entityName} was not approved`,
    text: `
Hi,

Thank you for submitting your claim for ${entityName} on Consentz Directory.

Unfortunately, we were unable to approve your claim at this time.${adminNotes ? `\n\nReason: ${adminNotes}` : ''}

If you believe this is an error or would like to provide additional information, please contact us at support@consentz.com.

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Claim not approved</h2>
  <p>Thank you for submitting your claim for <strong>${entityName}</strong> on Consentz Directory.</p>
  <p>Unfortunately, we were unable to approve your claim at this time.</p>
  ${adminNotes ? `<div style="margin:20px 0;padding:16px;background:#fff3f3;border-left:4px solid #e53e3e;border-radius:4px;"><p style="margin:0;font-size:14px;color:#333;"><strong>Reason:</strong> ${adminNotes}</p></div>` : ''}
  <p style="color:#666;font-size:14px;">If you believe this is an error or would like to provide additional information, please contact us at <a href="mailto:support@consentz.com" style="color:#111;">support@consentz.com</a>.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— The Consentz Team</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendUnlinkRequestNotification({
  clinicName,
  clinicSlug,
  coreClinicId,
  requestedAt,
}: {
  clinicName: string
  clinicSlug: string
  coreClinicId: number
  requestedAt: Date
}) {
  const transport = createTransport()
  const reviewUrl = `${BASE_URL}/directory/admin/unlink-requests`
  const dateStr = requestedAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

  await transport.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Core unlink request — ${clinicName}`,
    text: `
${clinicName} has requested to disconnect their Consentz Core account from the directory.

Core Clinic ID: ${coreClinicId}
Requested at: ${dateStr}

Review and action this request:
${reviewUrl}

— Consentz Directory
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Core unlink request</h2>
  <p><strong>${clinicName}</strong> has requested to disconnect their Consentz Core account from the directory.</p>
  <table style="margin:20px 0;background:#f5f5f5;border-radius:8px;width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:10px 16px;font-weight:600;width:40%;border-bottom:1px solid #e5e5e5;">Clinic</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;">${clinicName}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #e5e5e5;">Core Clinic ID</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;">${coreClinicId}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-weight:600;">Requested at</td>
      <td style="padding:10px 16px;">${dateStr}</td>
    </tr>
  </table>
  <a href="${reviewUrl}"
     style="display:inline-block;margin:0 0 24px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
    Review unlink requests
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— Consentz Directory</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendDirectoryRemovalRequestNotification({
  clinicName,
  clinicSlug,
  requestedAt,
}: {
  clinicName: string
  clinicSlug: string
  requestedAt: Date
}) {
  const transport = createTransport()
  const reviewUrl = `${BASE_URL}/directory/admin/directory-removal-requests`
  const dateStr = requestedAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

  await transport.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Directory removal request — ${clinicName}`,
    text: `
${clinicName} has requested to have their listing removed from the Consentz Directory.

Clinic slug: ${clinicSlug}
Requested at: ${dateStr}

Review and action this request:
${reviewUrl}

— Consentz Directory
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Directory removal request</h2>
  <p><strong>${clinicName}</strong> has requested to have their listing removed from the Consentz Directory.</p>
  <table style="margin:20px 0;background:#f5f5f5;border-radius:8px;width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:10px 16px;font-weight:600;width:40%;border-bottom:1px solid #e5e5e5;">Clinic</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;">${clinicName}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-weight:600;border-bottom:1px solid #e5e5e5;">Slug</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;">${clinicSlug}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-weight:600;">Requested at</td>
      <td style="padding:10px 16px;">${dateStr}</td>
    </tr>
  </table>
  <a href="${reviewUrl}"
     style="display:inline-block;margin:0 0 24px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
    Review removal requests
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— Consentz Directory</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendAccountDeletionRequestedEmail({
  to,
  entityName,
  scheduledDeletionAt,
  cancelUrl,
}: {
  to: string
  entityName: string
  scheduledDeletionAt: Date
  cancelUrl: string
}) {
  const transport = createTransport()
  const dateStr = scheduledDeletionAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

  await transport.sendMail({
    from: FROM,
    to,
    subject: `Your Consentz Directory listing is scheduled for deletion`,
    text: `
We've received a request to delete ${entityName}'s profile from the Consentz Directory.

Your listing has been hidden immediately. Unless you cancel, it will be permanently deleted on ${dateStr}.

If this wasn't you, or you've changed your mind, cancel the deletion here:
${cancelUrl}

— Consentz Directory
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Your listing is scheduled for deletion</h2>
  <p>We've received a request to delete <strong>${entityName}</strong>'s profile from the Consentz Directory.</p>
  <p>Your listing has been hidden immediately. Unless you cancel, it will be <strong>permanently deleted on ${dateStr}</strong>.</p>
  <a href="${cancelUrl}"
     style="display:inline-block;margin:16px 0 24px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
    Cancel deletion
  </a>
  <p style="color:#666;font-size:13px;">If this wasn't you, cancelling will restore your listing and portal access immediately.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— Consentz Directory</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendAccountDeletionRequestedNotification({
  entityType,
  entityName,
  entitySlug,
  scheduledDeletionAt,
}: {
  entityType: 'clinic' | 'practitioner'
  entityName: string
  entitySlug: string
  scheduledDeletionAt: Date
}) {
  const transport = createTransport()
  const dateStr = scheduledDeletionAt.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

  await transport.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Account deletion requested — ${entityName}`,
    text: `
${entityName} (${entityType}) has requested to delete their profile from the Consentz Directory.

Slug: ${entitySlug}
Scheduled hard-delete: ${dateStr} (7-day grace period, self-cancellable via emailed link)

— Consentz Directory
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <h2 style="margin-bottom:8px;">Account deletion requested</h2>
  <p><strong>${entityName}</strong> (${entityType}) has requested to delete their profile from the Consentz Directory.</p>
  <table style="margin:20px 0;background:#f5f5f5;border-radius:8px;width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:10px 16px;font-weight:600;width:40%;border-bottom:1px solid #e5e5e5;">Slug</td>
      <td style="padding:10px 16px;border-bottom:1px solid #e5e5e5;">${entitySlug}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-weight:600;">Scheduled hard-delete</td>
      <td style="padding:10px 16px;">${dateStr}</td>
    </tr>
  </table>
  <p style="color:#666;font-size:13px;">Self-serve, 7-day grace period. No action needed unless you want to restore or purge it early from the admin console.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— Consentz Directory</p>
</body>
</html>
    `.trim(),
  })
}

export async function sendTemplateDownloadRequestEmail({
  clinicName,
  contactName,
  email,
  phone,
  address,
  city,
  website,
  category,
  templateTitle,
}: {
  clinicName: string
  contactName: string
  email: string
  phone: string
  address: string
  city: string
  website?: string
  category?: string
  templateTitle?: string
}) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Template download request — ${clinicName}`,
    text: `
${contactName} (${clinicName}) requested a template download${templateTitle ? `: ${templateTitle}` : ''}.

Email: ${email}
Phone: ${phone}
Address: ${address}, ${city}
Website: ${website ?? '—'}
Category: ${category ?? '—'}

— Consentz Directory
    `.trim(),
  })
}

export async function sendGhostLeadHook({
  to,
  clinicName,
  patientFirstName,
  location,
  pendingCount,
  claimUrl,
  trackingPixelUrl,
}: {
  to: string
  clinicName: string
  /** Omitted for slimmed unclaimed-clinic enquiries — falls back to "A patient". */
  patientFirstName?: string
  location: string
  pendingCount: number
  claimUrl: string
  /** Open-tracking pixel URL — appended as a hidden 1x1 image when present. */
  trackingPixelUrl?: string
}) {
  const transport = createTransport()
  const who = patientFirstName || 'A patient'
  const otherLeads = pendingCount - 1
  const otherText = otherLeads > 0 ? ` and ${otherLeads} other pending lead${otherLeads === 1 ? '' : 's'}` : ''
  const locationText = location ? ` in ${location}` : ''

  await transport.sendMail({
    from: FROM,
    to,
    subject: `${who} has requested a consultation at ${clinicName} via Consentz`,
    text: `
Hi,

${who} has requested a consultation at your clinic${locationText} through Consentz.

Claim your ${clinicName} profile to access the patient's details and manage your enquiries${otherText}.

The Consentz Directory connects clinics with their clients — helping patients find the best practitioners in their city, and helping clinics like yours claim their profile and respond to consultation requests.

${claimUrl}

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  ${EMAIL_HEADER}
  <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
    <p style="margin:0;font-size:15px;">
      <strong>${who}</strong> has requested a consultation at your clinic${location ? ` in <strong>${location}</strong>` : ''} through Consentz.
    </p>
    ${otherLeads > 0 ? `<p style="margin:8px 0 0;font-size:13px;color:#666;">Plus ${otherLeads} other pending lead${otherLeads === 1 ? '' : 's'} waiting for you.</p>` : ''}
  </div>
  <p>Claim your <strong>${clinicName}</strong> profile to access the patient's details and manage your enquiries.</p>
  <a href="${claimUrl}"
     style="display:inline-block;margin:16px 0 24px;padding:12px 28px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
    Claim your profile
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="font-size:14px;color:#444;line-height:1.5;">
    The Consentz Directory connects clinics with their clients — helping patients find the best practitioners in their city, and helping clinics like yours claim their profile and respond to consultation requests.
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">You received this because a patient requested a consultation at ${clinicName} on Consentz Directory.</p>
  ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none" />` : ''}
</body>
</html>
    `.trim(),
  })
}

export async function sendClaimInviteEmail({
  to,
  clinicName,
  claimUrl,
  unsubscribeUrl,
  removeUrl,
  trackingPixelUrl,
}: {
  to: string
  clinicName: string
  claimUrl: string
  /** Stops future campaign emails only. */
  unsubscribeUrl: string
  /** Stops future campaign emails AND raises a directory listing removal request for admin review. */
  removeUrl: string
  /** Open-tracking pixel URL — appended as a hidden 1x1 image when present. */
  trackingPixelUrl?: string
}) {
  const transport = createTransport()
  const supportEmail = 'care@consentz.com'
  const privacyUrl = 'https://consentz.com/privacy'

  await transport.sendMail({
    from: FROM,
    to,
    subject: 'Claim your free Consentz Directory listing',
    text: `
Hi ${clinicName}

The Consentz Directory is the UK's leading Aesthetics and Wellness marketplace, helping prospective patients discover and compare trusted aesthetic and private healthcare clinics — while giving clinics an opportunity to showcase their treatments, expertise and services for free.

We noticed that your clinic is listed in the Consentz Directory, but your profile hasn't yet been claimed.

Claiming your listing is free and only takes a minute. Once verified, you'll be able to:

- Receive leads from prospective patients who have requested further information and/or are ready to book a consultation.
- Increase your visibility to people actively searching for clinics like yours.
- Update your clinic information and contact details.
- Add descriptions and images.
- Showcase your treatments and specialisms.
- Keep your profile accurate and up to date for prospective patients.

Claim your clinic: ${claimUrl}

If you have any questions, simply email us at ${supportEmail} — we'd be happy to help.

---

Why have you received this email?

We believe the Consentz Directory is relevant to your business and are contacting you under our legitimate interests (Article 6(1)(f) UK GDPR) to invite you to manage your clinic's listing.

As we did not obtain your contact details directly from you, this email also serves as the information notice required under Article 14 of the UK GDPR. Information about how we collect, use and protect your personal data, your rights, and how to contact us can be found in our Privacy Notice: ${privacyUrl}

If your clinic has already been claimed, or you believe you've received this email in error, please let us know.

Unsubscribe: If you no longer wish to receive emails from us, visit ${unsubscribeUrl} or reply with "Unsubscribe" and we'll remove you from future communications.

Remove your listing: If you do not wish your clinic to appear in the Consentz Directory, visit ${removeUrl} or contact us and we'll process your request promptly, subject to any legal obligations to retain certain records.

Thank you,
The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;font-size:15px;">
  ${EMAIL_HEADER}
  <p style="font-size:15px;">Hi ${clinicName}</p>
  <p style="font-size:15px;">The <strong>Consentz Directory</strong> is the UK's leading Aesthetics and Wellness marketplace, helping prospective patients discover and compare trusted aesthetic and private healthcare clinics, while giving clinics an opportunity to showcase their treatments, expertise and services for <strong>free</strong>.</p>
  <p style="font-size:15px;">We noticed that your clinic is listed in the Consentz Directory, but your profile hasn't yet been claimed.</p>
  <p style="font-size:15px;">Claiming your listing is <strong>free</strong> and only takes a minute. Once verified, you'll be able to:</p>
  <ul style="font-size:15px;line-height:1.6;color:#333;padding-left:20px;">
    <li>Receive leads from prospective patients who have requested further information and/or are ready to book a consultation.</li>
    <li>Increase your visibility to people actively searching for clinics like yours.</li>
    <li>Update your clinic information and contact details.</li>
    <li>Add descriptions and images.</li>
    <li>Showcase your treatments and specialisms.</li>
    <li>Keep your profile accurate and up to date for prospective patients.</li>
  </ul>
  <a href="${claimUrl}"
     style="display:inline-block;margin:16px 0 24px;padding:12px 28px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
    Claim Listing
  </a>
  <p style="font-size:15px;">If you have any questions, simply email us at <a href="mailto:${supportEmail}">${supportEmail}</a> — we'd be happy to help.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="font-size:13px;color:#333;font-weight:600;">Why have you received this email?</p>
  <p style="font-size:13px;color:#333;line-height:1.6;">
    We believe the Consentz Directory is relevant to your business and are contacting you under our legitimate interests (Article 6(1)(f) UK GDPR) to invite you to manage your clinic's listing.
  </p>
  <p style="font-size:13px;color:#333;line-height:1.6;">
    As we did not obtain your contact details directly from you, this email also serves as the information notice required under <strong>Article 14 of the UK GDPR</strong>. Information about how we collect, use and protect your personal data, your rights, and how to contact us can be found in our <a href="${privacyUrl}" style="color:#333;">Privacy Notice</a>.
  </p>
  <p style="font-size:13px;color:#333;line-height:1.6;">
    If your clinic has already been claimed, or you believe you've received this email in error, please let us know.
  </p>
  <p style="font-size:13px;color:#333;line-height:1.6;">
    <strong>Unsubscribe:</strong> If you no longer wish to receive emails from us, <a href="${unsubscribeUrl}" style="color:#333;">click here</a> or reply with "Unsubscribe" and we'll remove you from future communications.
  </p>
  <p style="font-size:13px;color:#333;line-height:1.6;">
    <strong>Remove your listing:</strong> If you do not wish your clinic to appear in the Consentz Directory, <a href="${removeUrl}" style="color:#333;">click here</a> or contact us and we'll process your request promptly, subject to any legal obligations to retain certain records.
  </p>
  <p style="font-size:13px;color:#333;">Thank you,<br />The Consentz Team</p>
  ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" alt="" style="display:none" />` : ''}
</body>
</html>
    `.trim(),
  })
}
