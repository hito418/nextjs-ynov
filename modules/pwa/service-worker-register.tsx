"use client";

import { useEffect } from "react";

// Workshop step 05 — registers /sw.js from the client after mount.
//
// Guarded so it's a no-op when the browser lacks service workers, and skipped in
// development where Next's HMR makes the SW unreliable (register it only for a
// production build). Renders nothing.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch((err) => {
          console.error("[pwa] SW registration failed:", err);
        });
    };

    // Register after `load` so it never competes with initial page resources.
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
