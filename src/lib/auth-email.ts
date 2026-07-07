export function magicLinkEmailHtml(url: string) {
  return `
<div style="background:#09090b;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:420px;margin:0 auto;background:#18181b;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:32px;">
    <h1 style="color:#fafafa;font-size:20px;margin:0 0 16px;">Wotchlist</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.5;margin:0 0 24px;">
      Click the button below to sign in. This link expires in 24 hours and can only be used once.
    </p>
    <a href="${url}" style="display:inline-block;background:#fafafa;color:#18181b;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px;">
      Sign in to Wotchlist
    </a>
    <p style="color:#71717a;font-size:12px;margin:24px 0 0;">
      If you didn't request this email, you can safely ignore it.
    </p>
  </div>
</div>`.trim();
}

export function magicLinkEmailText(url: string) {
  return `Sign in to Wotchlist\n\n${url}\n\nThis link expires in 24 hours and can only be used once.`;
}
