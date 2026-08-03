"use client";

import { BookOpen, ChevronDown, Film, Heart, MessageSquare, Tags } from "lucide-react";
import type { UserData } from "@/lib/types";
import { useTraduction } from "@/lib/i18n/client";

/**
 * {t.carte.detailProfil}, replié par défaut.
 *
 * Derniers animes, derniers mangas, favoris, genres, message personnel :
 * c'est ce qui donnait trois hauteurs de fenêtre à l'écran d'aperçu, avant
 * même d'avoir vu la carte. Or tout est déjà **dans** la carte — c'est
 * précisément ce qu'elle affiche. Rien n'est perdu, rien n'est imposé.
 *
 * `<details>` natif plutôt qu'un état React : le repli, l'accessibilité au
 * clavier et l'annonce de l'état sont déjà là, gratuits et corrects.
 */
export function ProfileDetails({ userData }: { userData: UserData }) {
  const { t } = useTraduction();
  const animes = userData.lastAnimes?.slice(0, 4) ?? [];
  const mangas = userData.lastMangas?.slice(0, 4) ?? [];
  const favorites = [
    ...(userData.favorites?.anime ?? []),
    ...(userData.favorites?.manga ?? []),
  ].slice(0, 4);
  const genres = userData.stats.favoriteGenres?.slice(0, 6) ?? [];

  const hasSomething =
    animes.length > 0 ||
    mangas.length > 0 ||
    favorites.length > 0 ||
    genres.length > 0 ||
    !!userData.personalMessage;

  if (!hasSomething) return null;

  return (
    <details className="group mt-4 overflow-hidden rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm">
      <summary className="flex cursor-pointer list-none items-center gap-2.5 px-5 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/40 [&::-webkit-details-marker]:hidden">
        {t.carte.detailProfil}
        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition-transform duration-300 group-open:rotate-180" />
      </summary>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-6 px-5 pb-5 pt-1">
        {animes.length > 0 && (
          <Column icon={<Film aria-hidden="true" className="h-3.5 w-3.5" />} title={t.carte.derniersAnimesCourt}>
            <ol className="list-inside list-decimal space-y-1 text-[12.5px] text-muted-foreground">
              {animes.map((anime, index) => (
                <li key={index} className="truncate">
                  {anime.title}
                </li>
              ))}
            </ol>
          </Column>
        )}

        {mangas.length > 0 && (
          <Column icon={<BookOpen aria-hidden="true" className="h-3.5 w-3.5" />} title={t.carte.derniersMangasCourt}>
            <ol className="list-inside list-decimal space-y-1 text-[12.5px] text-muted-foreground">
              {mangas.map((manga, index) => (
                <li key={index} className="truncate">
                  {manga.title}
                </li>
              ))}
            </ol>
          </Column>
        )}

        {favorites.length > 0 && (
          <Column icon={<Heart aria-hidden="true" className="h-3.5 w-3.5" />} title={t.carte.favoris}>
            <ol className="list-inside list-decimal space-y-1 text-[12.5px] text-muted-foreground">
              {favorites.map((favorite, index) => (
                <li key={index} className="truncate">
                  {favorite.title}
                </li>
              ))}
            </ol>
          </Column>
        )}

        {genres.length > 0 && (
          <Column icon={<Tags aria-hidden="true" className="h-3.5 w-3.5" />} title={t.carte.genresFavoris}>
            <div className="flex flex-wrap gap-1.5">
              {genres.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] text-primary"
                >
                  {genre}
                </span>
              ))}
            </div>
          </Column>
        )}

        {userData.personalMessage && (
          <Column
            icon={<MessageSquare aria-hidden="true" className="h-3.5 w-3.5" />}
            title={t.carte.messagePersonnel}
          >
            <p className="line-clamp-4 text-[12.5px] text-muted-foreground">
              {userData.personalMessage}
            </p>
          </Column>
        )}
      </div>
    </details>
  );
}

function Column({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}
