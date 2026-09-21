"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { claimEventCoupon } from "@/lib/actions/claim-coupon";

const ERROR_COPY: Record<string, string> = {
  invalid: "Ingresa un correo válido.",
  not_eligible: "No encontramos ese correo en la lista del evento. Usa el mismo con el que te registraste en Luma.",
  sold_out: "Ya no quedan códigos. Escríbenos a hola@aibuilders.lat.",
  rate_limited: "Demasiados intentos, intenta en un momento.",
  error: "Hubo un error. Intenta de nuevo.",
};

export function ClaimForm({ slug }: { slug: string }) {
  const [sentTo, setSentTo] = useState<{ email: string; resent: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    setError(null);
    startTransition(async () => {
      const res = await claimEventCoupon(formData);
      if (res.ok) setSentTo({ email, resent: res.resent });
      else setError(ERROR_COPY[res.error] ?? ERROR_COPY.error);
    });
  }

  if (sentTo) {
    return (
      <div className="space-y-3">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-black">
          <span className="size-2 rounded-full bg-green-500" />
          {sentTo.resent ? "Te lo reenviamos" : "Enviado"}
        </p>
        <p className="text-base leading-relaxed text-black/60">
          Revisa <span className="text-black">{sentTo.email}</span>. Si no lo ves en unos minutos, busca en spam o
          promociones.
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="event" value={slug} />
      {/* Honeypot — hidden from humans, catnip for bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <input
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="tu@email.com"
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-black transition-all placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 sm:rounded-xl sm:px-5 sm:py-4 sm:text-base"
      />
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-4 text-sm font-bold text-white transition-all hover:bg-black/90 disabled:opacity-60 sm:rounded-xl sm:py-5 sm:text-base"
      >
        {pending ? "Enviando…" : "Enviarme mi código"}
        {!pending && <Send className="size-4" />}
      </button>
      {error && <p className="font-mono text-xs uppercase tracking-widest text-red-500">{error}</p>}
    </form>
  );
}
