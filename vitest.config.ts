import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Workshop step 08 — Vitest + React Testing Library.
//
// - `react()` compiles JSX/TSX for component tests.
// - `tsconfigPaths()` teaches Vitest the `@/*` alias from tsconfig.json.
// - `jsdom` gives a DOM (document.cookie, render targets) for RTL.
// - `setupFiles` wires @testing-library/jest-dom matchers + auto cleanup.
// E2E specs live under e2e/ and run with Playwright, so we exclude them here.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**", ".next/**"],
  },
});
