import type { MetadataRoute } from "next";

// Workshop step 05 — the Web App Manifest, served at /manifest.webmanifest.
// Next auto-injects the <link rel="manifest"> into <head> for this file
// convention, so no manual metadata.manifest is needed. It's a cached Route
// Handler (no request-time API used here), so it prerenders.
export default function manifest(): MetadataRoute.Manifest {
  const name = process.env.NEXT_PUBLIC_SITE_NAME ?? "My Supa Store";

  return {
    name,
    short_name: "Supa Store",
    description: "Épicerie fine & objets pour la maison — atelier Next.js.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf7f2",
    theme_color: "#1f2d3d",
    lang: "fr",
    categories: ["shopping", "food"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
