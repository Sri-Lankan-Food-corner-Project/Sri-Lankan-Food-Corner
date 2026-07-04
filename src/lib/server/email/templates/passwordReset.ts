import { site } from '$lib/config/site';

/**
 * Renders the HTML + plaintext for the password-reset email.
 * Kept as a plain string builder (no template engine) since transactional
 * email at this scale doesn't need one, and inline styles are what actually
 * survive Gmail / Outlook / KakaoMail rendering.
 */
export function renderPasswordResetEmail(opts: {
	name: string;
	resetUrl: string;
	validForMinutes?: number;
}) {
	const { name, resetUrl, validForMinutes = 60 } = opts;

	const html = /* html */ `<!doctype html>
<html>
<body style="margin:0;padding:24px;background:#f3f1ea;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans KR',sans-serif;color:#171717;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
    <tr>
      <td style="background:#2B4B1F;padding:20px 28px;color:#ffffff;">
        <div style="font-weight:700;font-size:18px;letter-spacing:0.2px;">${escapeHtml(site.name)}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;">Reset your password</h1>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#525252;">
          Hi ${escapeHtml(name || 'there')}, we got a request to reset the password on your Food Corner account.
          Click the button below to set a new one — the link is valid for the next ${validForMinutes} minutes.
        </p>
        <p style="margin:24px 0;">
          <a href="${resetUrl}"
             style="display:inline-block;background:#353535;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px;">
            Reset password
          </a>
        </p>
        <p style="margin:0 0 8px;font-size:12px;color:#737373;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="margin:0 0 20px;font-size:12px;word-break:break-all;">
          <a href="${resetUrl}" style="color:#2B4B1F;">${resetUrl}</a>
        </p>
        <hr style="border:0;border-top:1px solid #eeeeee;margin:20px 0;">
        <p style="margin:0;font-size:12px;color:#737373;line-height:1.55;">
          If you didn't request a password reset, you can safely ignore this email — your password won't change.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background:#f6eedc;color:#525252;font-size:11px;">
        ${escapeHtml(site.name)} · This is an automated message, please don't reply.
      </td>
    </tr>
  </table>
</body>
</html>`;

	const text = [
		`Reset your Food Corner password`,
		``,
		`Hi ${name || 'there'},`,
		``,
		`We got a request to reset the password on your account. Click or paste the link below to set a new one — valid for the next ${validForMinutes} minutes:`,
		``,
		resetUrl,
		``,
		`If you didn't request this, ignore this email — your password won't change.`,
		``,
		`— ${site.name}`
	].join('\n');

	return { html, text };
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}
