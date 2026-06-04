import { prisma } from "@/lib/db"
import { sendViaSmtp, type SmtpConfig } from "./providers/smtp"
import { sendViaResend } from "./providers/resend"

export type EmailProvider = "smtp" | "env-smtp" | "resend" | "none"

export interface SendEmailInput {
  to: string
  subject: string
  html: string
  smtp?: SmtpConfig | null
  organizationId?: string
  invitedById?: string
}

export interface SendEmailResult {
  success: boolean
  method: EmailProvider
  messageId?: string
  error?: string
  logId?: string
}

async function determineSmtpConfig(smtp?: SmtpConfig | null): Promise<SmtpConfig | null> {
  if (smtp?.host && smtp?.user && smtp?.pass) return smtp as SmtpConfig

  const envHost = process.env.SMTP_HOST
  const envUser = process.env.SMTP_USER
  const envPass = process.env.SMTP_PASS
  if (envHost && envUser && envPass) {
    return { host: envHost, port: parseInt(process.env.SMTP_PORT || "587"), user: envUser, pass: envPass }
  }

  return null
}

async function persistLog(data: {
  to: string
  subject: string
  status: string
  method: string
  error?: string
  messageId?: string
  organizationId?: string
  invitedById?: string
}) {
  try {
    const log = await prisma.emailLog.create({
      data: {
        to: data.to,
        subject: data.subject,
        status: data.status,
        method: data.method,
        error: data.error || null,
        metadata: data.messageId ? JSON.stringify({ messageId: data.messageId }) : null,
        sentAt: data.status === "sent" ? new Date() : null,
        organizationId: data.organizationId || null,
        invitedById: data.invitedById || null,
      },
    })
    return log.id
  } catch {
    return undefined
  }
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { to, subject, html, smtp, organizationId, invitedById } = input
  let result: { success: boolean; messageId?: string; error?: string } = { success: false, error: "No provider attempted" }

  const smtpCfg = await determineSmtpConfig(smtp)

  if (smtpCfg) {
    result = await sendViaSmtp(to, subject, html, smtpCfg)
    if (result.success) {
      const logId = await persistLog({
        to, subject, status: "sent", method: smtp ? "smtp" : "env-smtp",
        messageId: result.messageId, organizationId, invitedById,
      })
      return { success: true, method: smtp ? "smtp" : "env-smtp", messageId: result.messageId, logId }
    }
  }

  const hasResend = !!process.env.RESEND_API_KEY
  if (hasResend) {
    result = await sendViaResend(to, subject, html)
    if (result.success) {
      const logId = await persistLog({
        to, subject, status: "sent", method: "resend",
        messageId: result.messageId, organizationId, invitedById,
      })
      return { success: true, method: "resend", messageId: result.messageId, logId }
    }
  }

  const logId = await persistLog({
    to, subject, status: "failed", method: "none",
    error: result?.error || "No email provider configured",
    organizationId, invitedById,
  })

  if (smtpCfg) {
    return { success: false, method: smtp ? "smtp" : "env-smtp", error: result?.error, logId }
  }
  if (hasResend) {
    return { success: false, method: "resend", error: result?.error, logId }
  }

  return {
    success: false, method: "none",
    error: "No email provider configured — set SMTP in Settings or SMTP_HOST/SMTP_USER/SMTP_PASS env vars",
    logId,
  }
}
