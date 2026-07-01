"use client";

import { useState } from "react";

// Workshop step 06 — a front-end breakpoint demo.
//
// The `debugger;` statement pauses JS execution *when DevTools is open*. We put
// it behind a click handler (not in render) so it only fires when you ask it to,
// letting you inspect the local `count`, `next`, props, and the call stack in
// the Sources panel. With DevTools closed it's a no-op.
export function DebuggerDemo() {
  const [count, setCount] = useState(0);

  function handleClick() {
    const next = count + 1;
    // Open DevTools (F12) → click the button → execution pauses here.
    // Inspect `count`, `next`, hover values, step over, edit live.
    debugger;
    setCount(next);
  }

  return (
    <div className="rounded-2xl border border-line bg-paper p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
        Point d&apos;arrêt front (client)
      </h2>
      <p className="mb-4 text-sm text-muted">
        Ouvrez les DevTools (F12), puis cliquez : l&apos;exécution s&apos;arrête
        sur la ligne <code>debugger;</code>.
      </p>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream transition hover:bg-ink/90"
      >
        Incrémenter — count = {count}
      </button>
    </div>
  );
}
