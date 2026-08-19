#!/usr/bin/env node
/**
 * Visuels de campagne pour CardMyAnime.
 *
 * Reprend l esthetique de la page d accueil — colonnes de jaquettes inclinees
 * de -8 degres, voile qui ouvre la gauche pour le texte — et y pose de vraies
 * cartes recuperees en production. Rien n est maquette : les jaquettes sont
 * celles du mur, les cartes sont celles que le site sert.
 *
 * Les images partent dans le vault marketing, pas dans public/ : ce sont des
 * supports de communication, pas des assets du site.
 *
 * Prerequis : les cartes doivent avoir ete telechargees dans le dossier pointe
 * par la constante D ci-dessous.
 *
 * Usage : node scripts/generate-campaign-visuals.js
 */

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const W = 1600, H = 900;
const BLEU = "#0082E6";

/**
 * Le mur de jaquettes de la page d'accueil, refait pour l'image fixe.
 *
 * Meme principe que sur le site : des colonnes verticales, l'ensemble
 * incline de -8 degres, puis un voile qui ouvre la gauche pour que le texte
 * s'y pose. On compose large et on recadre au centre, sinon la rotation
 * laisserait des coins vides.
 */
const COUV = 150, HAUT = 214, ESPACE = 18;

async function murIncline({ graine = 0 } = {}) {
  const fichiers = fs.readdirSync("public/covers").filter((n) => n.endsWith(".webp"));

  // Surface large : apres rotation on recadrera au centre.
  const GW = 2600, GH = 1900;
  const colonnes = Math.ceil(GW / (COUV + ESPACE));
  const parColonne = Math.ceil(GH / (HAUT + ESPACE)) + 1;

  const pieces = [];
  let n = graine;
  for (let c = 0; c < colonnes; c++) {
    // Decalage vertical alterne : sans lui les jaquettes s'alignent en
    // rangees et le mur se lit comme un tableau.
    const decalage = (c % 2 === 0 ? 0 : -70) - ((c * 37) % 60);
    for (let r = -1; r < parColonne; r++) {
      const f = fichiers[n++ % fichiers.length];
      pieces.push({
        input: await sharp(path.join("public/covers", f))
          .resize(COUV, HAUT, { fit: "cover" }).png().toBuffer(),
        left: c * (COUV + ESPACE),
        top: Math.round(r * (HAUT + ESPACE) + decalage) + HAUT + ESPACE,
      });
    }
  }

  const grille = await sharp({
    create: { width: GW, height: GH, channels: 4, background: { r: 12, g: 13, b: 15, alpha: 1 } },
  }).composite(pieces).png().toBuffer();

  const tourne = await sharp(grille)
    .rotate(-8, { background: { r: 12, g: 13, b: 15, alpha: 1 } })
    .png().toBuffer();

  const m = await sharp(tourne).metadata();
  return sharp(tourne)
    .extract({
      left: Math.round((m.width - W) / 2),
      top: Math.round((m.height - H) / 2),
      width: W, height: H,
    })
    .png().toBuffer();
}

/** Voile de lisibilite : dense a gauche, ouvert a droite. */
const voile = (ouverture = 0.34) => Buffer.from(
`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="v" x1="0" y1="0" x2="1" y2="0.18">
      <stop offset="0%"   stop-color="#0c0d0f" stop-opacity="0.99"/>
      <stop offset="32%"  stop-color="#0c0d0f" stop-opacity="0.95"/>
      <stop offset="56%"  stop-color="#0c0d0f" stop-opacity="0.66"/>
      <stop offset="80%"  stop-color="#0c0d0f" stop-opacity="${ouverture}"/>
      <stop offset="100%" stop-color="#0c0d0f" stop-opacity="0.55"/>
    </linearGradient>
    <linearGradient id="h" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#0c0d0f" stop-opacity="0.85"/>
      <stop offset="18%"  stop-color="#0c0d0f" stop-opacity="0"/>
      <stop offset="80%"  stop-color="#0c0d0f" stop-opacity="0"/>
      <stop offset="100%" stop-color="#0c0d0f" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
  <rect width="${W}" height="${H}" fill="url(#h)"/>
</svg>`);



const D = "C:/Users/karim/AppData/Local/Temp/claude/C--Users-karim-Desktop-programming-laboratory-cardmyanime/5199b9b3-84b1-45a2-9ca4-3b2ea4acbb81/scratchpad/cartes-prod";
const V = "../gestion-marketing/brand/assets/cardmyanime";

