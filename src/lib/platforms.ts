import type { Platform } from "@/lib/types";

/** Noms d'affichage des plateformes ; jamais traduits. */
export const PLATFORM_NAMES: Record<Platform, string> = {
  anilist: "AniList",
  mal: "MyAnimeList",
  kitsu: "Kitsu",
  nautiljon: "Nautiljon",
};

/** Page de profil publique d'un membre sur sa plateforme. */
export function platformProfileUrl(platform: Platform, username: string): string {
  const name = encodeURIComponent(username);
  switch (platform) {
    case "anilist":
      return `https://anilist.co/user/${name}`;
    case "mal":
      return `https://myanimelist.net/profile/${name}`;
    case "kitsu":
      return `https://kitsu.app/users/${name}`;
    case "nautiljon":
      return `https://www.nautiljon.com/membre/profil,${name}.html`;
  }
}
