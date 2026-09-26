import "server-only";
import { loadNewsletterConfig } from "@/lib/newsletter/resend";
import { redeemUrl } from "./check";
import type { CouponEvent } from "./events";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Event eyebrow. Grok Bot gets the meetup's black card and teal dot; no images, so nothing for clients to block. */
function header(event: CouponEvent) {
  const title = escapeHtml(event.title);
  if (event.theme === "grok") {
    return `<div style="margin:0 0 28px;padding:22px 20px;background:#000000;border-radius:16px;">
      <p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.6);"><span style="display:inline-block;width:8px;height:8px;margin-right:8px;border-radius:4px;background:#00BCA6;vertical-align:1px;"></span>${title}</p>
      <p style="margin:10px 0 0;font-size:22px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;color:#ffffff;">Gracias por venir. <span style="color:rgba(255,255,255,0.5);">Aquí van tus créditos.</span></p>
    </div>`;
  }
  return `<p style="margin:0 0 24px;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(33,33,33,0.4);">${title}</p>`;
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

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:32px 16px;background:#ffffff;color:#212121;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:480px;margin:0 auto;">
    ${header(event)}
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${hello}</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:rgba(33,33,33,0.6);">Gracias por venir. Aquí están tus $${event.valueUsd}&nbsp;USD en créditos de Cursor.</p>
    <div style="margin:0 0 24px;padding:20px;border:1px solid rgba(33,33,33,0.1);border-radius:16px;text-align:center;">
      <p style="margin:0 0 8px;font-family:ui-monospace,Menlo,monospace;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(33,33,33,0.4);">Tu código</p>
      <p style="margin:0;font-family:ui-monospace,Menlo,monospace;font-size:22px;letter-spacing:0.08em;">${escapeHtml(code)}</p>
    </div>
    <a href="${url}" style="display:block;padding:14px 24px;background:#212121;color:#ffffff;text-decoration:none;text-align:center;border-radius:12px;font-size:15px;font-weight:600;">Canjear en Cursor</a>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:rgba(33,33,33,0.4);">El código es de un solo uso. Canjéalo con la cuenta de Cursor donde lo quieras.<br>— AI Builders México</p>
  </div>
</body></html>`;

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject: `Tus $${event.valueUsd} USD en créditos de Cursor · ${event.title}`,
    html,
    text,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
