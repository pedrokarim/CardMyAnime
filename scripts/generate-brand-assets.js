#!/usr/bin/env node
/**
 * Fabrique tous les dérivés du signe CardMyAnime à partir d'une seule source
 * vectorielle.
 *
 * Le logo existait auparavant en deux PNG dessinés à la main, sans source
 * vectorielle : chaque taille était un rééchantillonnage, et à 16 px le
 * personnage devenait une tache. Ici tout descend d'un seul tracé, et le jeu
 * se régénère d'une commande.
 *
 * Le signe change de couleur selon l'endroit, et ce n'est pas une fantaisie :
 *
 *   - **dans l'interface** — bleu sur transparent : la page fournit le fond,
 *     et le même fichier sert en thème clair comme en thème sombre ;
 *   - **en icône d'application** — blanc sur pastille bleue : sur un fond
 *     d'écran chargé, un signe transparent disparaît ;
 *   - **en filigrane de carte** — blanc sur transparent : les cartes ont des
 *     fonds imprévisibles, une pastille pleine s'y poserait comme un timbre.
 *
 * Usage : node scripts/generate-brand-assets.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const RACINE = path.join(__dirname, "..");
const IMAGES = path.join(RACINE, "public", "images");
const APP = path.join(RACINE, "src", "app");

const BLEU = "#0082E6";
const BLANC = "#ffffff";
const GRIS = "#6b7280";

/**
 * Le signe « Duo » : deux cartes, celle du fond basculée et **découpée** à
 * l'emplacement de celle de devant. C'est ce découpage qui fait tenir le signe
 * en monochrome : trois blancs superposés ne feraient qu'un seul blanc, alors
 * qu'un vide reste un vide sur n'importe quel fond.
 */
const signe = (couleur, opaciteFond = 0.62) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="${couleur}">
  <defs>
    <mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
      <rect width="64" height="64" fill="#fff"/>
      <rect x="5.4" y="10.4" width="37.2" height="49.2" rx="9.1" fill="#000"/>
    </mask>
  </defs>
  <g mask="url(#m)" opacity="${opaciteFond}"><rect x="26" y="10" width="30" height="42" rx="6" transform="rotate(14 41 31)"/></g>
  <rect x="8" y="13" width="32" height="44" rx="6.5"/>
</svg>`;

const enRgb = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
  alpha: 1,
});

/**
 * Compose une image carrée.
 *
 * `echelle` est la part du côté occupée par le signe. Pour une icône
 * *maskable*, Android peut rogner jusqu'à un cercle valant 80 % du côté : tout
 * ce qui compte doit tenir dedans, d'où une échelle nettement plus petite.
 * `rayon` reste nul pour ces icônes-là — le système applique son propre masque,
 * et des coins déjà arrondis produiraient un liseré.
 */
async function composer({ taille, echelle, fond, couleur, rayon = 0, opaciteFond }) {
  const s = Math.round(taille * echelle);
  const marque = await sharp(Buffer.from(signe(couleur, opaciteFond)))
    .resize(s, s)
    .png()
    .toBuffer();
  const decalage = Math.round((taille - s) / 2);

  let base;
  if (!fond) {
    base = sharp({
      create: { width: taille, height: taille, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    });
  } else {
    base = sharp({ create: { width: taille, height: taille, channels: 4, background: enRgb(fond) } });
    if (rayon) {
      const r = Math.round(taille * rayon);
      const masque = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}">` +
          `<rect width="${taille}" height="${taille}" rx="${r}" fill="#fff"/></svg>`
      );
      base = sharp(await base.composite([{ input: masque, blend: "dest-in" }]).png().toBuffer());
    }
  }

  return base.composite([{ input: marque, left: decalage, top: decalage }]).png().toBuffer();
}


/**
 * Assemble un .ico a partir de PNG deja rendus.
 *
 * `sharp` ne sait pas ecrire ce format, et le conteneur est trivial : un
 * en-tete, un annuaire, puis les images telles quelles. Depuis Vista un .ico
 * accepte des PNG sans conversion en bitmap, donc il n y a rien a recoder.
 *
 * Le fichier reste necessaire malgre `icon.svg` : les navigateurs anciens et
 * un certain nombre d agregateurs demandent `/favicon.ico` en dur.
 */
