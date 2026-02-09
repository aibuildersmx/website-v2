import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Board | AI Builders Mexico",
  description:
    "Futuristic job card designs and job board for the AI Builders Mexico community",
};

export default function JobBoardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
