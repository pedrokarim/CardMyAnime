import { describe, expect, it } from "vitest";
import { decideCacheAction } from "../userDataCache";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const now = new Date("2026-08-02T12:00:00Z");
const at = (offsetMs: number) => new Date(now.getTime() + offsetMs);

describe("decideCacheAction", () => {
  it("sert le cache tant qu'il n'a pas expiré", () => {
    expect(decideCacheAction(at(+2 * HOUR), at(-22 * HOUR), now)).toBe("fresh");
  });

  it("sert le cache et renouvelle derrière juste après l'expiration", () => {
    expect(decideCacheAction(at(-1 * HOUR), at(-25 * HOUR), now)).toBe(
      "stale-revalidate"
    );
  });

  it("tolère une panne de plusieurs jours sans rien casser", () => {
    expect(decideCacheAction(at(-5 * DAY), at(-6 * DAY), now)).toBe(
      "stale-revalidate"
    );
  });

  it("refuse de servir au-delà de la tolérance", () => {
    expect(decideCacheAction(at(-7 * DAY), at(-8 * DAY), now)).toBe("too-old");
  });

  it("aurait coupé pendant la panne Jikan plutôt que de servir juillet", () => {
    // Cas réel : dernière récupération MAL le 2026-07-01, constatée le 08-02.
    const lastFetched = new Date("2026-07-01T14:30:00Z");
    const expiresAt = new Date("2026-07-02T14:30:00Z");

    expect(decideCacheAction(expiresAt, lastFetched, now)).toBe("too-old");
  });

  it("bascule exactement à la limite de tolérance", () => {
    const tolerance = 7 * DAY;

    expect(
      decideCacheAction(at(-1 * HOUR), at(-tolerance), now, tolerance)
    ).toBe("stale-revalidate");

    expect(
      decideCacheAction(at(-1 * HOUR), at(-tolerance - 1), now, tolerance)
    ).toBe("too-old");
  });

  it("ne dépend pas de l'écart entre expiresAt et lastFetched", () => {
    // Une ligne dont l'expiration a été prolongée mais jamais rafraîchie
    // reste jugée sur sa dernière récupération réussie.
    expect(decideCacheAction(at(-1), at(-30 * DAY), now)).toBe("too-old");
  });
});
