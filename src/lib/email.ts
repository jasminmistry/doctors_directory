import nodemailer from 'nodemailer'

function createTransport() {
  const host = process.env.SMTP_HOST ?? 'localhost'
  const port = parseInt(process.env.SMTP_PORT ?? '1025', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  })
}

const FROM = process.env.EMAIL_FROM ?? 'Consentz Directory <noreply@consentz.com>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'dax@consent.com'

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

export async function sendPplLeadTeaserEmail({
  to,
  clinicName,
  treatment,
  location,
  portalUrl,
}: {
  to: string
  clinicName: string
  treatment?: string
  location?: string
  portalUrl: string
}) {
  const transport = createTransport()

  await transport.sendMail({
    from: FROM,
    to,
    subject: `New consultation request for ${clinicName} — unlock to view`,
    text: `
Hi,

A patient has requested a consultation at ${clinicName} via Consentz Directory.${treatment ? `\nTreatment interest: ${treatment}` : ''}${location ? `\nLocation: ${location}` : ''}

Their contact details are hidden until you unlock this lead (£15).

View lead in your portal:
${portalUrl}

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
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
  <p style="color:#666;font-size:14px;">Unlock this lead for <strong>£15</strong> to see the patient's name and contact details.</p>
  <a href="${portalUrl}"
     style="display:inline-block;margin:0 0 24px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">
    Unlock lead — £15
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">— The Consentz Team</p>
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
}: {
  to: string
  clinicName: string
  patientName: string
  contact: string
  treatment?: string
  location?: string
  portalUrl: string
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
}: {
  to: string
  clinicName: string
  patientFirstName: string
  location: string
  pendingCount: number
  claimUrl: string
}) {
  const transport = createTransport()
  const otherLeads = pendingCount - 1
  const otherText = otherLeads > 0 ? ` and ${otherLeads} other pending lead${otherLeads === 1 ? '' : 's'}` : ''

  await transport.sendMail({
    from: FROM,
    to,
    subject: `${patientFirstName} just requested a consultation at ${clinicName} via Consentz`,
    text: `
Hi,

${patientFirstName} just requested a consultation at your clinic via Consentz. You are trending in ${location}!

Claim your profile to see their details${otherText}.

${claimUrl}

— The Consentz Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111;">
  <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
    <p style="margin:0;font-size:15px;">
      <strong>${patientFirstName}</strong> just requested a consultation at your clinic via Consentz.
      You are trending in <strong>${location}</strong>!
    </p>
    ${otherLeads > 0 ? `<p style="margin:8px 0 0;font-size:13px;color:#666;">Plus ${otherLeads} other pending lead${otherLeads === 1 ? '' : 's'} waiting for you.</p>` : ''}
  </div>
  <p>Claim your <strong>${clinicName}</strong> profile to see their details and start managing your leads.</p>
  <a href="${claimUrl}"
     style="display:inline-block;margin:16px 0 24px;padding:12px 28px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px;">
    Claim your profile
  </a>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
  <p style="color:#999;font-size:12px;">You received this because a patient requested a consultation at ${clinicName} on Consentz Directory.</p>
</body>
</html>
    `.trim(),
  })
}
