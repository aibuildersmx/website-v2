export interface JobData {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
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
  title: "Senior AI Engineer",
  company: "NeuralForge Labs",
  companyLogo: "https://api.dicebear.com/9.x/initials/svg?seed=NF&backgroundColor=6366f1",
  team: "Software Engineering",
  location: "San Francisco, CA",
  locationType: "Hybrid",
  salary: "$185,000 - $240,000",
  experience: "5+ years",
  description: "Build and deploy large language models. Strong Python, PyTorch, and MLOps skills required. Lead a team of ML engineers.",
  applyUrl: "#",
  tags: ["Python", "PyTorch", "LLMs", "MLOps", "Transformers"],
  status: "New",
  postedAt: "2 days ago",
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
