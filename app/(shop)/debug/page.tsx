import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { DebuggerDemo } from "@/modules/debug/debugger-demo";

// Workshop step 06 — debugging playground (front + back). Not for production;
// keep it out of the index.
export const metadata: Metadata = {
  title: "Debug",
  robots: { index: false, follow: false },
};

// Back-end breakpoint target. `connection()` makes this request-time, so it must
// live inside <Suspense> (Cache Components). Run `pnpm dev:inspect`, open
// chrome://inspect, and set a breakpoint on the `renderedAt` line to pause the
// server render and inspect process.env / globals in the inspector.
async function ServerRenderInfo() {
  await connection();
  const renderedAt = new Date().toISOString();
  return (
    <p className="mt-2 text-sm text-muted">
      Rendu serveur à <code>{renderedAt}</code>. Voir <code>DEBUG.md</code> pour
      le point d&apos;arrêt back-end.
    </p>
  );
}

export default function DebugPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Debug</h1>
        <Suspense
          fallback={<p className="mt-2 text-sm text-muted">Rendu serveur…</p>}
        >
          <ServerRenderInfo />
        </Suspense>
      </div>
      <DebuggerDemo />
    </div>
  );
}
