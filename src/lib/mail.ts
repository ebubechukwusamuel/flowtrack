import nodemailer from "nodemailer"

export interface SmtpConfig {
  host: string
  port: number
  user: string
  pass: string
}

function createTransport(cfg: SmtpConfig) {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  })
}

export async function sendEmail({
  to,
  subject,
  html,
  smtp,
}: {
  to: string
  subject: string
  html: string
  smtp?: SmtpConfig | null
}) {
  if (smtp?.host && smtp?.user && smtp?.pass) {
    console.log(`[MAIL] Sending via configured SMTP: ${smtp.host}`)
    const transport = createTransport(smtp)
    const info = await transport.sendMail({
      from: `"FlowTrack" <noreply@${smtp.host}>`,
      to,
      subject,
      html,
    })
    console.log(`[MAIL] Sent via SMTP to ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId, method: "smtp" }
  }

  const envHost = process.env.SMTP_HOST
  const envUser = process.env.SMTP_USER
  const envPass = process.env.SMTP_PASS
  if (envHost && envUser && envPass) {
    console.log(`[MAIL] Sending via env SMTP: ${envHost}`)
    const transport = createTransport({ host: envHost, port: parseInt(process.env.SMTP_PORT || "587"), user: envUser, pass: envPass })
    const info = await transport.sendMail({
      from: `"FlowTrack" <noreply@flowtrack.app>`,
      to,
      subject,
      html,
    })
    console.log(`[MAIL] Sent via env SMTP to ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId, method: "env-smtp" }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    console.log("[MAIL] Sending via Resend")
    const transport = createTransport({ host: "smtp.resend.com", port: 465, user: "resend", pass: apiKey })
    const info = await transport.sendMail({
      from: `"FlowTrack" <noreply@flowtrack.app>`,
      to,
      subject,
      html,
    })
    console.log(`[MAIL] Sent via Resend to ${to}: ${info.messageId}`)
    return { success: true, messageId: info.messageId, method: "resend" }
  }

  console.log("[MAIL] No SMTP configured — using Ethereal test account")
  const testAccount = await nodemailer.createTestAccount()
  console.log("[MAIL] Ethereal account:", testAccount.user)
  const transport = createTransport({ host: "smtp.ethereal.email", port: 587, user: testAccount.user, pass: testAccount.pass })
  const info = await transport.sendMail({
    from: `"FlowTrack" <noreply@flowtrack.app>`,
    to,
    subject,
    html,
  })
  const previewUrl = nodemailer.getTestMessageUrl(info)
  console.log(`[MAIL] Sent via Ethereal to ${to}: ${info.messageId}`)
  if (previewUrl) console.log(`[MAIL] Preview (emails NOT delivered to real inbox!): ${previewUrl}`)
  console.log("[MAIL] ⚠️  Configure SMTP in Settings > Email Configuration for real delivery")

  return { success: true, messageId: info.messageId, method: "ethereal", previewUrl }
}

export function buildInviteEmailHtml({
  inviterName,
  orgName,
  acceptUrl,
}: {
  inviterName: string
  orgName: string
  acceptUrl: string
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 40px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table style="max-width: 480px; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <div style="width: 48px; height: 48px; background: #18181b; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">FT</div>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 8px;">
              <h1 style="font-size: 22px; font-weight: 700; color: #18181b; margin: 0;">You're invited to ${orgName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="font-size: 15px; color: #52525b; line-height: 1.5; margin: 0;">
                ${inviterName} has invited you to join their workspace on <strong>FlowTrack</strong>.
                Click the button below to accept the invitation and start collaborating.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="${acceptUrl}" style="display: inline-block; background: #18181b; color: white; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                Accept Invitation
              </a>
            </td>
          </tr>
          <tr>
            <td>
              <p style="font-size: 13px; color: #a1a1aa; margin: 0; text-align: center;">
                If you don't have a FlowTrack account yet, you'll be prompted to create one first.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
