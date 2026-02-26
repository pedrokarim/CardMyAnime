import { describe, it, expect, vi } from "vitest";
import {
  normalizeTitle,
  sanitizeTitle,
  buildSearchVariants,
  searchMediaWithRetry,
} from "../enrich-trends.js";

// ─── normalizeTitle ──────────────────────────────────────────────

describe("normalizeTitle", () => {
  it("met en minuscule et trim", () => {
    expect(normalizeTitle("  Naruto Shippuden  ")).toBe("naruto shippuden");
  });

  it("gère un titre déjà propre", () => {
    expect(normalizeTitle("one piece")).toBe("one piece");
  });
});

// ─── sanitizeTitle ───────────────────────────────────────────────

describe("sanitizeTitle", () => {
  it("retire le contenu entre parenthèses", () => {
    expect(sanitizeTitle("Naruto (TV)")).toBe("Naruto");
  });

  it("retire le contenu entre crochets", () => {
    expect(sanitizeTitle("Naruto [Dub]")).toBe("Naruto");
  });

  it("retire plusieurs blocs parenthèses/crochets", () => {
    expect(sanitizeTitle("Bleach (TV) [Sub]")).toBe("Bleach");
  });

  it("retire les suffixes de saison ordinal", () => {
    expect(sanitizeTitle("Attack on Titan 2nd Season")).toBe(
      "Attack on Titan"
    );
    expect(sanitizeTitle("Mob Psycho 100 3rd Season")).toBe("Mob Psycho 100");
  });

  it("retire Season N", () => {
    expect(sanitizeTitle("Vinland Saga Season 2")).toBe("Vinland Saga");
  });

  it("retire Part N", () => {
    expect(sanitizeTitle("JoJo Part 6")).toBe("JoJo");
  });

  it("retire Cour N", () => {
    expect(sanitizeTitle("86 Eighty-Six Cour 2")).toBe("86 Eighty-Six");
  });

  it("retire les caractères spéciaux (: ! ? ★ etc.)", () => {
    expect(sanitizeTitle("Re:Zero ★ Starting Life")).toBe(
      "Re Zero Starting Life"
    );
  });

  it("normalise les espaces multiples", () => {
    expect(sanitizeTitle("Sword   Art   Online")).toBe("Sword Art Online");
  });

  it("laisse un titre propre intact", () => {
    expect(sanitizeTitle("Death Note")).toBe("Death Note");
  });

  it("gère un cas complexe combiné", () => {
    expect(
      sanitizeTitle(
        "Shingeki no Kyojin: The Final Season Part 3 (TV) [Sub]"
      )
    ).toBe("Shingeki no Kyojin The Final Season");
  });
});

// ─── buildSearchVariants ─────────────────────────────────────────

describe("buildSearchVariants", () => {
  it("retourne 1 variante pour un titre simple déjà propre", () => {
    const variants = buildSearchVariants("Death Note");
    expect(variants).toEqual(["Death Note"]);
  });

  it("retourne 2 variantes quand le sanitize change le titre", () => {
    const variants = buildSearchVariants("Naruto (TV)");
    expect(variants[0]).toBe("Naruto (TV)");
    expect(variants[1]).toBe("Naruto");
    expect(variants.length).toBe(2);
  });

  it("coupe au séparateur : pour générer une variante courte", () => {
    const variants = buildSearchVariants(
      "Shingeki no Kyojin: The Final Season"
    );
    expect(variants).toContain("Shingeki no Kyojin");
  });

  it("retourne max 4 variantes", () => {
    const variants = buildSearchVariants(
      "Super Long Title: With Many Many Extra Words (TV) [Dub]"
    );
    expect(variants.length).toBeLessThanOrEqual(4);
  });

  it("ne génère pas de doublons", () => {
    const variants = buildSearchVariants("One Piece");
    const unique = new Set(variants);
    expect(unique.size).toBe(variants.length);
  });

  it("ne génère pas de variante de moins de 3 caractères", () => {
    const variants = buildSearchVariants("OK");
    expect(variants).toEqual([]);
  });

  it("gère un titre avec tiret comme séparateur", () => {
    const variants = buildSearchVariants("Spy x Family - Season 2");
    expect(variants).toContain("Spy x Family");
  });
});

// ─── searchMediaWithRetry ────────────────────────────────────────

describe("searchMediaWithRetry", () => {
  const fakeLogger = { info: vi.fn(), warn: vi.fn() };
  const fakeResult = { id: 123, title: { romaji: "Test" } };

  it("retourne au 1er essai si searchMedia trouve direct", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { Media: fakeResult } }),
    });

    const { result, attempts } = await searchMediaWithRetry(
      "Death Note",
      "ANIME",
      fakeLogger
    );

    expect(result).toEqual(fakeResult);
    expect(attempts).toBe(1);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    global.fetch = originalFetch;
  });

  it("retry et trouve au 2e essai après sanitization", async () => {
    const originalFetch = global.fetch;
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { Media: null } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { Media: fakeResult } }),
      });
    });

    const { result, attempts, usedVariant } = await searchMediaWithRetry(
      "Naruto (TV)",
      "ANIME",
      fakeLogger
    );

    expect(result).toEqual(fakeResult);
    expect(attempts).toBe(2);
    expect(usedVariant).toBe("Naruto");

    global.fetch = originalFetch;
  }, 10000);

  it("retourne null après avoir épuisé toutes les variantes", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { Media: null } }),
    });

    const { result, attempts } = await searchMediaWithRetry(
      "Some Unknown Title (TV) [Sub]: Extra Words Here More Words",
      "ANIME",
      fakeLogger
    );

    expect(result).toBeNull();
    expect(attempts).toBeGreaterThan(1);

    global.fetch = originalFetch;
  }, 30000);

  it("propage l'erreur RATE_LIMITED", async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
    });

    await expect(
      searchMediaWithRetry("Test", "ANIME", fakeLogger)
    ).rejects.toThrow("RATE_LIMITED");

    global.fetch = originalFetch;
  });
});
