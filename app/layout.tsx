import type { Metadata } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

// Body font (self-hosted by next/font, no network request at runtime).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Decorative brand font loaded from a local .woff2 with next/font/local.
// Self-hosting + size-adjust metrics avoid the layout shift (CLS) you'd get
// from a <link> to Google Fonts.
const dancing = localFont({
  src: "./fonts/DancingScript.woff2",
  variable: "--font-dancing",
  display: "swap",
  weight: "400 700",
});

export const metadata: Metadata = {
  title: {
    default: "My Supa Store",
    template: "%s · My Supa Store",
  },
  description: "Épicerie fine & objets pour la maison — atelier Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${dancing.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
