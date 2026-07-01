"use client";

// Workshop step 03 — the CLIENT side of the env-var demo.
//
// Because this is a "use client" component, only `NEXT_PUBLIC_`-prefixed vars
// are readable here: Next inlines them into the browser bundle at build time.
// `process.env.SERVER_SECRET` (no prefix) is replaced with `undefined` in the
// client bundle — proving it never leaves the server.

export function EnvDemoClient() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
  // This is `undefined` in the browser — the whole point of the demo.
  const secret = process.env.SERVER_SECRET;

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Depuis un composant client
      </h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">NEXT_PUBLIC_SITE_NAME</dt>
          <dd className="font-mono text-ink">{siteName ?? "undefined"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">SERVER_SECRET</dt>
          <dd className="font-mono text-gold-dark">
            {secret ?? "undefined (jamais envoyé au navigateur)"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
