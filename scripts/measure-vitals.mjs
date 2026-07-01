// Workshop steps 01 & 09 — headless Web Vitals measurement.
//
// Drives the (already-running) production server at BASE with Playwright's
// Chromium and reads the browser's real Performance APIs: LCP (+ its element),
// cumulative layout shift (+ the biggest shift source), FCP and TTFB. Prints one
// block per page so we can spot the worst metric and the element behind it.
//
// Usage: node scripts/measure-vitals.mjs   (needs `next start` on :3000)

import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:3000";
const PAGES = ["/", "/products/cafe-aurora", "/env-demo"];

// Injected into the page: collect LCP / CLS / paint via PerformanceObserver.
function installObservers() {
  window.__vitals = { lcp: null, lcpEl: null, cls: 0, clsEl: null };

  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      window.__vitals.lcp = e.startTime;
      const el = e.element;
      window.__vitals.lcpEl = el
        ? el.tagName.toLowerCase() +
          (el.id ? "#" + el.id : "") +
          (el.currentSrc ? `[${el.currentSrc.split("/").pop()}]` : "") +
          (el.className && typeof el.className === "string"
            ? "." + el.className.trim().split(/\s+/)[0]
            : "")
        : null;
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });

  let worst = 0;
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__vitals.cls += e.value;
      if (e.value > worst) {
        worst = e.value;
        const node = e.sources?.[0]?.node;
        window.__vitals.clsEl = node?.tagName
          ? node.tagName.toLowerCase() +
            (node.className && typeof node.className === "string"
              ? "." + node.className.trim().split(/\s+/)[0]
              : "")
          : null;
      }
    }
  }).observe({ type: "layout-shift", buffered: true });
}

const round = (n) => (n == null ? null : Math.round(n * 100) / 100);

const browser = await chromium.launch();
const results = [];

for (const path of PAGES) {
  const page = await browser.newPage({ locale: "fr-FR" });
  await page.addInitScript(installObservers);
  const resp = await page.goto(BASE + path, { waitUntil: "load" });

  // Let LCP settle and scroll to trigger any lazy shifts.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  const nav = await page.evaluate(() => {
    const [n] = performance.getEntriesByType("navigation");
    const fcp = performance
      .getEntriesByType("paint")
      .find((p) => p.name === "first-contentful-paint");
    return {
      ttfb: n ? n.responseStart : null,
      fcp: fcp ? fcp.startTime : null,
      domInteractive: n ? n.domInteractive : null,
      transferKB: n ? Math.round(n.transferSize / 1024) : null,
    };
  });
  const vitals = await page.evaluate(() => window.__vitals);

  results.push({
    path,
    status: resp?.status(),
    ttfb: round(nav.ttfb),
    fcp: round(nav.fcp),
    lcp: round(vitals.lcp),
    lcpEl: vitals.lcpEl,
    cls: round(vitals.cls),
    clsEl: vitals.clsEl,
    transferKB: nav.transferKB,
  });
  await page.close();
}

await browser.close();

console.log("\n=== Web Vitals (production build, headless Chromium) ===\n");
for (const r of results) {
  console.log(`● ${r.path}  [${r.status}]`);
  console.log(`    TTFB ${r.ttfb}ms   FCP ${r.fcp}ms   LCP ${r.lcp}ms   CLS ${r.cls}`);
  console.log(`    LCP element: ${r.lcpEl ?? "—"}`);
  if (r.cls > 0) console.log(`    worst shift: ${r.clsEl ?? "—"}`);
  console.log(`    HTML transfer: ${r.transferKB}KB\n`);
}
console.log(JSON.stringify(results));
