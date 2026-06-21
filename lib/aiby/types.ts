// Tipos de las respuestas de la API de aiby-bridge (/dashboard/api/*).
// Portados de aibuilders-bot/dashboard/src/api.ts — mantener en sync si la API cambia.

export interface OverviewData {
  range: { preset: string; fromDate: string; toDate: string };
  group: string | null;
  totals: { messages: number; activePeople: number; topics: number; showcase: number };
  volumeByDay: Array<{ date: string; count: number }>;
  topPeople: Array<{ jid: string; name: string | null; phone: string; count: number }>;
  topTopics: Array<{ slug: string; display_name: string; count: number }>;
  groups: Array<{ alias: string; jid: string; count: number }>;
}

export interface VolumeData {
  range: { fromDate: string; toDate: string };
  // Cada fila: { date, [channelAlias]: count, ... }. Las llaves (menos `date`) son canales.
  series: Array<Record<string, number | string>>;
}

export interface HeatmapData {
  range: { fromDate: string; toDate: string };
  group: string | null;
  cells: Array<{ dow: number; hour: number; count: number }>;
}

export interface RecentMessages {
  range: { fromDate: string; toDate: string };
  group: string | null;
  messages: Array<{
    id: number; ts: string; group_alias: string; sender_jid: string;
    sender_name: string | null; sender_phone: string; text: string; is_image: number;
  }>;
}

export interface TopicsPage {
  range: { fromDate: string; toDate: string };
  group: string | null;
  offset: number;
  limit: number;
  topics: Array<{ slug: string; display_name: string; count: number }>;
}

export interface PeoplePage {
  range: { fromDate: string; toDate: string };
  group: string | null;
  offset: number;
  limit: number;
  people: Array<{ jid: string; name: string | null; phone: string; count: number }>;
}

export interface TopicDetailData {
  slug: string;
  display_name: string;
  mention_count: number;
  topPeople: Array<{ jid: string; name: string | null; phone: string; count: number }>;
  recentMessages: Array<{ id: number; ts: string; sender_name: string | null; sender_phone: string; group_alias: string; text: string }>;
  showcase: Array<{ id: number; date: string; group_alias: string; author_name: string | null; author_jid: string; title: string; description: string; links: string[]; tags: string[] }>;
  threads: Array<{ date: string; group_alias: string; title: string; gist: string }>;
  timeline: Array<{ date: string; count: number }>;
  contributors: Array<{ name: string; jid: string | null; count: number; sources: Array<"showcase" | "thread"> }>;
}

export interface PersonDetailData {
  jid: string;
  name: string | null;
  phone: string;
  messageCount: number;
  topTopics: Array<{ slug: string; display_name: string; count: number }>;
  recentMessages: Array<{ id: number; ts: string; group_alias: string; text: string }>;
  showcase: Array<{ id: number; date: string; group_alias: string; title: string; description: string; links: string[]; tags: string[] }>;
  profile: { expertise: string[]; projects: unknown[]; links_authored: string[]; style_notes: string | null } | null;
}
