export const TEAM_OPTIONS = [
  "AI Research",
  "Communications",
  "Data Science & Analytics",
  "Design",
  "Finance",
  "Legal",
  "Marketing & Brand",
  "People",
  "Product Management, Support, & Operations",
  "Sales",
  "Security",
  "Software Engineering",
] as const;

export type TeamOption = (typeof TEAM_OPTIONS)[number];
