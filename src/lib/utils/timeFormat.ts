export function formatTimeUntilAiring(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}j ${hours}h`;
  }
  return `${hours}h ${minutes}m`;
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
