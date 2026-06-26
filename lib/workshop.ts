import "server-only";

// Workshop helper: simulate a slow upstream (DB / API / GraphQL) so that
// streaming and Suspense boundaries are actually observable. It's a no-op
// unless a positive delay is passed, so production stays fast. Demo by setting
// the env vars read at the call sites, e.g.:
//   PRODUCT_DELAY_MS=700 SIMILAR_DELAY_MS=1800 npx next start
export async function simulateLatency(ms: number): Promise<void> {
  if (ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** Read a simulated-latency value from an env var (default 0 = no delay). */
export function delayFromEnv(name: string): number {
  const value = Number(process.env[name] ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}
