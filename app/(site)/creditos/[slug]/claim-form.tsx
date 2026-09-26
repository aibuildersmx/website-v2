"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { claimEventCoupon } from "@/lib/actions/claim-coupon";

const ERROR_COPY: Record<string, string> = {
  invalid: "Ingresa un correo válido.",
  not_eligible: "Ese correo no está en la lista del evento. Usa el mismo con el que te registraste en Luma.",
  sold_out: "Ya no quedan códigos. Escríbenos a hola@aibuilders.lat.",
  rate_limited: "Demasiados intentos. Espera un momento y vuelve a intentar.",
  error: "No pudimos enviarlo. Intenta de nuevo en un momento.",
};

type Sent = { email: string; resent: boolean };

/** `checkClassName` colors the success ticks, so a themed page can use its accent. */
export function ClaimForm({ slug, checkClassName = "text-green-500" }: { slug: string; checkClassName?: string }) {
  const [sent, setSent] = useState<Sent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    setError(null);
    startTransition(async () => {
      const res = await claimEventCoupon(formData);
      if (res.ok) setSent({ email, resent: res.resent });
      else setError(ERROR_COPY[res.error] ?? ERROR_COPY.error);
    });
  }

  if (sent) return <SentLog sent={sent} checkClassName={checkClassName} />;

  return (
    <form onSubmit={handleSubmit} noValidate>
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
      <label htmlFor="claim-email" className="sr-only">
        Correo con el que te registraste
      </label>
      <div className="flex flex-col gap-2 transition-colors sm:flex-row sm:rounded-full sm:border sm:border-white/20 sm:bg-[#212121]/60 sm:p-1.5 sm:backdrop-blur-md sm:focus-within:border-white/60">
        <input
          id="claim-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="tu@email.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "claim-error" : undefined}
          className="h-12 w-full min-w-0 rounded-xl sm:flex-1 border border-white/20 bg-[#212121]/60 px-4 text-base text-white backdrop-blur-md transition-colors placeholder:text-white/50 focus:border-white/60 focus:outline-none sm:h-auto sm:rounded-none sm:border-0 sm:bg-transparent sm:px-5 sm:backdrop-blur-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 font-mono text-xs tracking-widest text-[#212121] uppercase transition-colors hover:bg-white/85 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#212121] focus-visible:outline-none disabled:opacity-70 sm:rounded-full"
        >
          {pending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Verificando
            </>
          ) : (
            <>
              Enviarme mi código
              <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
      <p
        id="claim-error"
        role="alert"
        className="mt-3 min-h-5 pl-1 font-mono text-xs leading-relaxed tracking-wide text-red-500"
      >
        {error}
      </p>
    </form>
  );
}

/**
 * What just happened, told as the three steps the server actually ran. It
 * plays once, line by line, the way a launch readout does.
 */
function SentLog({ sent, checkClassName }: { sent: Sent; checkClassName: string }) {
  const reduce = useReducedMotion();
  const lines = [
    { label: "Lista de invitados", value: "Verificado" },
    { label: "Código", value: sent.resent ? "Ya era tuyo" : "Asignado" },
    { label: sent.resent ? "Reenviado a" : "Enviado a", value: sent.email },
  ];

  return (
    <div role="status" aria-live="polite" className="rounded-2xl border border-white/20 bg-[#212121]/60 p-5 backdrop-blur-md sm:p-6">
      <ul className="space-y-3">
        {lines.map((line, i) => (
          <motion.li
            key={line.label}
            initial={reduce ? false : { opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: i * 0.45, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 font-mono text-xs tracking-wide sm:text-sm"
          >
            <Check className={`size-4 shrink-0 ${checkClassName}`} aria-hidden="true" />
            <span className="text-white/50 uppercase">{line.label}</span>
            <span className="min-w-0 truncate text-white">{line.value}</span>
          </motion.li>
        ))}
      </ul>
      <motion.p
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: lines.length * 0.45, duration: 0.5 }}
        className="mt-5 border-t border-white/15 pt-5 text-sm leading-relaxed text-white/70"
      >
        Revisa tu bandeja. Si no aparece en unos minutos, busca en spam o promociones.
      </motion.p>
    </div>
  );
}
