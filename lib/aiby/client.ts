import "server-only";
import type {
  OverviewData,
  VolumeData,
  HeatmapData,
  RecentMessages,
  TopicsPage,
  PeoplePage,
  TopicDetailData,
  PersonDetailData,
  JobsList,
  ShowcaseList,
  JobStatus,
} from "./types";

export type AibyRange = {
  preset: "day" | "week" | "month" | "quarter" | "year";
  group?: string | null;
};

export class AibyApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AibyApiError";
    this.status = status;
  }
}

function config(): { base: string; key: string } {
  const base = process.env.AIBY_API_BASE;
  const key = process.env.AIBY_API_KEY;
  if (!base) throw new Error("Falta AIBY_API_BASE en el entorno.");
  if (!key) throw new Error("Falta AIBY_API_KEY en el entorno.");
  return { base: base.replace(/\/$/, ""), key };
}

function buildUrl(
  base: string,
  path: string,
  range: AibyRange,
  extra?: Record<string, string | number | undefined | null>,
): string {
  const url = new URL(`/dashboard/api${path}`, base);
  url.searchParams.set("preset", range.preset);
  if (range.group) url.searchParams.set("group", range.group);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function get<T>(
  path: string,
  range: AibyRange,
  extra?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const { base, key } = config();
  const res = await fetch(buildUrl(base, path, range, extra), {
    headers: { "x-api-key": key },
    // Métricas: cachear 60s, no necesitan ser al-segundo.
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new AibyApiError(`aiby API ${res.status} en ${path}`, res.status);
  }
  return (await res.json()) as T;
}

export const getOverview = (range: AibyRange) => get<OverviewData>("/overview", range);
export const getVolume = (range: AibyRange) => get<VolumeData>("/volume", range);
export const getHeatmap = (range: AibyRange) => get<HeatmapData>("/heatmap", range);
export const getRecent = (range: AibyRange, limit = 30) =>
  get<RecentMessages>("/recent", range, { limit });
export const getTopics = (range: AibyRange, opts?: { offset?: number; limit?: number }) =>
  get<TopicsPage>("/topics", range, { offset: opts?.offset ?? 0, limit: opts?.limit ?? 25 });
export const getPeople = (range: AibyRange, opts?: { offset?: number; limit?: number }) =>
  get<PeoplePage>("/people", range, { offset: opts?.offset ?? 0, limit: opts?.limit ?? 25 });
export const getTopic = (slug: string, range: AibyRange) =>
  get<TopicDetailData>(`/topic/${encodeURIComponent(slug)}`, range);
export const getPerson = (jid: string, range: AibyRange) =>
  get<PersonDetailData>(`/person/${encodeURIComponent(jid)}`, range);

async function patch<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { base, key } = config();
  const res = await fetch(`${base}/dashboard/api${path}`, {
    method: "PATCH",
    headers: { "x-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new AibyApiError(`aiby API ${res.status} en PATCH ${path}`, res.status);
  }
  return (await res.json()) as T;
}

export const getJobs = (
  range: AibyRange,
  filters?: { mode?: string; tag?: string; status?: string; search?: string; limit?: number; offset?: number },
) =>
  get<JobsList>("/jobs", range, {
    mode: filters?.mode,
    tag: filters?.tag,
    status: filters?.status,
    search: filters?.search,
    limit: filters?.limit,
    offset: filters?.offset,
  });

export const getShowcase = (range: AibyRange, limit = 30) =>
  get<ShowcaseList>("/showcase", range, { limit });

export const patchJobStatus = (id: number, status: JobStatus) =>
  patch<{ ok: boolean; id: number; status: string }>(`/jobs/${id}`, { status });
