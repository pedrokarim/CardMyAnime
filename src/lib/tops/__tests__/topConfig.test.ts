import { describe, expect, it } from "vitest";
import {
  buildTopPath,
  buildTopSharePath,
  buildTopSocialImagePath,
  clampTopSize,
  isValidTopSize,
  parseTopSlug,
} from "../topConfig";

describe("parseTopSlug", () => {
  it("lit la forme avec extension", () => {
    expect(parseTopSlug(["anilist", "PedroKarim64", "anime-10.png"])).toEqual({
      platform: "anilist",
      username: "PedroKarim64",
      media: "anime",
      size: 10,
    });
  });

  it("accepte l'absence d'extension", () => {
    expect(parseTopSlug(["mal", "user", "manga-5"])?.size).toBe(5);
  });

  it("refuse les formes inattendues", () => {
    expect(parseTopSlug(["mal", "user"])).toBeNull();
    expect(parseTopSlug(["mal", "user", "anime"])).toBeNull();
    expect(parseTopSlug(["mal", "user", "anime-100.png"])).toBeNull();
    expect(parseTopSlug(["mal", "user", "anime-5.jpg"])).toBeNull();
  });
});

describe("tailles", () => {
  it("borne les tailles entre 3 et 10", () => {
    expect(isValidTopSize(3)).toBe(true);
    expect(isValidTopSize(10)).toBe(true);
    expect(isValidTopSize(2)).toBe(false);
    expect(isValidTopSize(11)).toBe(false);
    expect(isValidTopSize(5.5)).toBe(false);
  });

  it("ramène une saisie libre dans les bornes", () => {
    expect(clampTopSize(50)).toBe(10);
    expect(clampTopSize(0)).toBe(3);
    expect(clampTopSize(6.4)).toBe(6);
    expect(clampTopSize(Number.NaN)).toBe(3);
  });
});

describe("buildTopPath", () => {
  it("encode le pseudo et reste sans query string", () => {
    expect(buildTopPath("anilist", "a b", "anime", 7)).toBe(
      "/top/anilist/a%20b/anime-7.png"
    );
  });

  it("produit une URL que parseTopSlug relit", () => {
    const path = buildTopPath("mal", "User", "manga", 3);
    const slug = path.split("/").slice(2).map(decodeURIComponent);
    expect(parseTopSlug(slug)).toEqual({
      platform: "mal",
      username: "User",
      media: "manga",
      size: 3,
    });
  });
});

describe("chemins de partage", () => {
  it("page sans extension, image sociale en PNG", () => {
    expect(buildTopSharePath("mal", "a b", "manga", 10)).toBe(
      "/share/top/mal/a%20b/manga-10"
    );
    expect(buildTopSocialImagePath("mal", "a b", "manga", 10)).toBe(
      "/og/top/mal/a%20b/manga-10.png"
    );
  });
});
