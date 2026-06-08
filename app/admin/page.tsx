import Link from "next/link";

export default function AdminHome() {
  return (
    <div>
      <h1 className="font-serif text-3xl text-gray-800">Panel de administración</h1>
      <p className="mt-2 text-sm text-gray-500">Elige una sección.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/newsletter"
          className="group rounded-2xl border border-black/5 bg-white p-6 transition hover:border-black/20"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
            The Build Log
          </p>
          <h2 className="mt-1 font-serif text-2xl text-gray-800">Newsletter</h2>
          <p className="mt-2 text-sm text-gray-500">
            Compón y envía issues vía Resend.
          </p>
        </Link>

        <Link
          href="/job-board/dashboard"
          className="group rounded-2xl border border-black/5 bg-white p-6 transition hover:border-black/20"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
            Job Board
          </p>
          <h2 className="mt-1 font-serif text-2xl text-gray-800">Vacantes</h2>
          <p className="mt-2 text-sm text-gray-500">
            Administra empresas y vacantes.
          </p>
        </Link>
      </div>
    </div>
  );
}
