"use client";

import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";
import { keepPreviousData } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc/client";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { useState } from "react";
import Link from "next/link";
import { PlatformIcon } from "@/components/ui/platform-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageLoading } from "@/components/ui/loading";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { buildCardPath } from "@/lib/cards/cardUrl";
import { useTraduction } from "@/lib/i18n/client";

const ITEMS_PER_PAGE = 20;

const SORT_KEYS = ["views", "views24h", "createdAt"] as const;
type SortKey = (typeof SORT_KEYS)[number];


/**
 * Flèche de pagination. En bout de liste il n'y a nulle part où aller : on
 * rend un élément inerte plutôt qu'un lien désactivé, qui reste cliquable.
 */
function PaginationLink({
  href,
  enabled,
  label,
  children,
}: {
  href: string;
  enabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (!enabled) {
    return (
      <span
        aria-hidden="true"
        className="p-2 rounded-lg border border-border opacity-50 cursor-not-allowed"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="p-2 rounded-lg border border-border hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </Link>
  );
}

function generatePaginationRange(currentPage: number, totalPages: number) {
  const delta = 2;
  const range = [];

  for (
    let i = Math.max(1, currentPage - delta);
    i <= Math.min(totalPages, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  return range;
}

export default function RankingPage() {
  const { t, langue } = useTraduction();
  const numberFormatter = new Intl.NumberFormat(langue);

  // Recherche et tri vivent dans l'URL au même titre que la page : un
  // classement filtré doit pouvoir se partager par lien et survivre au
  // rechargement. `history: "replace"` évite d'empiler une entrée d'historique
  // par frappe au clavier.
  const [currentPage, setCurrentPage] = useQueryState("page", {
    defaultValue: "1",
  });
  const [searchTerm, setSearchTerm] = useQueryState("q", {
    defaultValue: "",
    history: "replace",
  });
  const [sortBy, setSortBy] = useQueryState(
    "sort",
    parseAsStringLiteral(SORT_KEYS).withDefault("views").withOptions({
      history: "replace",
    })
  );
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // `?page=abc` ne doit pas produire une requête sur la page NaN.
  const parsedPage = parseInt(currentPage, 10);
  const pageNumber = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  // Sans ce debounce, chaque frappe declenche une requete tRPC (donc un appel
  // base) : on n'interroge le serveur qu'une fois la saisie stabilisee.
  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 350);

  // `keepPreviousData` est le vrai correctif du debounce : sans lui, chaque
  // nouveau terme produit une clé de requête inédite, `isLoading` repasse à
  // vrai, la page bascule sur l'écran de chargement et le champ de recherche
  // est démonté – donc vidé de son focus – toutes les 350 ms. On affiche les
  // résultats précédents pendant que les nouveaux arrivent.
  const { data, isLoading, isFetching, error } = trpc.getTopCards.useQuery(
    {
      page: pageNumber,
      limit: ITEMS_PER_PAGE,
      search: debouncedSearch || undefined,
      sortBy,
    },
    { placeholderData: keepPreviousData }
  );

  const displayUsers = data?.users || [];
  const displayTotalCount = data?.totalCount || 0;
  const displayTotalPages = data?.totalPages || 0;

  /**
   * Lien vers une page du classement, filtres courants conservés. Un vrai
   * href, pas un onClick : Ctrl+clic, clic milieu et « ouvrir dans un nouvel
   * onglet » fonctionnent, et l'état est déjà dans l'URL de toute façon.
   */
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (searchTerm) params.set("q", searchTerm);
    if (sortBy !== "views") params.set("sort", sortBy);
    return `?${params.toString()}`;
  };

  const toggleExpand = (key: string) => {
    setExpandedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // La requête reste debouncée (350 ms) ; seul le retour à la page 1 quitte
  // l'effet. Un effet se déclenche aussi au montage, et ramenait un lien
  // partagé « page 3, filtré » sur la page 1 avant la moindre frappe.
  const handleSearchChange = (value: string) => {
    setSearchTerm(value || null);
    if (pageNumber > 1) setCurrentPage("1");
  };

  const handleSortChange = (value: SortKey) => {
    setSortBy(value);
    if (pageNumber > 1) setCurrentPage("1");
  };

  const cardTypeLabels: Record<string, string> = {
    small: t.formats.small,
    medium: t.formats.medium,
    large: t.formats.large,
    summary: t.formats.summary,
    neon: t.formats.neon,
    minimal: t.formats.minimal,
    glassmorphism: t.formats.glassmorphism,
  };

  const cardTypeColors: Record<string, string> = {
    small: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    medium: "bg-green-500/15 text-green-400 border-green-500/30",
    large: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    summary: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    neon: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    minimal: "bg-stone-500/15 text-stone-400 border-stone-500/30",
    glassmorphism: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  };

  const platformLabels: Record<string, string> = {
    anilist: "AniList",
    mal: "MyAnimeList",
    nautiljon: "Nautiljon",
  };

  // Uniquement au tout premier chargement. Ensuite il y a toujours quelque
  // chose à afficher, et remplacer la page entière ferait disparaître le champ
  // de recherche sous les doigts de l'utilisateur.
  if (isLoading && !data) {
    return <PageLoading message={t.classement.chargement} />;
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div aria-hidden="true" className="text-6xl mb-4">❌</div>
          <h1 className="text-xl font-semibold text-foreground mb-2 text-balance">
            {t.classement.erreurTitre}
          </h1>
          <p className="text-muted-foreground text-pretty mb-4">
            {t.classement.erreurTexte}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {t.commun.detailTechnique(error.message)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 text-balance">
                {sortBy === "views24h"
                  ? t.classement.titreParVues24h
                  : sortBy === "createdAt"
                  ? t.classement.titreParDate
                  : t.classement.titreParVues}{" "}
                <span className="tabular-nums">
                  {t.classement.nombreProfils(
                    numberFormatter.format(displayTotalCount)
                  )}
                </span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base tabular-nums">
                {t.classement.pageSur(pageNumber, displayTotalPages || 1)}
              </p>
            </div>
          </div>

          {/* Barre de recherche et tri */}
          <div className="flex flex-col gap-4 mb-4">
            {/* Recherche */}
            <div className="relative">
              <label htmlFor="search-username" className="sr-only">
                {t.classement.rechercherLabel}
              </label>
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              />
              <input
                id="search-username"
                name="q"
                type="search"
                // Un pseudo n'est pas un mot : ni correction, ni majuscule
                // automatique, ni suggestion du gestionnaire de mots de passe.
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={t.classement.rechercherPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
              />
              {/* La recherche ne coupe plus la page : ce témoin est la seule
                  chose qui bouge pendant qu'elle tourne. */}
              {isFetching && (
                <Loader2
                  aria-hidden="true"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground"
                />
              )}
            </div>

            {/* Tri */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-sm text-muted-foreground"
              >
                {t.classement.trierPar}
              </label>
              <Select
                value={sortBy}
                onValueChange={(value) => handleSortChange(value as SortKey)}
              >
                {/* Le déclencheur est un <button>, donc bien un élément
                    étiquetable : le htmlFor du label ci-dessus reste valide. */}
                <SelectTrigger id="sort-select" className="w-full sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">{t.classement.triVues}</SelectItem>
                  <SelectItem value="views24h">
                    {t.classement.triVues24h}
                  </SelectItem>
                  <SelectItem value="createdAt">
                    {t.classement.triDate}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {error && (
          <p role="status" className="mb-4 text-sm text-destructive">
            {t.classement.erreurTexte}
          </p>
        )}

        <div className="space-y-2">
          {displayUsers.map((user: any, index: number) => {
            const globalIndex = (pageNumber - 1) * ITEMS_PER_PAGE + index;
            const userKey = `${user.platform}-${user.username}`;
            const isExpanded = expandedUsers.has(userKey);
            const cardCount = user.cardTypes?.length || 0;

            return (
              <div
                key={userKey}
                className="rounded-lg border border-border/50 overflow-hidden transition-colors hover:border-border"
              >
                {/* Ligne principale : un <button> et non un <div onClick>,
                    sinon la ligne est inatteignable au clavier et son état
                    déplié n'est annoncé nulle part. */}
                <button
                  type="button"
                  onClick={() => toggleExpand(userKey)}
                  aria-expanded={isExpanded}
                  aria-controls={`details-${userKey}`}
                  className="w-full text-left p-4 cursor-pointer hover:bg-accent/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                >
                  {/* Version Mobile */}
                  <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 sm:hidden">
                    {/* Ligne 1: Rang | Pseudo | Stats */}
                    <span className="text-sm text-muted-foreground w-8 flex-shrink-0 row-start-1 col-start-1 flex items-center tabular-nums">
                      #{globalIndex + 1}
                    </span>
                    <div className="row-start-1 col-start-2 min-w-0">
                      <span className="font-medium truncate block">
                        {user.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 row-start-1 col-start-3">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Eye aria-hidden="true" className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium tabular-nums">
                            {numberFormatter.format(user.totalViews ?? 0)}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <TrendingUp aria-hidden="true" className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium tabular-nums">
                            {numberFormatter.format(user.totalViews24h ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ligne 2: Plateforme + nombre de cartes */}
                    <div className="col-start-2 row-start-2 col-span-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <PlatformIcon platform={user.platform} size={12} />
                          <span className="text-xs text-muted-foreground">
                            {platformLabels[user.platform] || user.platform}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {cardCount} {t.classement.cartes(cardCount)}
                        </span>
                        <span aria-hidden="true" className="text-xs text-primary">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Version Desktop */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground w-8 flex-shrink-0 tabular-nums">
                        #{globalIndex + 1}
                      </span>
                      <span className="font-medium truncate">
                        {user.username}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <PlatformIcon platform={user.platform} size={14} />
                        <span className="text-xs text-muted-foreground">
                          {platformLabels[user.platform] || user.platform}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                          {cardCount} {t.classement.cartes(cardCount)}
                        </span>
                      </div>
                      {/* Aperçu des types de cartes */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {(user.cardTypes || []).slice(0, 4).map((ct: any, i: number) => (
                          <span
                            key={i}
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${
                              cardTypeColors[ct.cardType] || "bg-muted text-muted-foreground"
                            }`}
                          >
                            {cardTypeLabels[ct.cardType] || ct.cardType}
                          </span>
                        ))}
                        {cardCount > 4 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{cardCount - 4}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Eye aria-hidden="true" className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium tabular-nums">
                            {numberFormatter.format(user.totalViews ?? 0)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.classement.vues}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <TrendingUp aria-hidden="true" className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium tabular-nums">
                            {numberFormatter.format(user.totalViews24h ?? 0)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.classement.vues24h}</p>
                      </div>
                      <span aria-hidden="true" className="text-xs text-primary">
                        {isExpanded ? t.classement.masquerDetails : t.classement.details}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Détails dépliés - Liste des types de cartes */}
                {isExpanded && (
                  <div
                    id={`details-${userKey}`}
                    className="border-t border-border/50 bg-muted/20 px-4 py-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(user.cardTypes || []).map((ct: any, i: number) => (
                        <a
                          key={i}
                          href={buildCardPath(
                            user.platform,
                            user.username,
                            ct.cardType
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/50 hover:border-primary/30 transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`text-xs px-2 py-0.5 rounded border ${
                                cardTypeColors[ct.cardType] || "bg-muted text-muted-foreground"
                              }`}
                            >
                              {cardTypeLabels[ct.cardType] || ct.cardType}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center gap-1">
                              <Eye aria-hidden="true" className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs tabular-nums">
                                {numberFormatter.format(ct.views ?? 0)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp aria-hidden="true" className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs tabular-nums">
                                {numberFormatter.format(ct.views24h ?? 0)}
                              </span>
                            </div>
                            <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              {t.classement.voir}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {displayUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-pretty">
              {searchTerm
                ? t.classement.aucunResultat(searchTerm)
                : t.classement.aucuneCarte}
            </p>
          </div>
        )}

        {/* Pagination */}
        {displayTotalPages > 1 && (
          <nav aria-label={t.classement.pagination} className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <PaginationLink
                href={pageHref(pageNumber - 1)}
                enabled={pageNumber > 1}
                label={t.classement.pagePrecedente}
              >
                <ChevronLeft aria-hidden="true" className="w-5 h-5" />
              </PaginationLink>

              {generatePaginationRange(pageNumber, displayTotalPages).map(
                (page) => (
                  <Link
                    key={page}
                    href={pageHref(page)}
                    aria-label={t.classement.numeroPage(page)}
                    aria-current={page === pageNumber ? "page" : undefined}
                    className={`px-3 py-2 rounded-lg border tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      page === pageNumber
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {page}
                  </Link>
                )
              )}

              <PaginationLink
                href={pageHref(pageNumber + 1)}
                enabled={pageNumber < displayTotalPages}
                label={t.classement.pageSuivante}
              >
                <ChevronRight aria-hidden="true" className="w-5 h-5" />
              </PaginationLink>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
