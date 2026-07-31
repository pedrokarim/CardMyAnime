import { describe, it, expect } from "vitest";
import { stripHtml, cleanDescription } from "../utils/mediaText.js";

// ─── stripHtml ───────────────────────────────────────────────────

describe("stripHtml", () => {
  it("retire les balises inline laissées par AniList", () => {
    // Cas réel relevé en base de production.
    expect(
      stripHtml("The second season of <i>Katainaka no Ossan, Kensei ni Naru</i>.")
    ).toBe("The second season of Katainaka no Ossan, Kensei ni Naru.");
  });

  it("transforme les <br> en espaces plutôt que de coller les mots", () => {
    expect(
      stripHtml("From the author of Double Arts.<br><br>Ichijou Raku is an honor student.")
    ).toBe("From the author of Double Arts. Ichijou Raku is an honor student.");
  });

  it("gère <br/> et <br /> comme <br>", () => {
    expect(stripHtml("a<br/>b<br />c")).toBe("a b c");
  });

  it("décode les entités HTML courantes", () => {
    expect(stripHtml("Tom &amp; Jerry &quot;best&quot; &#039;friends&#039;")).toBe(
      `Tom & Jerry "best" 'friends'`
    );
  });

  it("décode les entités numériques", () => {
    expect(stripHtml("caf&#233;")).toBe("café");
  });

  it("normalise les espaces multiples", () => {
    expect(stripHtml("trop    d'espaces\n\net des sauts")).toBe(
      "trop d'espaces et des sauts"
    );
  });

  it("retourne null sur une entrée vide", () => {
    expect(stripHtml(null)).toBeNull();
    expect(stripHtml("")).toBeNull();
    expect(stripHtml(undefined)).toBeNull();
  });
});

// ─── cleanDescription ────────────────────────────────────────────

describe("cleanDescription", () => {
  it("laisse intacte une description courte", () => {
    expect(cleanDescription("Une description courte.")).toBe("Une description courte.");
  });

  it("nettoie AVANT de tronquer", () => {
    // Brut : 53 caractères (balises comprises). Nettoyé : 46.
    // Avec une limite de 50, tronquer d'abord couperait le texte ; nettoyer
    // d'abord le laisse entier. Le résultat distingue donc les deux ordres.
    const avecBalises = "<i>" + "a".repeat(40) + "</i> court";
    expect(avecBalises.length).toBe(53);

    const resultat = cleanDescription(avecBalises, 50);
    expect(resultat).not.toContain("<");
    expect(resultat).toBe("a".repeat(40) + " court");
    expect(resultat).not.toContain("…");
  });

  it("ne coupe jamais au milieu d'une balise", () => {
    const texte = "Un texte assez long pour être tronqué <i>avec une balise ici</i> et la suite";
    expect(cleanDescription(texte, 50)).not.toMatch(/<|>/);
  });

  it("termine par … et non ...", () => {
    const long = "mot ".repeat(100);
    const resultat = cleanDescription(long, 50);
    expect(resultat.endsWith("…")).toBe(true);
    expect(resultat).not.toContain("...");
  });

  it("ne coupe pas un mot en deux", () => {
    const resultat = cleanDescription("abcde fghij klmno pqrst", 12);
    // 12 caractères tomberaient au milieu de "klmno" -> on recule au mot entier.
    expect(resultat).toBe("abcde fghij…");
  });

  it("respecte la limite de caractères", () => {
    const long = "x".repeat(500);
    const resultat = cleanDescription(long, 200);
    expect(resultat.length).toBeLessThanOrEqual(201); // 200 + le …
  });

  it("retourne null si la description est vide après nettoyage", () => {
    expect(cleanDescription("<br><br>")).toBeNull();
    expect(cleanDescription(null)).toBeNull();
  });
});
