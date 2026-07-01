/* Workshop step 05 — service worker.
 *
 * Strategy: NETWORK-FIRST with a cache fallback.
 *   - On fetch, try the network. On success, clone the response into the runtime
 *     cache and return it (so the cache always holds the freshest copy).
 *   - If the network fails (offline), serve the last cached copy. If nothing is
 *     cached and it's a navigation, fall back to the cached home page ("/").
 *
 * Only same-origin GET requests are handled; everything else (POST, cross-origin
 * beacons/images from other hosts, the SW itself) passes straight through.
 *
 * NOTE: in `next dev` the SW is unreliable because of HMR — test it against a
 * production build (`next build && next start`).
 */

const CACHE = "supa-store-v1";
const PRECACHE = ["/", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  // Warm the cache with the app shell, then activate immediately.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  // Drop caches from previous versions, then take control of open clients.
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only cache same-origin GETs; let the browser handle the rest.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Don't cache Next's dev/HMR machinery or the SW file itself.
  if (url.pathname.startsWith("/_next/") && url.pathname.includes("webpack")) {
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // 1. Network first.
        const fresh = await fetch(request);
        if (fresh && fresh.status === 200 && fresh.type === "basic") {
          const cache = await caches.open(CACHE);
          cache.put(request, fresh.clone());
        }
        return fresh;
      } catch {
        // 2. Fallback to cache.
        const cached = await caches.match(request);
        if (cached) return cached;
        // 3. For navigations with nothing cached, serve the shell.
        if (request.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }
        return Response.error();
      }
    })(),
  );
});
