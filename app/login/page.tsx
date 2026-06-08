"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LogIn, AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-10 text-center">
          <a href="/">
            <img
              src="/aibm-logo.svg"
              alt="AI Builders Mexico"
              className="mx-auto h-6 brightness-0"
            />
          </a>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-serif text-3xl text-gray-800">
            Iniciar sesión
          </h1>
          <p className="text-sm text-gray-400">
            Panel de administración
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
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@aibuilders.mx"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none"
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
              <LogIn className="h-4 w-4" strokeWidth={2} />
            )}
            {loading ? "Ingresando..." : "Ingresar"}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-gray-300">
          Solo administradores
        </p>
      </motion.div>
    </div>
  );
}
