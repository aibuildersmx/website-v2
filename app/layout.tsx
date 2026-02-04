import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/app/collab/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
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
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Builders Mexico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Builders Mexico",
    description: "La Comunidad de AI en México",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
        <Analytics />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="aibm-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