function assemblerIco(images) {
  const entetes = Buffer.alloc(6);
  entetes.writeUInt16LE(0, 0); // reserve
  entetes.writeUInt16LE(1, 2); // type : icone
  entetes.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const annuaire = [];

  for (const { taille, buffer } of images) {
    const e = Buffer.alloc(16);
    e.writeUInt8(taille >= 256 ? 0 : taille, 0);
    e.writeUInt8(taille >= 256 ? 0 : taille, 1);
    e.writeUInt8(0, 2);  // palette
    e.writeUInt8(0, 3);  // reserve
    e.writeUInt16LE(1, 4);   // plans
    e.writeUInt16LE(32, 6);  // bits par pixel
    e.writeUInt32LE(buffer.length, 8);
    e.writeUInt32LE(offset, 12);
    annuaire.push(e);
    offset += buffer.length;
  }

  return Buffer.concat([entetes, ...annuaire, ...images.map((i) => i.buffer)]);
}

async function main() {
  const ecrits = [];
  const ecrire = (dossier, nom, buf) => {
    fs.mkdirSync(dossier, { recursive: true });
    fs.writeFileSync(path.join(dossier, nom), buf);
    ecrits.push(path.relative(RACINE, path.join(dossier, nom)));
  };

  // --- Interface : bleu sur transparent, la page pose le fond.
  ecrire(IMAGES, "cma-logo.png", await composer({ taille: 512, echelle: 1, fond: null, couleur: BLEU }));
  fs.writeFileSync(path.join(IMAGES, "cma-logo.svg"), signe("currentColor"));
  ecrits.push("public/images/cma-logo.svg");

  // --- Filigrane des cartes : blanc sur transparent. Rendu large puis réduit
  //     à 24-35 px par le générateur, d'où la marge de résolution.
  ecrire(IMAGES, "cma-logo-watermark.png", await composer({ taille: 256, echelle: 1, fond: null, couleur: BLANC }));

  // Variante sombre : la carte « minimal » est sur fond clair, un signe blanc
  // y devient litteralement invisible. Meme gris que son libelle.
  ecrire(IMAGES, "cma-logo-watermark-dark.png", await composer({ taille: 256, echelle: 1, fond: null, couleur: GRIS }));

  // --- Icônes d'application : blanc sur pastille bleue.
  const ICONES = path.join(RACINE, "public", "icons");
  for (const t of [192, 512]) {
    ecrire(ICONES, `icon-${t}.png`, await composer({ taille: t, echelle: 0.66, fond: BLEU, couleur: BLANC, rayon: 0.22 }));
    ecrire(ICONES, `icon-maskable-${t}.png`, await composer({ taille: t, echelle: 0.56, fond: BLEU, couleur: BLANC }));
  }
  ecrire(RACINE + "/public", "apple-touch-icon.png", await composer({ taille: 180, echelle: 0.62, fond: BLEU, couleur: BLANC }));

  // --- Favicons. Bleu sur transparent plutôt que la pastille : dans un onglet
  //     le fond est déjà celui du navigateur, et une pastille pleine y pèse.
  for (const t of [16, 32, 48]) {
    ecrire(ICONES, `favicon-${t}.png`, await composer({ taille: t, echelle: 1, fond: null, couleur: BLEU }));
  }
  // Le .ico herite, assemble depuis les PNG qu on vient de produire.
  const pourIco = [];
  for (const t of [16, 32, 48]) {
    pourIco.push({ taille: t, buffer: await composer({ taille: t, echelle: 1, fond: null, couleur: BLEU }) });
  }
  fs.writeFileSync(path.join(APP, "favicon.ico"), assemblerIco(pourIco));
  ecrits.push("src/app/favicon.ico");

  // `icon.svg` dans app/ : Next le sert en favicon vectoriel.
  fs.writeFileSync(path.join(APP, "icon.svg"), signe(BLEU));
  ecrits.push("src/app/icon.svg");

  console.log(ecrits.length + " fichiers :");
  for (const f of ecrits) console.log("  " + f);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
