import { describe, it, expect } from "vitest";
import { formatPrice, isInStock, type Money } from "./product";

// Workshop step 08 — unit tests for the catalog domain rules.

describe("formatPrice", () => {
  const eur = (amountCents: number): Money => ({ amountCents, currency: "EUR" });

  // fr-FR uses a comma decimal separator and a (narrow) no-break space before
  // the symbol. We normalise whitespace so the assertion isn't brittle across
  // ICU versions.
  const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

  it("formats cents as euros with a comma decimal separator", () => {
    expect(normalize(formatPrice(eur(1290)))).toBe("12,90 €");
  });

  it("always shows two decimals", () => {
    expect(normalize(formatPrice(eur(500)))).toBe("5,00 €");
    expect(normalize(formatPrice(eur(0)))).toBe("0,00 €");
  });

  it("groups thousands", () => {
    // 1 234,56 € — grouping separator is also a (narrow) space.
    expect(normalize(formatPrice(eur(123456)))).toBe("1 234,56 €");
  });

  it("respects the currency", () => {
    expect(formatPrice(eur(1000), "en-US")).toBe("€10.00");
    const usd = formatPrice({ amountCents: 1000, currency: "USD" }, "en-US");
    expect(usd).toBe("$10.00");
  });
});

describe("isInStock", () => {
  it("is available when stock is positive", () => {
    expect(isInStock({ stock: 5 })).toBe(true);
    expect(isInStock({ stock: 1 })).toBe(true);
  });

  it("is out of stock at zero or below", () => {
    expect(isInStock({ stock: 0 })).toBe(false);
    expect(isInStock({ stock: -3 })).toBe(false);
  });

  it("treats untracked stock (undefined) as available", () => {
    expect(isInStock({ stock: undefined })).toBe(true);
    expect(isInStock({})).toBe(true);
  });
});
