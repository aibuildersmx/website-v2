import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getRecruiters } from "@/lib/actions/recruiters";
import { RecruitersAdmin } from "./recruiters-admin";

export default async function RecruitersPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const userEmail = (user.email || "").trim().toLowerCase();
  const recruiters = await getRecruiters();

  return (
    <div className="min-h-screen bg-stone-100 px-4 py-8 sm:px-6 md:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400">
              AIBM Dashboard
            </p>
            <h1 className="font-serif text-3xl text-gray-800 sm:text-4xl">
              Accesos de reclutadores
            </h1>
          </div>
          <Link
            href="/job-board/dashboard"
            className="rounded-full border border-gray-200 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
          >
            Volver al dashboard
          </Link>
        </div>

        <RecruitersAdmin
          currentUserEmail={userEmail}
          recruiters={recruiters}
        />
      </div>
    </div>
  );
}
