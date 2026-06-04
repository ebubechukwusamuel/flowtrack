export { sendEmail } from "@/lib/email"
export type { SendEmailInput, SendEmailResult, EmailProvider } from "@/lib/email"

export function buildInviteEmailHtml({
  inviterName,
  orgName,
  acceptUrl,
  token,
}: {
  inviterName: string
  orgName: string
  acceptUrl: string
  token: string
}) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8f9fb;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="width:44px;height:44px;background:linear-gradient(135deg,#18181b,#27272a);border-radius:12px;">
                    <span style="color:#ffffff;font-size:20px;font-weight:700;line-height:44px;">FT</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.04),0 8px 24px rgba(0,0,0,0.04);">

              <!-- Heading -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:8px;">
                    <h1 style="font-size:24px;font-weight:700;color:#18181b;margin:0;letter-spacing:-0.02em;">
                      You're invited to <span style="color:#CAFF33;">${orgName}</span>
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:24px;">
                    <p style="font-size:15px;line-height:1.6;color:#52525b;margin:0;">
                      ${inviterName} has invited you to join their workspace on <strong style="color:#18181b;">FlowTrack</strong> — a project management tool built for modern teams.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="height:1px;background:#e4e4e7;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="background:#18181b;border-radius:10px;padding:14px 36px;">
                          <a href="${acceptUrl}" target="_blank" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;display:inline-block;letter-spacing:-0.01em;">
                            Accept Invitation →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Invite Code -->
                <tr>
                  <td style="padding-bottom:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;border-radius:10px;padding:16px;">
                      <tr>
                        <td>
                          <p style="font-size:12px;font-weight:600;color:#18181b;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.04em;">
                            Or share this invite code
                          </p>
                          <p style="font-family:'SF Mono','Fira Code','Courier New',monospace;font-size:13px;font-weight:700;color:#CAFF33;margin:0;word-break:break-all;text-align:center;line-height:1.5;">
                            ${token}
                          </p>
                          <p style="font-size:11px;line-height:1.4;color:#a1a1aa;margin:6px 0 0 0;text-align:center;">
                            Go to ${acceptUrl.split("?")[0]} and paste this code
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer note -->
                <tr>
                  <td>
                    <p style="font-size:13px;line-height:1.5;color:#a1a1aa;margin:0;text-align:center;">
                      If you don't have a FlowTrack account yet, you'll be prompted to create one after clicking the button above.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="font-size:12px;color:#a1a1aa;margin:0;">
                Powered by <strong style="color:#52525b;">FlowTrack</strong>
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
