import { test, expect } from "@playwright/test";

// Workshop step 08 — end-to-end flows: product listing, product navigation,
// and the cookie-based language switch.

test.describe("storefront", () => {
  test("displays the product catalogue on the home page", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Bienvenue chez/i }),
    ).toBeVisible();

    // At least a few product cards, each linking to a product page.
    const productLinks = page.locator('a[href^="/products/"]');
    expect(await productLinks.count()).toBeGreaterThan(0);
  });

  test("navigates to a product detail page", async ({ page }) => {
    await page.goto("/");

    const firstProduct = page.locator('a[href^="/products/"]').first();
    const name = (await firstProduct.locator("h3").textContent())?.trim();
    await firstProduct.click();

    await expect(page).toHaveURL(/\/products\/.+/);
    // The detail page shows the product name as an <h1> and a back link.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    if (name) {
      await expect(
        page.getByRole("heading", { level: 1, name }),
      ).toBeVisible();
    }
    await expect(
      page.getByRole("link", { name: /Retour à la boutique/i }),
    ).toBeVisible();
  });

  test("switches language via the cookie switcher", async ({ page }) => {
    await page.goto("/");

    // Default (fr-FR Accept-Language → NEXT_LOCALE=fr): nav shows "Boutique".
    await expect(page.getByRole("link", { name: "Boutique" })).toBeVisible();

    // Flip to English.
    await page.getByRole("button", { name: "EN" }).click();

    // The dynamic nav re-renders in English after router.refresh().
    await expect(page.getByRole("link", { name: "Shop" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Boutique" }),
    ).toHaveCount(0);
  });
});
