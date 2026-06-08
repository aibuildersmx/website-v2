import type { Issue } from "./types";

export interface BroadcastPayload {
  audienceId: string;
  from: string;
  subject: string;
  html: string;
  name: string;
  replyTo?: string;
}

export function broadcastName(issue: Issue): string {
  return `The Build Log ${issue.slug}`;
}

export function buildBroadcastPayload(
  issue: Issue,
  html: string,
  opts: { audienceId: string; from: string; replyTo?: string },
): BroadcastPayload {
  const payload: BroadcastPayload = {
    audienceId: opts.audienceId,
    from: opts.from,
    subject: issue.subject,
    html,
    name: broadcastName(issue),
  };
  if (opts.replyTo) payload.replyTo = opts.replyTo;
  return payload;
}
