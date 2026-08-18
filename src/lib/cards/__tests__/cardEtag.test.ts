import { describe, expect, it } from "vitest";
import { cardEtag, matchesEtag } from "../cardEtag";

const ETAG = '"abc123"';

const base = {
  platform: "anilist",
  username: "PedroKarim64",
  cardType: "summary",
  background: true,
  lastFetched: new Date("2026-08-18T10:00:00Z"),
};

describe("matchesEtag", () => {
  it("reconnaît une empreinte identique", () => {
    expect(matchesEtag(ETAG, ETAG)).toBe(true);
  });

  it("ignore l'absence d'en-tête", () => {
    expect(matchesEtag(null, ETAG)).toBe(false);
    expect(matchesEtag("", ETAG)).toBe(false);
  });

  it("refuse une empreinte différente", () => {
    expect(matchesEtag('"autre"', ETAG)).toBe(false);
  });

  it("accepte le préfixe faible que posent les intermédiaires", () => {
    expect(matchesEtag(`W/${ETAG}`, ETAG)).toBe(true);
  });

  it("cherche dans toute la liste, pas seulement au premier rang", () => {
    expect(matchesEtag(`"x", W/"y", ${ETAG}`, ETAG)).toBe(true);
  });

  it("tolère les espaces autour des valeurs", () => {
    expect(matchesEtag(`  ${ETAG}  `, ETAG)).toBe(true);
  });

  it("honore le joker", () => {
    expect(matchesEtag("*", ETAG)).toBe(true);
  });

  it("ne confond pas une empreinte avec son préfixe", () => {
    expect(matchesEtag('"abc"', ETAG)).toBe(false);
  });
});

describe("cardEtag", () => {
  it("est stable tant que rien ne change", () => {
    expect(cardEtag(base)).toBe(cardEtag({ ...base }));
  });

  it("change dès que la donnée a été rafraîchie", () => {
    const plusTard = { ...base, lastFetched: new Date("2026-08-18T11:00:00Z") };
    expect(cardEtag(plusTard)).not.toBe(cardEtag(base));
  });

  it("distingue deux formats de carte", () => {
    expect(cardEtag({ ...base, cardType: "small" })).not.toBe(cardEtag(base));
  });

  it("distingue les deux réglages d'arrière-plan", () => {
    expect(cardEtag({ ...base, background: false })).not.toBe(cardEtag(base));
  });

  // Les pseudos sont insensibles à la casse : deux graphies de la même
  // personne doivent partager leur empreinte, sinon chacune redessine.
  it("ignore la casse du pseudo", () => {
    expect(cardEtag({ ...base, username: "pedrokarim64" })).toBe(cardEtag(base));
  });

  it("produit une valeur entre guillemets, comme l'exige la spec HTTP", () => {
    expect(cardEtag(base)).toMatch(/^"[A-Za-z0-9_-]+"$/);
  });
});
