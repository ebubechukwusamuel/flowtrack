import nodemailer from "nodemailer"

export interface SmtpConfig {
  host: string
  port: number
  user: string
  pass: string
}

function isValidHostname(h: string) {
  return !/[^a-zA-Z0-9.-]/.test(h)
}

export async function sendViaSmtp(
  to: string,
  subject: string,
  html: string,
  cfg: SmtpConfig,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!cfg.host || !cfg.user || !cfg.pass || !isValidHostname(cfg.host)) {
    return { success: false, error: "Invalid SMTP configuration" }
  }

  const transport = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.port === 465,
    auth: { user: cfg.user, pass: cfg.pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  })

  try {
    const from = `"FlowTrack" <${cfg.user}>`
    const info = await transport.sendMail({ from, to, subject, html })
    return { success: true, messageId: info.messageId }
  } catch (err: any) {
    return { success: false, error: err?.message || "SMTP connection failed" }
  }
}
