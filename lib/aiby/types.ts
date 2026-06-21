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
