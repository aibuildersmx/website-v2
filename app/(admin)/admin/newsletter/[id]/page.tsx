import Link from "next/link";
import { notFound } from "next/navigation";
import { getIssue } from "@/lib/actions/newsletter";
import { IssueEditor } from "../components/issue-editor";

export const dynamic = "force-dynamic";

export default async function NewsletterIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await getIssue(id);
  if (!issue) notFound();

  return (
    <div>
      <Link
        href="/admin/newsletter"
        className="text-xs font-medium text-gray-400 hover:text-gray-700"
      >
        ← Newsletter
      </Link>
      <IssueEditor
        id={issue.id}
        initialData={issue.data}
        status={issue.status}
      />
    </div>
  );
}
