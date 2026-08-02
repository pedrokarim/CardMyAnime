#!/usr/bin/env node

/**
 * Génère le fond animé de la page d'accueil.
 *
 * Source : AniList. On mélange deux classements pour que le mur ne soit ni
 * figé dans les classiques ni réduit à la saison en cours :
 *   - TRENDING_DESC   : ce qui est regardé en ce moment
 *   - POPULARITY_DESC : le top de tous les temps
 *
 * Les jaquettes sont converties en WebP et déposées dans public/covers/,
 * accompagnées d'un manifeste JSON lu par le composant au runtime.
 *
 * Pourquoi un manifeste et non un fichier TypeScript généré : ce script tourne
 * en production via le cron mensuel. Un module importé à la compilation serait
 * figé sur la sélection du jour du build, et le cron n'y changerait rien.
 *
 * Pourquoi auto-héberger plutôt que pointer les CDN : mesuré le 2026-08-02, une
 * jaquette MyAnimeList en JPEG pèse 57 Ko contre ~13 Ko en WebP 200 px. Les
 * fichiers sont servis depuis notre domaine, sur la connexion déjà ouverte, et
 * l'accueil ne dépend d'aucun tiers.
 *
 * Usage :
 *   node scripts/generate-cover-wall.js
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ANILIST = "https://graphql.anilist.co";
const COLUMNS = 8;
const PER_COLUMN = 7; // 56 : une colonne doit couvrir la hauteur visible
const TARGET_WIDTH = 200; // affichage 120 px, ~1,6x : suffisant pour un fond
const QUALITY = 72;

const OUT_DIR = path.join(process.cwd(), "public", "covers");
const MANIFEST = path.join(OUT_DIR, "manifest.json");

const QUERY = `
  query ($sort: [MediaSort], $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(type: ANIME, sort: $sort, isAdult: false) {
        id
        title { romaji }
        coverImage { extraLarge large }
      }
    }
  }
`;

async function fetchRanking(sort, perPage) {
  const response = await fetch(ANILIST, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { sort: [sort], perPage } }),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    throw new Error(`AniList ${sort} : HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`AniList ${sort} : ${payload.errors[0].message}`);
  }

  return (payload.data?.Page?.media || [])
    .map((media) => ({
      id: media.id,
      title: media.title?.romaji || String(media.id),
      source: media.coverImage?.extraLarge || media.coverImage?.large || "",
    }))
    .filter((entry) => entry.source);
}

async function convert(entry) {
  const response = await fetch(entry.source, {
    headers: { "User-Agent": "CardMyAnime/1.0 (+https://cma.ascencia.re)" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const input = Buffer.from(new Uint8Array(await response.arrayBuffer()));
  const output = await sharp(input)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();

  const file = `${entry.id}.webp`;
  fs.writeFileSync(path.join(OUT_DIR, file), output);
  return { file, bytes: output.length };
}

async function main() {
  const needed = COLUMNS * PER_COLUMN;

  const [trending, allTime] = await Promise.all([
    fetchRanking("TRENDING_DESC", Math.ceil(needed / 2) + 10),
    fetchRanking("POPULARITY_DESC", Math.ceil(needed / 2) + 10),
  ]);

  console.log(
    `AniList : ${trending.length} en tendance, ${allTime.length} au top de tous les temps`
  );

  // Entrelacé, puis dédoublonné : une série peut figurer dans les deux
  // classements, et on ne veut pas la voir deux fois sur le mur.
  const seen = new Set();
  const mixed = [];
  for (let i = 0; i < Math.max(trending.length, allTime.length); i++) {
    for (const entry of [trending[i], allTime[i]]) {
      if (entry && !seen.has(entry.id)) {
        seen.add(entry.id);
        mixed.push(entry);
      }
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const converted = [];
  let totalBytes = 0;

  for (const entry of mixed) {
    if (converted.length >= needed) break;
    try {
      const result = await convert(entry);
      converted.push(result.file);
      totalBytes += result.bytes;
    } catch (error) {
      console.warn(`  ignorée — ${entry.title} : ${error.message}`);
    }
  }

  if (converted.length < needed) {
    console.warn(`Attention : ${converted.length}/${needed} jaquettes obtenues.`);
  }

  const columns = Array.from({ length: COLUMNS }, () => []);
  converted.forEach((file, i) => columns[i % COLUMNS].push(file));

  // Écriture atomique : le manifeste est lu par la page pendant que le cron
  // tourne. Un remplacement en place éviterait de servir un fichier tronqué.
  const tmp = `${MANIFEST}.tmp`;
  fs.writeFileSync(
    tmp,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), columns },
      null,
      1
    )
  );
  fs.renameSync(tmp, MANIFEST);

  // Les jaquettes des sélections précédentes ne servent plus à rien.
  const keep = new Set([...converted, "manifest.json"]);
  let removed = 0;
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (!keep.has(file)) {
      fs.rmSync(path.join(OUT_DIR, file), { force: true });
      removed++;
    }
  }

  const kb = (n) => `${Math.round(n / 1024)} Ko`;
  console.log(
    `${converted.length} jaquettes → public/covers/ (${kb(totalBytes)}, ` +
      `${kb(totalBytes / converted.length)} en moyenne)` +
      (removed ? `, ${removed} ancienne(s) supprimée(s)` : "")
  );
}

main().catch((error) => {
  console.error("Génération impossible :", error.message);
  process.exit(1);
});
