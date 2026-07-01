import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "./language-switcher";

// Workshop step 08 — React Testing Library test for the client language switch.

// The switcher calls useRouter().refresh(); mock next/navigation so we can spy
// on it without a real router.
const refresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

describe("<LanguageSwitcher />", () => {
  beforeEach(() => {
    refresh.mockClear();
    // Reset cookies between tests.
    document.cookie
      .split(";")
      .forEach((c) => {
        document.cookie = `${c.split("=")[0].trim()}=;max-age=0;path=/`;
      });
  });

  it("marks the current locale as pressed", () => {
    render(<LanguageSwitcher current="fr" />);
    expect(screen.getByRole("button", { name: "FR" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("sets the NEXT_LOCALE cookie and refreshes when switching", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher current="fr" />);

    await user.click(screen.getByRole("button", { name: "EN" }));

    expect(document.cookie).toContain("NEXT_LOCALE=en");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("does nothing when clicking the already-active locale", async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher current="fr" />);

    await user.click(screen.getByRole("button", { name: "FR" }));

    expect(refresh).not.toHaveBeenCalled();
  });
});
