import "server-only";
import { loadNewsletterConfig } from "@/lib/newsletter/resend";
import { redeemUrl } from "./check";
import type { CouponEvent } from "./events";

const ORB_URL = "https://aibuilders.mx/images/grok/orb.png";
const SANS = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "ui-monospace,Menlo,monospace";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/**
 * Same sending address as the newsletter, so deliverability is shared, but not
 * its "The Build Log" name: a coupon should come from the community itself.
 */
function asCommunity(from: string) {
  const address = from.match(/<([^>]+)>/)?.[1] ?? from.trim();
  return `AI Builders México <${address}>`;
}

type Parts = { hello: string; code: string; url: string; event: CouponEvent };

function cursorHtml({ hello, code, url, event }: Parts) {
  return `<!doctype html>
<html lang="es"><body style="margin:0;padding:32px 16px;background:#ffffff;color:#212121;font-family:${SANS};">
  <div style="max-width:480px;margin:0 auto;">
    <p style="margin:0 0 24px;font-family:${MONO};font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(33,33,33,0.4);">${escapeHtml(event.title)}</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${hello}</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:rgba(33,33,33,0.6);">Gracias por venir. Aquí están tus $${event.valueUsd}&nbsp;USD en créditos de Cursor.</p>
    <div style="margin:0 0 24px;padding:20px;border:1px solid rgba(33,33,33,0.1);border-radius:16px;text-align:center;">
      <p style="margin:0 0 8px;font-family:${MONO};font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(33,33,33,0.4);">Tu código</p>
      <p style="margin:0;font-family:${MONO};font-size:22px;letter-spacing:0.08em;">${escapeHtml(code)}</p>
    </div>
    <a href="${url}" style="display:block;padding:14px 24px;background:#212121;color:#ffffff;text-decoration:none;text-align:center;border-radius:12px;font-size:15px;font-weight:600;">Canjear en Cursor</a>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:rgba(33,33,33,0.4);">El código es de un solo uso. Canjéalo con la cuenta de Cursor donde lo quieras.<br>— AI Builders México</p>
  </div>
</body></html>`;
}

/**
 * The meetup's look, matching its Luma cover and QR card (the title and date
 * are that cover's, so this template is this meetup's, not any Grok event's): black stage, white type, teal as the one accent, the orb
 * at the foot. Built from tables with bgcolor attributes and hex colors (no
 * rgba, no div backgrounds) because mail clients strip the rest. The orb is the
 * only image; with images blocked the email still reads complete.
 */
function grokHtml({ hello, code, url, event }: Parts) {
  const row = (html: string, pad = "0 0 24px") => `<tr><td style="padding:${pad};">${html}</td></tr>`;
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head>
<body bgcolor="#000000" style="margin:0;padding:0;background:#000000;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background:#000000;">
<tr><td align="center" style="padding:40px 20px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;font-family:${SANS};color:#ffffff;">
    ${row(`<p style="margin:0;font-size:36px;line-height:1.06;font-weight:400;letter-spacing:-0.035em;color:#ffffff;">Grok Bot<br>Mexico City Meetup<br><span style="color:#737373;">Sábado, 26 de Sept</span></p>`, "0 0 28px")}
    ${row(`<p style="margin:0;font-size:22px;line-height:1.25;font-weight:500;letter-spacing:-0.02em;color:#ffffff;">Tus <span style="color:#00BCA6;">$${event.valueUsd}&nbsp;USD</span><br>en créditos de Cursor.</p>`, "0 0 24px")}
    ${row(`<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#ffffff;">${hello}</p><p style="margin:0;font-size:16px;line-height:1.6;color:#a3a3a3;">Gracias por venir al Grok Bot Meetup. Aquí está tu código.</p>`)}
    ${row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#141414" style="background:#141414;border:1px solid #2b2b2b;border-radius:16px;">
      <tr><td align="center" style="padding:22px 16px;">
        <p style="margin:0 0 10px;font-family:${MONO};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#00BCA6;">Tu código</p>
        <p style="margin:0;font-family:${MONO};font-size:21px;letter-spacing:0.06em;color:#ffffff;word-break:break-all;">${escapeHtml(code)}</p>
      </td></tr></table>`)}
    ${row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="center" bgcolor="#ffffff" style="background:#ffffff;border-radius:999px;">
        <a href="${url}" style="display:block;padding:15px 24px;font-family:${MONO};font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#000000;text-decoration:none;font-weight:600;">Canjear en Cursor &rarr;</a>
      </td></tr></table>`)}
    ${row(`<p style="margin:0;font-size:13px;line-height:1.6;color:#737373;">El código es de un solo uso. Canjéalo con la cuenta de Cursor donde lo quieras.<br>— AI Builders México</p>`, "0 0 8px")}
    <tr><td align="right" style="padding:0;line-height:0;font-size:0;"><img src="${ORB_URL}" width="200" height="200" alt="" style="display:block;border:0;width:200px;height:200px;margin:0 0 0 auto;"></td></tr>
  </table>
</td></tr>
</table>
</body></html>`;
}

/**
 * The email that carries the code. The code only ever travels here, never back
 * to the page, so typing someone else's email just sends them their own code.
 */
export async function sendCouponEmail(input: {
  to: string;
  name: string | null;
  code: string;
  event: CouponEvent;
}) {
  const { resend, from, replyTo } = loadNewsletterConfig();
  const { to, name, code, event } = input;
  const url = redeemUrl(code);
  const hello = name ? `Hola ${escapeHtml(name.split(" ")[0])},` : "Hola,";

  const text = [
    name ? `Hola ${name.split(" ")[0]},` : "Hola,",
    "",
    `Gracias por venir a ${event.title}. Aquí están tus $${event.valueUsd} USD en créditos de Cursor:`,
    "",
    `Código: ${code}`,
    `Canjéalo aquí: ${url}`,
    "",
    "El código es de un solo uso. Canjéalo con la cuenta de Cursor donde lo quieras.",
    "",
    "— AI Builders México",
  ].join("\n");

  const parts = { hello, code, url, event };
  const { error } = await resend.emails.send({
    from: asCommunity(from),
    to,
    replyTo,
    subject: `Tus $${event.valueUsd} USD en créditos de Cursor · ${event.title}`,
    html: event.theme === "grok" ? grokHtml(parts) : cursorHtml(parts),
    text,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
