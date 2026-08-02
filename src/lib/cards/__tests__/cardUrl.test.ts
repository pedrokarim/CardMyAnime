import { describe, expect, it } from "vitest";
import {
  buildCardPath,
  normalizeSearchParams,
  parseCardSlug,
} from "../cardUrl";

describe("normalizeSearchParams", () => {
  it("laisse une query string normale intacte", () => {
    const params = normalizeSearchParams(
      new URLSearchParams(
        "platform=mal&username=pedrokarim64&type=small&background=1"
      )
    );

    expect(params.get("platform")).toBe("mal");
    expect(params.get("username")).toBe("pedrokarim64");
    expect(params.get("type")).toBe("small");
    expect(params.get("background")).toBe("1");
  });

  it("répare les clés échappées en HTML par les forums (MyAnimeList)", () => {
    const params = normalizeSearchParams(
      new URLSearchParams(
        "platform=mal&amp;username=pedrokarim64&amp;type=small&amp;background=1"
      )
    );

    expect(params.get("username")).toBe("pedrokarim64");
    expect(params.get("type")).toBe("small");
    expect(params.get("background")).toBe("1");
  });

  it("gère le double échappement et les entités numériques", () => {
    const params = normalizeSearchParams(
      new URLSearchParams(
        "platform=mal&amp;amp;username=pedrokarim64&#38;type=small"
      )
    );

    expect(params.get("username")).toBe("pedrokarim64");
    expect(params.get("type")).toBe("small");
  });

  it("donne la priorité à la clé non échappée", () => {
    const params = normalizeSearchParams(
      new URLSearchParams("username=correct&amp;username=echappe")
    );

    expect(params.get("username")).toBe("correct");
  });
});

describe("parseCardSlug", () => {
  it("analyse la forme complète avec extension", () => {
    expect(parseCardSlug(["mal", "pedrokarim64", "small.png"])).toEqual({
      platform: "mal",
      username: "pedrokarim64",
      type: "small",
      useBackground: true,
    });
  });

  it("accepte l'absence d'extension", () => {
    expect(parseCardSlug(["anilist", "PedroKarim64", "neon"])).toEqual({
      platform: "anilist",
      username: "PedroKarim64",
      type: "neon",
      useBackground: true,
    });
  });

  it("détecte le suffixe -nobg", () => {
    expect(parseCardSlug(["mal", "user", "glassmorphism-nobg.png"])).toEqual({
      platform: "mal",
      username: "user",
      type: "glassmorphism",
      useBackground: false,
    });
  });

  it("rejette les formes incomplètes", () => {
    expect(parseCardSlug(["mal", "user"])).toBeNull();
    expect(parseCardSlug(["mal", "user", "small", "extra"])).toBeNull();
    expect(parseCardSlug([])).toBeNull();
    expect(parseCardSlug(undefined)).toBeNull();
  });

  it("rejette un type vide une fois l'extension retirée", () => {
    expect(parseCardSlug(["mal", "user", ".png"])).toBeNull();
  });
});

describe("buildCardPath", () => {
  it("produit une URL sans query string", () => {
    const path = buildCardPath("mal", "pedrokarim64", "small", true);

    expect(path).toBe("/card/mal/pedrokarim64/small.png");
    expect(path).not.toContain("&");
    expect(path).not.toContain("?");
  });

  it("ajoute -nobg quand l'arrière-plan est désactivé", () => {
    expect(buildCardPath("anilist", "user", "medium", false)).toBe(
      "/card/anilist/user/medium-nobg.png"
    );
  });

  it("encode les pseudos à caractères spéciaux", () => {
    expect(buildCardPath("mal", "a b/c", "small")).toBe(
      "/card/mal/a%20b%2Fc/small.png"
    );
  });

  it("fait l'aller-retour avec parseCardSlug", () => {
    const path = buildCardPath("mal", "pedrokarim64", "large", false);
    const slug = path.replace("/card/", "").split("/");

    expect(parseCardSlug(slug)).toEqual({
      platform: "mal",
      username: "pedrokarim64",
      type: "large",
      useBackground: false,
    });
  });
});
