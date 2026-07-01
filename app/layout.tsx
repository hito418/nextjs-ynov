import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { WebVitals } from "@/modules/observability/web-vitals";
import { ServiceWorkerRegister } from "@/modules/pwa/service-worker-register";
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

// Workshop step 02 — static, site-wide metadata. Every route inherits these
// unless it overrides them (the product page provides its own via
// generateMetadata). `metadataBase` lets relative Open Graph / canonical URLs
// resolve to absolute ones, which OG scrapers require.
const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "My Supa Store";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s · ${siteName}`,
  },
  description: "Épicerie fine & objets pour la maison — atelier Next.js.",
  keywords: ["épicerie fine", "objets maison", "Next.js", "boutique", "atelier"],
  applicationName: siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName,
    url: "/",
    title: siteName,
    description: "Épicerie fine & objets pour la maison — atelier Next.js.",
  },
  // Workshop step 05 — PWA. The manifest link is auto-injected by app/manifest.ts;
  // here we add the icons + iOS "add to home screen" hints.
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },
};

// Workshop step 05 — themeColor belongs on the Viewport export (moved off
// Metadata since Next 14). It tints the browser/OS chrome for the installed PWA.
export const viewport: Viewport = {
  themeColor: "#1f2d3d",
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
      <body className="min-h-full">
        <WebVitals />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
