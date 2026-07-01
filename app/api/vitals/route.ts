import { NextResponse } from "next/server";

// Workshop step 01 — collector for the Web Vitals beacons sent by
// modules/observability/web-vitals.tsx. It just logs each metric to the server
// console (and echoes a compact line), which makes it trivial to collect the
// numbers headlessly during the perf audit (step 09) — every navigation prints
// its LCP/CLS/INP with the element that caused it.

type Vital = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  id: string;
  navigationType?: string;
  attribution?: string;
  path?: string;
};

export async function POST(request: Request) {
  let vital: Vital;
  try {
    vital = (await request.json()) as Vital;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const value = Math.round(vital.value * 100) / 100;
  const flag =
    vital.rating === "poor" ? "🔴" : vital.rating === "good" ? "🟢" : "🟡";

  console.log(
    `[vitals] ${flag} ${vital.name.padEnd(4)} ${String(value).padStart(8)}  ` +
      `${(vital.path ?? "?").padEnd(24)} ${vital.attribution ?? ""}`,
  );

  // sendBeacon ignores the response; 204 keeps it cheap.
  return new NextResponse(null, { status: 204 });
}
