import { Resend } from "resend";

// Resend config for the Next.js app (Railway). Unlike the CLI's loadConfig
// (scripts/newsletter/lib/env.ts), this reads process.env directly — on
// Railway these are set as service variables, not a local .env file.
//
// Required for the panel to send:
//   RESEND_API_KEY, NEWSLETTER_FROM
// Required only to broadcast (not for test sends):
//   RESEND_AUDIENCE_ID
// Optional:
//   NEWSLETTER_REPLY_TO

export interface NewsletterConfig {
  resend: Resend;
  from: string;
  audienceId: string | undefined;
  replyTo: string | undefined;
}

class MissingEnvError extends Error {}

function required(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new MissingEnvError(
      `Falta la variable de entorno ${name}. Configúrala en Railway (servicio website-v2).`,
    );
  }
  return v;
}

export function loadNewsletterConfig(
  opts: { requireAudience?: boolean } = {},
): NewsletterConfig {
  const apiKey = required("RESEND_API_KEY");
  const from = required("NEWSLETTER_FROM");
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim() || undefined;
  if (opts.requireAudience && !audienceId) {
    throw new MissingEnvError(
      "Falta RESEND_AUDIENCE_ID. Configúrala en Railway para poder enviar el broadcast.",
    );
  }
  return {
    resend: new Resend(apiKey),
    from,
    audienceId,
    replyTo: process.env.NEWSLETTER_REPLY_TO?.trim() || undefined,
  };
}

export { MissingEnvError };
