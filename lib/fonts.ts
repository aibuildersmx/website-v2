import { Geist, Geist_Mono, Instrument_Serif, Instrument_Sans, Inter } from "next/font/google";

export const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
export const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
export const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});
export const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Public site needs all four families; admin only needs Geist + Geist Mono.
export const siteFontVariables = `${geistSans.variable} ${geistMono.variable} ${inter.variable} ${instrumentSerif.variable} ${instrumentSans.variable}`;
export const adminFontVariables = `${geistSans.variable} ${geistMono.variable}`;
