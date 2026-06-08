import type { ContactInput, ContactSource, MergedContact } from "./types";

/**
 * Merge normalized inputs into one row per lowercased email.
 * - sources: union, first-seen order
 * - name/locale: first non-empty wins
 * - tags: union (dedup, first-seen order)
 * - isPremium: OR
 * - newsletterSubscribed: AND — any explicit opt-out wins (CAN-SPAM compliance)
 * - metadata: namespaced by source
 * - firstSeenAt: earliest defined
 *
 * Inputs are assumed single-use: stored `metadata` references `input.metadata`
 * (not cloned), so callers must not mutate inputs after merging.
 */
export function mergeContacts(inputs: ContactInput[]): MergedContact[] {
  const byEmail = new Map<string, MergedContact>();

  for (const inp of inputs) {
    const existing = byEmail.get(inp.email);
    if (!existing) {
      byEmail.set(inp.email, {
        email: inp.email,
        name: inp.name,
        locale: inp.locale,
        sources: [inp.source],
        tags: [...new Set(inp.tags)],
        isPremium: inp.isPremium,
        newsletterSubscribed: inp.newsletterSubscribed,
        metadata: Object.keys(inp.metadata).length ? { [inp.source]: inp.metadata } : {},
        firstSeenAt: inp.firstSeenAt,
      });
      continue;
    }
    if (!existing.sources.includes(inp.source)) existing.sources.push(inp.source);
    if (!existing.name && inp.name) existing.name = inp.name;
    if (!existing.locale && inp.locale) existing.locale = inp.locale;
    existing.tags = [...new Set([...existing.tags, ...inp.tags])];
    existing.isPremium = existing.isPremium || inp.isPremium;
    existing.newsletterSubscribed = existing.newsletterSubscribed && inp.newsletterSubscribed;
    if (Object.keys(inp.metadata).length) {
      existing.metadata = { ...existing.metadata, [inp.source]: inp.metadata };
    }
    if (inp.firstSeenAt && (!existing.firstSeenAt || inp.firstSeenAt < existing.firstSeenAt)) {
      existing.firstSeenAt = inp.firstSeenAt;
    }
  }

  return [...byEmail.values()];
}

/** Convenience: sources present in a merged set, for reporting. */
export function sourceCounts(merged: MergedContact[]): Record<ContactSource, number> {
  const counts = { beehiiv: 0, "cursor-event": 0, lead: 0, "cursor-attendees": 0 } as Record<ContactSource, number>;
  for (const c of merged) for (const s of c.sources) counts[s]++;
  return counts;
}
