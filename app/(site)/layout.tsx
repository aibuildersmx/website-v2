import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { siteFontVariables } from "@/lib/fonts";

const siteUrl = "https://aibuilders.mx";
const socialImage = "/twitter-card.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "AI Builders Mexico",
  description: "La Comunidad de AI en México",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "AI Builders Mexico",
    description: "La Comunidad de AI en México",
    type: "website",
    locale: "es_MX",
    siteName: "AI Builders Mexico",
    images: [
      {
        url: socialImage,
        width: 1024,
        height: 535,
        alt: "AI Builders Mexico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Builders Mexico",
    description: "La Comunidad de AI en México",
    images: [socialImage],
  },
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${siteFontVariables} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="aibm-theme"
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
