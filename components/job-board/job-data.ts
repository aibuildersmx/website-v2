export interface JobData {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  badge?: string;
  team: string;
  location: string;
  locationType: "Remote" | "Hybrid" | "On-site";
  salary: string;
  experience: string;
  description: string;
  applyUrl: string;
  tags: string[];
  status: "New" | "Urgent" | "Last Call";
  postedAt: string;
}

export const sampleJob: JobData = {
  id: "JB-2026-0042",
  title: "Senior AI Product Engineer",
  company: "AI Builders Mexico",
  companyLogo: "/favicon.svg",
  badge: "DEMO",
  team: "Software Engineering",
  location: "Ciudad de México, MX",
  locationType: "Hybrid",
  salary: "$80,000 - $110,000 USD",
  experience: "5+ years",
  description:
    "Lead end-to-end delivery of AI-native product features, from prototype to production. You will build with Next.js and Python services, orchestrate LLM workflows, and partner closely with design and growth to ship high-impact user experiences.",
  applyUrl:
    "mailto:talent@aibuilders.mx?subject=Application%20-%20Senior%20AI%20Product%20Engineer",
  tags: ["DEMO", "Next.js", "TypeScript", "Python", "LLMs", "Product"],
  status: "New",
  postedAt: "Just now",
};

export const sampleJobs: JobData[] = [
  sampleJob,
  {
    id: "JB-2026-0078",
    title: "Staff Frontend Engineer",
    company: "Voidform Studio",
    companyLogo: "https://api.dicebear.com/9.x/initials/svg?seed=VS&backgroundColor=ec4899",
    team: "Software Engineering",
    location: "New York, NY",
    locationType: "Remote",
    salary: "$195,000 - $260,000",
    experience: "7+ years",
    description: "Architect design systems and WebGL experiences. React, TypeScript expertise essential. Shape the future of our product UI.",
    applyUrl: "#",
    tags: ["React", "TypeScript", "WebGL", "Design Systems"],
    status: "Urgent",
    postedAt: "5 hours ago",
  },
  {
    id: "JB-2026-0103",
    title: "Blockchain Protocol Engineer",
    company: "ChainMind",
    companyLogo: "https://api.dicebear.com/9.x/initials/svg?seed=CM&backgroundColor=10b981",
    team: "Software Engineering",
    location: "Zurich, Switzerland",
    locationType: "On-site",
    salary: "Undisclosed",
    experience: "3+ years",
    description: "Design consensus protocols and ZK proof systems. Rust and Solidity proficiency needed. Work on cutting-edge L2 solutions.",
    applyUrl: "#",
    tags: ["Rust", "Solidity", "ZK Proofs", "Consensus"],
    status: "Last Call",
    postedAt: "1 week ago",
  },
];
