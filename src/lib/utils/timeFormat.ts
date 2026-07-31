export function formatTimeUntilAiring(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}j ${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Compte à rebours calculé depuis `airingAt` (timestamp Unix absolu) plutôt
 * que depuis le `timeUntilAiring` renvoyé par AniList.
 *
 * `timeUntilAiring` est figé au moment où la fiche a été récupérée : comme les
 * fiches sont désormais conservées durablement, l'afficher tel quel donnerait
 * un décompte faux, et même toujours positif après la diffusion. On recalcule
 * donc à l'affichage. Retourne null quand l'épisode est déjà passé — la fiche
 * n'a alors pas encore été rafraîchie et il n'y a rien d'utile à annoncer.
 */
export function formatAiringCountdown(
  airingAt: number,
  now: number = Date.now()
): string | null {
  const secondsLeft = Math.floor((airingAt * 1000 - now) / 1000);
  if (secondsLeft <= 0) return null;
  return formatTimeUntilAiring(secondsLeft);
}

const seasonLabels: Record<string, string> = {
  WINTER: "Hiver",
  SPRING: "Printemps",
  SUMMER: "Été",
  FALL: "Automne",
};

export function formatSeason(season: string | null, year: number | null): string | null {
  if (!season || !year) return null;
  return `${seasonLabels[season] ?? season} ${year}`;
}

const formatLabels: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Court",
  MOVIE: "Film",
  SPECIAL: "Spécial",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Musique",
  MANGA: "Manga",
  NOVEL: "Roman",
  ONE_SHOT: "One Shot",
};

export function formatMediaFormat(format: string | null): string | null {
  if (!format) return null;
  return formatLabels[format] ?? format;
}
