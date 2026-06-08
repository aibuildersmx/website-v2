import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contacts } from "@/lib/db/schema";
import { verifyUnsub } from "@/lib/newsletter/unsubscribe";

// Self-hosted unsubscribe endpoint (replaces Resend Audiences).
//   GET  -> human-friendly confirmation page (click from the email footer)
//   POST -> RFC 8058 one-click (Gmail/Yahoo native "unsubscribe" button)
// Both verify the HMAC token and flip newsletter_subscribed to false.

async function unsubscribe(contactId: string): Promise<void> {
  await db
    .update(contacts)
    .set({ newsletterSubscribed: false, updatedAt: new Date() })
    .where(eq(contacts.id, contactId));
}

function page(title: string, body: string, ok: boolean): NextResponse {
  const accent = ok ? "#16a34a" : "#dc2626";
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} · AI Builders MX</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:#fafaf9;color:#212121;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;}
  .card{max-width:440px;padding:40px;text-align:center;}
  h1{font-size:22px;font-weight:600;margin:0 0 12px;color:${accent};}
  p{font-size:15px;line-height:1.6;color:#52525b;margin:0 0 8px;}
  a{color:#212121;font-size:13px;text-transform:uppercase;letter-spacing:1px;text-decoration:underline;}
</style></head>
<body><div class="card"><h1>${title}</h1><p>${body}</p>
<p style="margin-top:24px;"><a href="https://aibuilders.mx">Volver a aibuilders.mx</a></p>
</div></body></html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const c = req.nextUrl.searchParams.get("c") ?? "";
  const t = req.nextUrl.searchParams.get("t") ?? "";
  if (!verifyUnsub(c, t)) {
    return page(
      "Enlace inválido",
      "No pudimos verificar este enlace de baja. Si quieres dejar de recibir el newsletter, responde a cualquier correo y lo hacemos manualmente.",
      false,
    );
  }
  await unsubscribe(c);
  return page(
    "Suscripción cancelada",
    "Ya no recibirás The Build Log. Puedes volver a suscribirte cuando quieras desde el sitio.",
    true,
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const c = req.nextUrl.searchParams.get("c") ?? "";
  const t = req.nextUrl.searchParams.get("t") ?? "";
  if (!verifyUnsub(c, t)) {
    return new NextResponse(null, { status: 400 });
  }
  await unsubscribe(c);
  return new NextResponse(null, { status: 200 });
}
