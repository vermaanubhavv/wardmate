import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

type FeedbackRecipient = { userId: string; name: string | null; email: string };

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[char];
  });
}

export function feedbackEmailConfiguration() {
  return {
    formUrl: `${required("NEXT_PUBLIC_SITE_URL").replace(/\/$/, "")}/feedback`,
    phone: required("FEEDBACK_CONTACT_PHONE"),
    from: process.env.FEEDBACK_EMAIL_FROM?.trim() || "Anubhav <anubhav@wardmate.in>",
    siteUrl: required("NEXT_PUBLIC_SITE_URL").replace(/\/$/, ""),
    apiKey: required("RESEND_API_KEY"),
    // Validate this up front so the cron never claims a recipient until the unsubscribe link
    // can be signed and therefore the message can be sent safely.
    unsubscribeSecret: required("FEEDBACK_UNSUBSCRIBE_SECRET"),
  };
}

function unsubscribeSignature(userId: string) {
  return createHmac("sha256", required("FEEDBACK_UNSUBSCRIBE_SECRET"))
    .update(userId)
    .digest("base64url");
}

export function isValidUnsubscribeSignature(userId: string, signature: string) {
  const expected = Buffer.from(unsubscribeSignature(userId));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function unsubscribeUrl(recipient: FeedbackRecipient, siteUrl: string) {
  const params = new URLSearchParams({
    user: recipient.userId,
    token: unsubscribeSignature(recipient.userId),
  });
  return `${siteUrl}/api/feedback/unsubscribe?${params}`;
}

export async function sendFeedbackEmail(recipient: FeedbackRecipient, idempotencyKey: string) {
  const config = feedbackEmailConfiguration();
  const name = recipient.name?.trim();
  const hello = name ? `Hi ${name},` : "Hi,";
  const unsubUrl = unsubscribeUrl(recipient, config.siteUrl);
  const text = `${hello}

You may have come across Wardmate through Instagram and joined or tried it out. I’m personally working on making it genuinely useful, and I’d value your honest feedback.

Could you take this short feedback form? ${config.formUrl}

If you would rather talk directly, you can reach me on ${config.phone}. I’d be happy to chat for 10–15 minutes.

Thank you,
Anubhav
Wardmate

To stop receiving feedback emails, unsubscribe here: ${unsubUrl}`;
  const html = `<p>${escapeHtml(hello)}</p>
<p>You may have come across Wardmate through Instagram and joined or tried it out. I’m personally working on making it genuinely useful, and I’d value your honest feedback.</p>
<p><a href="${escapeHtml(config.formUrl)}">Share feedback in the short form →</a></p>
<p>If you would rather talk directly, you can reach me on <a href="tel:${escapeHtml(config.phone.replace(/[^+\d]/g, ""))}">${escapeHtml(config.phone)}</a>. I’d be happy to chat for 10–15 minutes.</p>
<p>Thank you,<br />Anubhav<br />Wardmate</p>
<p style="font-size:12px;color:#666"><a href="${escapeHtml(unsubUrl)}">Unsubscribe from feedback emails</a></p>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: config.from,
      to: [recipient.email],
      subject: "Can I ask for your honest feedback on Wardmate?",
      html,
      text,
      headers: {
        "List-ID": "Wardmate feedback <feedback.wardmate.in>",
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }),
  });

  const result = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
  if (!response.ok || !result?.id) {
    throw new Error(result?.message || `Resend returned HTTP ${response.status}.`);
  }
  return result.id;
}
