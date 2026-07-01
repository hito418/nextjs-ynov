"use client";

import { useReportWebVitals } from "next/web-vitals";

// Workshop step 01 — Observabilité.
//
// `useReportWebVitals` (from `next/web-vitals`) requires a client boundary, so
// this component is intentionally tiny and isolated: the root layout imports it
// so the "use client" boundary stays confined to this file (per the Next docs).
// It renders nothing.
//
// For each metric we do two things:
//   1. Pretty-print it to the browser console (what the workshop asks for —
//      "logguer les infos du hook").
//   2. Beacon the metric to /api/vitals so the numbers land in the *server*
//      console too. That lets us collect + analyse them headlessly (step 09)
//      instead of eyeballing DevTools.
//
// The callback reference must stay stable to avoid double-reporting, so it lives
// at module scope rather than being recreated on every render.

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

/** Try to name the DOM element responsible for a metric (LCP element, CLS shift
 *  source, INP target). Purely for human analysis of "worst element". */
function attributionOf(metric: Metric): string | undefined {
  const entries = metric.entries as unknown as Array<Record<string, unknown>>;
  if (!entries?.length) return undefined;

  const describe = (el: unknown): string | undefined => {
    if (!(el instanceof Element)) return undefined;
    const id = el.id ? `#${el.id}` : "";
    const cls =
      typeof el.className === "string" && el.className
        ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
        : "";
    const extra =
      el.tagName === "IMG" ? `[src=${(el as HTMLImageElement).currentSrc}]` : "";
    return `${el.tagName.toLowerCase()}${id}${cls}${extra}`;
  };

  const last = entries[entries.length - 1];

  // LCP: entry has `.element`.
  if ("element" in last) return describe(last.element);

  // CLS: entries have `.sources[].node`.
  for (const entry of entries) {
    const sources = entry.sources as Array<{ node?: unknown }> | undefined;
    const named = sources?.map((s) => describe(s.node)).filter(Boolean);
    if (named?.length) return named.join(", ");
  }

  // INP / event: entry has `.target`.
  if ("target" in last) return describe(last.target);

  return undefined;
}

function report(metric: Metric) {
  const attribution = attributionOf(metric);

  // 1. Browser console.
  const round = Math.round(metric.value * 100) / 100;
  console.log(
    `[web-vitals] ${metric.name} = ${round} (${metric.rating})` +
      (attribution ? ` ← ${attribution}` : ""),
  );

  // 2. Server console, so we can analyse headlessly.
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
    attribution,
    path: window.location.pathname,
  });

  // sendBeacon survives page unload; fall back to fetch(keepalive).
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/vitals", body);
  } else {
    fetch("/api/vitals", { body, method: "POST", keepalive: true });
  }
}

export function WebVitals() {
  useReportWebVitals(report);
  return null;
}
