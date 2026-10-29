import { userDataCache, StaleDataError } from "@/lib/services/userDataCache";
import { ensurePrismaConnection } from "@/lib/prisma";
import { platformDisabledReason } from "@/lib/platformStatus";
import { isPlatform } from "@/lib/cards/cardTypes";
import { cardEtag, matchesEtag } from "@/lib/cards/cardEtag";
import type { Platform, UserData } from "@/lib/types";
import { generateTopImage } from "./topImage";
import {
  TOP_MAX_SIZE,
  TOP_MIN_SIZE,
  isTopMediaType,
  isValidTopSize,
  type TopMediaType,
} from "./topConfig";

export interface TopRequestInput {
  platform: string;
  username: string;
  media: string;
  size: number;
}

export type TopResult =
  | { ok: true; notModified: false; buffer: Buffer; etag: string }
  | { ok: true; notModified: true; etag: string }
  | { ok: false; status: number; error: string; detail?: string };

/** Une ligne de cache n'a de tops que si le fournisseur les a récupérés. */
export function hasTopLists(data: UserData): boolean {
  return Array.isArray(data.topAnimes) && Array.isArray(data.topMangas);
}

export function topEntries(data: UserData, media: TopMediaType) {
  return (media === "anime" ? data.topAnimes : data.topMangas) ?? [];
}

/**
 * Valide la demande, lit le profil en cache et produit le PNG du top.
 *
 * Contrairement aux cartes, aucun enregistrement préalable n'est exigé : un
 * top n'a pas de format à retenir, son URL dit tout. Il se met à jour au
 * même rythme que les cartes, puisqu'il lit le même cache.
 */
export async function resolveTop(
  ifNoneMatch: string | null,
  input: TopRequestInput
): Promise<TopResult> {
  if (!isPlatform(input.platform) || !isTopMediaType(input.media)) {
    return {
      ok: false,
      status: 400,
      error: "URL de top invalide",
      detail: "Format attendu : /top/{plateforme}/{pseudo}/{anime|manga}-{taille}.png",
    };
  }

  if (!isValidTopSize(input.size)) {
    return {
      ok: false,
      status: 400,
      error: "Taille de top invalide",
      detail: `Un top compte de ${TOP_MIN_SIZE} à ${TOP_MAX_SIZE} œuvres.`,
    };
  }

  const platform = input.platform as Platform;
  const media = input.media;

  const disabledReason = platformDisabledReason(platform);
  if (disabledReason) {
    return {
      ok: false,
      status: 503,
      error: "Plateforme indisponible",
      detail: disabledReason,
    };
  }

  try {
    await ensurePrismaConnection();

    const { data, lastFetched } = await userDataCache.getUserDataWithMeta(
      platform,
      input.username,
      { accept: hasTopLists }
    );

    if (!hasTopLists(data)) {
      return {
        ok: false,
        status: 503,
        error: "Top indisponible",
        detail: "La liste n'a pas pu être lue. Réessayez dans quelques minutes.",
      };
    }

    const etag = cardEtag({
      platform,
      username: input.username,
      cardType: `top-${media}-${input.size}`,
      background: true,
      lastFetched,
    });

    if (matchesEtag(ifNoneMatch, etag)) {
      return { ok: true, notModified: true, etag };
    }

    const buffer = await generateTopImage({
      username: data.username || input.username,
      avatarUrl: data.avatarUrl,
      platform,
      media,
      size: input.size,
      entries: topEntries(data, media),
    });

    return { ok: true, notModified: false, buffer, etag };
  } catch (error) {
    console.error("Erreur lors de la génération du top:", error);

    if (error instanceof StaleDataError) {
      return {
        ok: false,
        status: 503,
        error: "Données indisponibles",
        detail: `${error.platform} ne répond plus. Dernière mise à jour réussie il y a ${error.ageInDays} jours.`,
      };
    }

    // Le fournisseur ne distingue pas toujours un pseudo inexistant d'une
    // panne : on nomme les deux causes plutôt que d'en affirmer une.
    return {
      ok: false,
      status: 502,
      error: "Profil indisponible",
      detail: `Profil ${input.username} introuvable sur ${platform}, ou plateforme injoignable.`,
    };
  }
}
