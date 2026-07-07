import { Resend } from "resend";
import { db } from "@/lib/db";

async function sha256Hex(message: string) {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(size = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(size));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function sendListInviteEmail({
  email,
  listId,
  listName,
  inviterName,
}: {
  email: string;
  listId: string;
  listName: string;
  inviterName: string;
}) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not configured");

  const token = randomToken(32);
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db().verificationToken.create({
    data: {
      identifier: email,
      token: await sha256Hex(`${token}${secret}`),
      expires,
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL;
  const callbackUrl = `${baseUrl}/lists/${listId}`;
  const url = `${baseUrl}/api/auth/callback/resend?${new URLSearchParams({
    callbackUrl,
    token,
    email,
  })}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: email,
    subject: `${inviterName} invited you to "${listName}" on Wotchlist`,
    html: `
<div style="background:#09090b;padding:40px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:420px;margin:0 auto;background:#18181b;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:32px;">
    <h1 style="color:#fafafa;font-size:20px;margin:0 0 16px;">Wotchlist</h1>
    <p style="color:#a1a1aa;font-size:14px;line-height:1.5;margin:0 0 24px;">
      <strong style="color:#fafafa;">${inviterName}</strong> invited you to the shared list
      <strong style="color:#fafafa;">${listName}</strong>. Click below to accept and sign in.
    </p>
    <a href="${url}" style="display:inline-block;background:#fafafa;color:#18181b;text-decoration:none;font-weight:600;font-size:14px;padding:12px 20px;border-radius:8px;">
      View the list
    </a>
    <p style="color:#71717a;font-size:12px;margin:24px 0 0;">
      This link expires in 7 days and can only be used once.
    </p>
  </div>
</div>`.trim(),
    text: `${inviterName} invited you to "${listName}" on Wotchlist.\n\n${url}\n\nThis link expires in 7 days and can only be used once.`,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
