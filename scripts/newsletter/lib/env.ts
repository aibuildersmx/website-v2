import { Resend } from "resend";

function loadDotEnv(): void {
  try {
    // Node 22: loads scripts/newsletter/.env into process.env
    process.loadEnvFile(new URL(".env", import.meta.url));
  } catch {
    // No local .env file — rely on already-exported process.env vars.
  }
}

function required(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(
      `Missing required env var ${name}. Copy scripts/newsletter/.env.example to scripts/newsletter/.env and fill it in.`,
    );
    process.exit(1);
  }
  return v;
}

export interface NewsletterConfig {
  resend: Resend;
  audienceId: string | undefined;
  from: string;
  replyTo: string | undefined;
}

export function loadConfig(opts: { requireAudience?: boolean } = {}): NewsletterConfig {
  loadDotEnv();
  const apiKey = required("RESEND_API_KEY");
  const from = required("NEWSLETTER_FROM");
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim() || undefined;
  if (opts.requireAudience && !audienceId) {
    console.error(
      "Missing RESEND_AUDIENCE_ID. Run `pnpm newsletter:import --csv <file>` first; it prints the audience id to paste into .env.",
    );
    process.exit(1);
  }
  return {
    resend: new Resend(apiKey),
    audienceId,
    from,
    replyTo: process.env.NEWSLETTER_REPLY_TO?.trim() || undefined,
  };
}
