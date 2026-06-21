export type CurationContact = { id: string; email: string; name: string | null };

export type CurationPerson = {
  jid: string;
  name: string | null;
  phone: string;
  displayName: string | null;
  notes: string | null;
  tags: string[];
  contact: CurationContact | null;
};

export function filterPeopleByMatch<T extends { contact: CurationContact | null }>(
  people: T[],
  mode: string | undefined,
): T[] {
  if (mode !== "pending") return people;
  return people.filter((p) => p.contact === null);
}

export function suggestQueryFor(p: { displayName: string | null; name: string | null }): string {
  const dn = (p.displayName ?? "").trim();
  if (dn.length >= 2) return dn;
  const n = (p.name ?? "").trim();
  if (n.length >= 2) return n;
  return "";
}
