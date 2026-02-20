"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Play, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { submitWebinarLead } from "@/lib/actions/webinar-leads";

const ZOOM_RECORDING_URL =
  "https://us06web.zoom.us/rec/share/H-wFuCi7hWFjvtVi0LWOsUm8-KZx_Kq6AslkvHULIDHSTmZOhimTuza2VS8TY2oI.3w1_459_Wcbasbig?startTime=1771543894000";

export default function MidjourneyReplayPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await submitWebinarLead(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Redirect to Zoom recording
    window.location.href = ZOOM_RECORDING_URL;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/">
            <Image
              src="/aibm-logo.svg"
              alt="AI Builders Mexico"
              width={120}
              height={24}
              className="mx-auto h-6 w-auto brightness-0"
            />
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/5 bg-black/[0.02] px-3 py-1">
            <Play className="size-3 text-black/60" strokeWidth={2} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-black/60">
              Webinar Replay
            </span>
          </div>
          <h1 className="mb-3 font-serif text-3xl text-gray-800">
            Midjourney para Diseñadores
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-gray-400">
            Aprende a usar Midjourney para potenciar tu proceso de diseño UX/UI.
            Regístrate para acceder a la grabación completa del webinar.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
          >
            <AlertCircle
              className="h-4 w-4 shrink-0 text-red-400"
              strokeWidth={1.5}
            />
            <span className="text-sm text-red-600">{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="Tu nombre"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="tu@email.com"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
              Cuéntanos{" "}
              <span className="normal-case tracking-normal text-gray-300">
                (opcional)
              </span>
            </label>
            <textarea
              name="question"
              rows={3}
              placeholder="¿En qué estás trabajando o qué te interesa de AI y Midjourney?"
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={!loading ? { scale: 0.97 } : undefined}
            className="mt-2 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gray-900 px-8 py-4 font-mono text-xs font-medium uppercase tracking-[0.25em] text-white transition-colors duration-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "Registrando..." : "Ver Webinar"}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-gray-300">
          AI Builders Mexico
        </p>
      </motion.div>
    </div>
  );
}
