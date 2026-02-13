"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  addRecruiter,
  type AddRecruiterState,
  deleteRecruiter,
  toggleRecruiterStatus,
} from "@/lib/actions/recruiters";

type RecruiterRow = {
  email: string;
  is_active: boolean;
  created_at: string;
  last_invited_at: string | null;
};

const initialState: AddRecruiterState = {};

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-gray-900 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
    >
      {pending ? "Enviando..." : "Invitar y agregar"}
    </button>
  );
}

export function RecruitersAdmin({
  currentUserEmail,
  recruiters,
}: {
  currentUserEmail: string;
  recruiters: RecruiterRow[];
}) {
  const [state, formAction] = useActionState(addRecruiter, initialState);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-2 font-serif text-2xl text-gray-800">
          Agregar reclutador
        </h2>
        <p className="mb-5 text-sm text-gray-500">
          En un solo paso enviamos invitacion por correo (Supabase Auth) y
          habilitamos acceso para publicar vacantes.
        </p>

        <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            name="email"
            required
            placeholder="reclutador@empresa.com"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 focus:border-gray-400 focus:outline-none"
          />
          <AddButton />
        </form>

        {"error" in state && state.error && (
          <p className="mt-3 text-sm text-red-600">{state.error}</p>
        )}
        {"success" in state && state.success && (
          <p className="mt-3 text-sm text-green-600">
            {state.message || "Invitacion enviada y acceso habilitado."}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <h2 className="mb-4 font-serif text-2xl text-gray-800">
          Accesos actuales
        </h2>

        <div className="space-y-3">
          {recruiters.length === 0 && (
            <p className="text-sm text-gray-500">
              No hay correos autorizados todavia.
            </p>
          )}

          {recruiters.map((recruiter) => {
            const isCurrent = recruiter.email === currentUserEmail;
            const createdAt = new Date(recruiter.created_at).toLocaleString(
              "es-MX",
              {
                dateStyle: "medium",
                timeStyle: "short",
              }
            );
            const invitedAt = recruiter.last_invited_at
              ? new Date(recruiter.last_invited_at).toLocaleString("es-MX", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Sin invitacion enviada";

            return (
              <div
                key={recruiter.email}
                className="rounded-xl border border-gray-200 px-4 py-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="break-all font-mono text-xs uppercase tracking-[0.12em] text-gray-700">
                      {recruiter.email}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Alta: {createdAt}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Ultima invitacion: {invitedAt}
                    </p>
                    {isCurrent && (
                      <p className="mt-1 text-xs text-blue-600">
                        Esta es tu cuenta actual.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${
                        recruiter.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {recruiter.is_active ? "Activo" : "Inactivo"}
                    </span>

                    <form action={toggleRecruiterStatus}>
                      <input type="hidden" name="email" value={recruiter.email} />
                      <input
                        type="hidden"
                        name="nextActive"
                        value={recruiter.is_active ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        disabled={isCurrent && recruiter.is_active}
                        className="rounded-full border border-gray-200 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {recruiter.is_active ? "Desactivar" : "Activar"}
                      </button>
                    </form>

                    <form action={deleteRecruiter}>
                      <input type="hidden" name="email" value={recruiter.email} />
                      <button
                        type="submit"
                        disabled={isCurrent}
                        className="rounded-full border border-red-200 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-red-600 transition-colors hover:border-red-300 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
