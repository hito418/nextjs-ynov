import { defineConfig, devices } from "@playwright/test";

// Workshop step 08 — Playwright end-to-end config.
//
// `webServer` boots the app before the specs run (and reuses an already-running
// dev server locally). We pin `locale: "fr-FR"` so the proxy's Accept-Language
// negotiation is deterministic (first visit → NEXT_LOCALE=fr), which the
// language-switch spec relies on.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    locale: "fr-FR",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "node_modules/.bin/next dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
