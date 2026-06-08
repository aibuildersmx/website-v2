import { sql, eq, gte, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { contacts, newsletterIssues } from "@/lib/db/schema";
import { events as upcomingEventsData } from "@/components/events-data";
import { eventToSummary, type EventSummary } from "./format";

// Re-export para que la página importe todo lo del dashboard desde un solo lugar.
export { eventToSummary, formatDate, formatCount } from "./format";
export type { EventSummary } from "./format";

export type RecentIssue = {
  id: string;
  slug: string;
  subject: string;
  status: string;
  sentAt: Date | null;
};

export type DashboardMetrics = {
  contacts: { total: number | null; last30d: number | null };
  newsletter: {
    subscribers: number | null;
    lastIssueSentAt: Date | null;
    recentIssues: RecentIssue[];
  };
  events: { upcomingCount: number | null; upcoming: EventSummary[] };
};

async function getContactsMetrics(): Promise<DashboardMetrics["contacts"]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(contacts);
  const [{ recent }] = await db
    .select({ recent: sql<number>`count(*)::int` })
    .from(contacts)
    .where(gte(contacts.createdAt, thirtyDaysAgo));
  return { total, last30d: recent };
}

async function getNewsletterMetrics(): Promise<DashboardMetrics["newsletter"]> {
  const [{ subscribers }] = await db
    .select({ subscribers: sql<number>`count(*)::int` })
    .from(contacts)
    .where(eq(contacts.newsletterSubscribed, true));

  const sentRows = await db
    .select({ sentAt: newsletterIssues.sentAt })
    .from(newsletterIssues)
    .where(eq(newsletterIssues.status, "sent"))
    .orderBy(desc(newsletterIssues.sentAt))
    .limit(1);

  const recentIssues = await db
    .select({
      id: newsletterIssues.id,
      slug: newsletterIssues.slug,
      subject: newsletterIssues.subject,
      status: newsletterIssues.status,
      sentAt: newsletterIssues.sentAt,
    })
    .from(newsletterIssues)
    .orderBy(desc(newsletterIssues.updatedAt))
    .limit(3);

  return { subscribers, lastIssueSentAt: sentRows[0]?.sentAt ?? null, recentIssues };
}

async function getEventsMetrics(): Promise<DashboardMetrics["events"]> {
  return {
    upcomingCount: upcomingEventsData.length,
    upcoming: upcomingEventsData.slice(0, 3).map(eventToSummary),
  };
}

// Nunca lanza: cada sección degrada a su valor neutro si su fuente falla.
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [contactsR, newsletterR, eventsR] = await Promise.allSettled([
    getContactsMetrics(),
    getNewsletterMetrics(),
    getEventsMetrics(),
  ]);

  return {
    contacts:
      contactsR.status === "fulfilled"
        ? contactsR.value
        : { total: null, last30d: null },
    newsletter:
      newsletterR.status === "fulfilled"
        ? newsletterR.value
        : { subscribers: null, lastIssueSentAt: null, recentIssues: [] },
    events:
      eventsR.status === "fulfilled"
        ? eventsR.value
        : { upcomingCount: null, upcoming: [] },
  };
}
