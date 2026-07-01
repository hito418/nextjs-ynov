import { NextResponse } from "next/server";
import { connection } from "next/server";

// Workshop step 03 — the SERVER side of the env-var demo.
//
// A Route Handler runs only on the server, so it can read BOTH the public var
// and the server-only secret. Compare this JSON with what the client component
// (modules/env/env-demo-client.tsx) can see: there, SERVER_SECRET is undefined.
//
// `connection()` opts this route out of static prerendering (Cache Components is
// on) so `process.env` is evaluated at request time, not baked in at build.

export async function GET() {
  await connection();

  return NextResponse.json({
    // Public — the same value the client sees (inlined into its bundle).
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? null,
    // Server-only — visible HERE, but never shipped to the browser.
    SERVER_SECRET: process.env.SERVER_SECRET ?? null,
    note: "SERVER_SECRET is visible here (server) but undefined in the client component.",
  });
}