/** Le signe, en blanc, pour se poser sur le mur. */
const signeBlanc = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="#ffffff">
  <defs><mask id="s"><rect width="64" height="64" fill="#fff"/>
  <rect x="5.4" y="10.4" width="37.2" height="49.2" rx="9.1" fill="#000"/></mask></defs>
  <g mask="url(#s)" opacity="0.62"><rect x="26" y="10" width="30" height="42" rx="6" transform="rotate(14 41 31)"/></g>
  <rect x="8" y="13" width="32" height="44" rx="6.5"/></svg>`;

const texte = ({ chapeau, titre, sous }) => Buffer.from(
`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .c{fill:#9fb4c9;font-family:Poppins,Segoe UI,sans-serif;font-size:21px;font-weight:600;letter-spacing:1.5px}
    .t{fill:#ffffff;font-family:Poppins,Segoe UI,sans-serif;font-size:74px;font-weight:700;letter-spacing:-1.6px}
    .s{fill:#b9c2cf;font-family:Poppins,Segoe UI,sans-serif;font-size:26px}
    .u{fill:#7c8899;font-family:Poppins,Segoe UI,sans-serif;font-size:22px;font-weight:500}
  </style>
  <text class="c" x="96" y="238">${chapeau}</text>
  ${titre.map((l, i) => `<text class="t" x="96" y="${330 + i * 84}">${l}</text>`).join("\n  ")}
  ${sous.map((l, i) => `<text class="s" x="96" y="${330 + titre.length * 84 + 26 + i * 40}">${l}</text>`).join("\n  ")}
  <text class="u" x="96" y="${H - 74}">cma.ascencia.re</text>
</svg>`);

/** Carte posee sur le mur, legerement inclinee et ombree. */
async function carte(nom, largeur, angle) {
  const brute = await sharp(`${D}/${nom}.png`).resize({ width: largeur }).png().toBuffer();
  const m = await sharp(brute).metadata();
  const ombre = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}">
       <rect width="${m.width}" height="${m.height}" rx="10" fill="#000" opacity="0.55"/></svg>`);
  const avecOmbre = await sharp(await sharp(ombre).blur(22).png().toBuffer())
    .composite([{ input: brute }]).png().toBuffer();
  return sharp(avecOmbre).rotate(angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
}

const VISUELS = [
  { f: "01-hero", graine: 0, ouverture: 0.30,
    chapeau: "ANILIST · MYANIMELIST · NAUTILJON",
    titre: ["Your anime profile,", "as one image."],
    sous: ["One username. One card. A direct link you can paste", "anywhere. No account, no sign-up."],
    cartes: [{ nom: "medium", largeur: 560, angle: -5, x: 960, y: 300 }] },

  { f: "02-what-it-does", graine: 11, ouverture: 0.28,
    chapeau: "HOW IT WORKS",
    titre: ["It reads your list.", "It draws the card."],
    sous: ["Episodes, scores, what you're watching right now —", "rendered as a PNG, updated on its own."],
    cartes: [{ nom: "summary", largeur: 500, angle: 4, x: 1000, y: 240 }] },

  { f: "03-paste-anywhere", graine: 23, ouverture: 0.32,
    chapeau: "IT'S JUST AN IMAGE URL",
    titre: ["Paste it anywhere."],
    sous: ["Forum signature, Discord, Twitter bio, GitHub README.", "Anywhere an image goes, your profile goes."],
    cartes: [
      { nom: "small", largeur: 480, angle: -6, x: 980, y: 300 },
      { nom: "small", largeur: 420, angle: 5, x: 1080, y: 520 } ] },

  { f: "04-seven-styles", graine: 37, ouverture: 0.26,
    chapeau: "SEVEN STYLES, ONE LINK",
    titre: ["Pick how it looks."],
    sous: ["From a 400×150 signature strip to a full breakdown", "of everything you've watched."],
    cartes: [
      { nom: "neon", largeur: 470, angle: -7, x: 900, y: 200 },
      { nom: "glassmorphism", largeur: 450, angle: 3, x: 1010, y: 420 },
      { nom: "small", largeur: 380, angle: -3, x: 940, y: 640 } ] },

  { f: "05-updates-itself", graine: 49, ouverture: 0.30,
    chapeau: "SET IT ONCE",
    titre: ["It keeps itself", "up to date."],
    sous: ["Finish a series tonight — the card you pasted last month", "already knows about it."],
    cartes: [{ nom: "large", largeur: 540, angle: -4, x: 970, y: 300 }] },
];

(async () => {
  for (const v of VISUELS) {
    const fond = await murIncline({ graine: v.graine });
    const couches = [{ input: voile(v.ouverture) }];

    for (const c of v.cartes) {
      const buf = await carte(c.nom, c.largeur, c.angle);
      // La rotation agrandit le tampon : sans recalage, une carte posee au
      // jugé sort du cadre par la droite ou par le bas.
      const m = await sharp(buf).metadata();
      const MARGE = 40;
      couches.push({
        input: buf,
        left: Math.max(MARGE, Math.min(c.x, W - m.width - MARGE)),
        top: Math.max(MARGE, Math.min(c.y, H - m.height - MARGE)),
      });
    }

    couches.push({ input: await sharp(Buffer.from(signeBlanc)).resize(52, 52).png().toBuffer(), left: 96, top: 108 });
    couches.push({ input: texte(v) });

    await sharp(fond).composite(couches).png().toFile(`${V}/2026-08-19-campagne-${v.f}.png`);
    console.log("ok  " + v.f);
  }
})();
