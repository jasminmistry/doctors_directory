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
  const loginUrl = `${BASE_URL}/directory/admin/login`

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

${BASE_URL}/directory/admin

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
  <a href="${BASE_URL}/directory/admin"
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
