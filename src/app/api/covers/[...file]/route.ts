import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { Readable } from "stream";

/**
 * Sert les jaquettes du fond de la page d'accueil.
 *
 * Elles ne peuvent pas passer par `public/` : Next fige la liste des fichiers
 * statiques à la compilation, or ces images sont déposées **après** le build
 * par le cron mensuel, dans un volume Docker. Elles reviendraient donc en 404.
 *
 * Elles ne changent qu'une fois par mois et sont nommées d'après l'identifiant
 * AniList : on peut les mettre en cache très longtemps.
 */

const COVERS_DIR = path.join(process.cwd(), "public", "covers");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const { file } = await params;
  const name = file.join("/");

  // Un segment d'URL ne doit jamais permettre de remonter l'arborescence.
  if (!/^[A-Za-z0-9._-]+$/.test(name) || name.includes("..")) {
    return new Response("Nom de fichier invalide", { status: 400 });
  }

  const full = path.join(COVERS_DIR, name);
  if (!full.startsWith(COVERS_DIR) || !existsSync(full)) {
    return new Response("Introuvable", { status: 404 });
  }

  const isManifest = name === "manifest.json";
  const stats = statSync(full);

  return new Response(
    Readable.toWeb(createReadStream(full)) as unknown as ReadableStream,
    {
      headers: {
        "Content-Type": isManifest ? "application/json" : "image/webp",
        "Content-Length": String(stats.size),
        // Le manifeste change chaque mois, les images jamais : une jaquette
        // porte l'identifiant de l'œuvre et son contenu est figé.
        "Cache-Control": isManifest
          ? "public, max-age=3600, stale-while-revalidate=86400"
          : "public, max-age=2592000, immutable",
      },
    }
  );
}
