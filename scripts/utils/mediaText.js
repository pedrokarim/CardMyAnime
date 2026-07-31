#!/usr/bin/env node

/**
 * Nettoyage des descriptions AniList.
 *
 * L'API est interrogée avec `description(asHtml: false)`, mais ça ne retire
 * que le formatage ajouté par AniList : le HTML que les contributeurs ont
 * saisi à la main dans le champ reste tel quel. En pratique on reçoit des
 * `<br>`, `<i>`, `<b>`, et des entités HTML, qui s'affichaient littéralement
 * sur les cartes de tendances.
 *
 * Le nettoyage doit précéder la troncature : tronquer d'abord ferait compter
 * les balises dans la limite de caractères et pourrait couper au milieu de
 * l'une d'elles.
 */

const ENTITES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#039;": "'",
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/** Retire le balisage HTML et décode les entités courantes. */
function stripHtml(texte) {
  if (!texte) return null;

  return (
    texte
      // Les sauts de ligne deviennent des espaces : les descriptions sont
      // affichées en un seul bloc tronqué.
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<[^>]*>/g, "")
      .replace(
        /&(amp|lt|gt|quot|#0?39|apos|nbsp);/gi,
        (m) => ENTITES[m.toLowerCase()] ?? ENTITES[m] ?? m
      )
      // Entités numériques restantes.
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Nettoie puis tronque une description sur une limite de caractères, sans
 * couper un mot en deux.
 *
 * @param {string|null|undefined} desc
 * @param {number} maxLen
 * @returns {string|null}
 */
function cleanDescription(desc, maxLen = 200) {
  const propre = stripHtml(desc);
  if (!propre) return null;
  if (propre.length <= maxLen) return propre;

  // `…` et non `...` : un seul caractère, et c'est la forme typographique
  // correcte.
  return propre.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

module.exports = { stripHtml, cleanDescription };
