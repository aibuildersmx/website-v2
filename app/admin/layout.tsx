import { redirect } from "next/navigation";
import { getUser, signOut } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
        <a href="/admin" className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">
          AI Builders · Admin
        </a>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
            {user.email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900"
            >
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">{children}</main>
    </div>
  );
}
