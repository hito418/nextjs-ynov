import type { Metadata } from "next";
import { EnvDemoClient } from "@/modules/env/env-demo-client";

// Workshop step 03 — a page contrasting a public env var (readable everywhere)
// with a server-only one (readable only on the server).

export const metadata: Metadata = {
  title: "Variables d'environnement",
  robots: { index: false, follow: false }, // demo page — keep it out of search.
};

export default function EnvDemoPage() {
  // Server component: reads BOTH vars directly from process.env.
  const publicName = process.env.NEXT_PUBLIC_SITE_NAME ?? "undefined";
  const secret = process.env.SERVER_SECRET ?? "undefined";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          Variables d&apos;environnement
        </h1>
        <p className="mt-2 text-sm text-muted">
          Public (<code>NEXT_PUBLIC_*</code>) vs serveur uniquement. Comparez ce
          que voient le serveur, le client, et la route{" "}
          <code>/api/env-demo</code>.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Depuis un composant serveur
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">NEXT_PUBLIC_SITE_NAME</dt>
            <dd className="font-mono text-ink">{publicName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">SERVER_SECRET</dt>
            <dd className="font-mono text-ink">{secret}</dd>
          </div>
        </dl>
      </div>

      <EnvDemoClient />

      <p className="text-sm text-muted">
        La route serveur{" "}
        <a
          href="/api/env-demo"
          className="text-gold-dark underline underline-offset-2"
        >
          /api/env-demo
        </a>{" "}
        expose les deux variables (elle tourne sur le serveur). Le composant
        client, lui, ne voit jamais <code>SERVER_SECRET</code>.
      </p>
    </div>
  );
}
