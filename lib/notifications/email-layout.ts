/** Shared Fortuna HTML shell for Resend transactional emails. */

export function siteOrigin() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function emailLogoUrl() {
  return `${siteOrigin()}/fortuna/logo-header.png`;
}

export function wrapFortunaEmail(options: {
  firstName: string;
  previewText?: string;
  bodyHtml: string;
  bodyText: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): { html: string; text: string } {
  const { firstName, bodyHtml, bodyText, ctaLabel, ctaUrl, previewText } =
    options;
  const logo = emailLogoUrl();
  const origin = siteOrigin();
  const preview = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${previewText}</div>`
    : "";

  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0 8px">
          <tr>
            <td style="border-radius:10px;background:#a8842a">
              <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.04em;text-decoration:none;color:#ffffff">${ctaLabel}</a>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#737373">
          Or copy this link:<br/>
          <a href="${ctaUrl}" style="color:#a8842a;word-break:break-all">${ctaUrl}</a>
        </p>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#f7f6f2">
${preview}
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f6f2;padding:32px 16px">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:16px;overflow:hidden">
        <tr>
          <td style="padding:28px 28px 12px;border-bottom:1px solid rgba(0,0,0,0.06);background:#fbf8f3" align="center">
            <img src="${logo}" alt="Fortuna Global Holdings" width="180" style="display:block;width:180px;max-width:70%;height:auto"/>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.6;color:#101217">
            <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#a8842a">Fortuna Global Holdings</p>
            <p style="margin:0 0 16px">Hi ${escapeHtml(firstName)},</p>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#3f3f46">${bodyHtml}</div>
            ${ctaBlock}
            <p style="margin:24px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#52525b">Fortuna Global Holdings</p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px;background:#fbf8f3;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.55;color:#737373;text-align:center">
            <a href="${origin}/privacy-policy" style="color:#a8842a;text-decoration:underline">Privacy Policy</a>
            &nbsp;·&nbsp;
            <a href="${origin}/terms-and-conditions" style="color:#a8842a;text-decoration:underline">Terms &amp; Conditions</a>
            <br/>
            <a href="mailto:support@fortunaglobal.com" style="color:#737373;text-decoration:none">support@fortunaglobal.com</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const textCta =
    ctaLabel && ctaUrl ? `\n\n${ctaLabel}: ${ctaUrl}` : "";
  const text = `Hi ${firstName},\n\n${bodyText}${textCta}\n\nFortuna Global Holdings\nPrivacy: ${origin}/privacy-policy\nTerms: ${origin}/terms-and-conditions\nsupport@fortunaglobal.com`;

  return { html, text };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
