export async function sendViaResend(
  to: string,
  subject: string,
  html: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return { success: false, error: "RESEND_API_KEY not configured" }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "FlowTrack <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.message || "Resend API error" }
    return { success: true, messageId: data.id }
  } catch (err: any) {
    clearTimeout(timeout)
    return { success: false, error: err?.message || "Resend connection failed" }
  }
}
