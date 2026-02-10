"use client";

import {
  Trophy,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useQueryState } from "nuqs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { PageLoading } from "@/components/ui/loading";

const ITEMS_PER_PAGE = 20;

function generatePaginationRange(currentPage: number, totalPages: number) {
  const delta = 2; // Nombre de pages à afficher de chaque côté
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
  const [currentPage, setCurrentPage] = useQueryState("page", {
    defaultValue: "1",
  });
  const [selectedCardTypes, setSelectedCardTypes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "views24h" | "createdAt">(
    "views"
  );

  const pageNumber = parseInt(currentPage);

  const { data, isLoading, error } = trpc.getTopCards.useQuery({
    page: pageNumber,
    limit: ITEMS_PER_PAGE,
    cardTypes:
      selectedCardTypes.length > 0 ? (selectedCardTypes as any) : undefined,
    search: searchTerm.trim() || undefined,
    sortBy,
  });

  // Filtrer les doublons côté client pour éviter les problèmes d'affichage
  // Utiliser un Map pour garantir l'unicité basée sur platform-username-cardType
  const displayCards = (() => {
    const seen = new Map<string, any>();
    const cards = data?.cards || [];

    for (const card of cards) {
      const key = `${card.platform}-${card.username}-${card.cardType}`;
      if (!seen.has(key)) {
        seen.set(key, card);
      }
    }

    return Array.from(seen.values());
  })();
  const displayTotalCount = data?.totalCount || 0;
  const displayTotalPages = data?.totalPages || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page.toString());
  };

  const handleCardTypeToggle = (cardType: string) => {
    setSelectedCardTypes((prev) => {
      if (prev.includes(cardType)) {
        return prev.filter((type) => type !== cardType);
      } else {
        return [...prev, cardType];
      }
    });
  };

  const cardTypeOptions = [
    { value: "small", label: "Petite" },
    { value: "medium", label: "Moyenne" },
    { value: "large", label: "Grande" },
    { value: "summary", label: "Résumé" },
    { value: "neon", label: "Néon" },
    { value: "minimal", label: "Minimal" },
    { value: "glassmorphism", label: "Glass" },
  ];

  // Réinitialiser la page quand on change les filtres
  useEffect(() => {
    if (pageNumber > 1) {
      setCurrentPage("1");
    }
  }, [selectedCardTypes, searchTerm, sortBy, setCurrentPage]);

  const cardTypeLabels: Record<string, string> = {
    small: "Petite",
    medium: "Moyenne",
    large: "Grande",
    summary: "Résumé",
    neon: "Néon",
    minimal: "Minimal",
    glassmorphism: "Glass",
  };

  const platformLabels = {
    anilist: "AniList",
    mal: "MyAnimeList",
    nautiljon: "Nautiljon",
  };

  if (isLoading) {
    return <PageLoading message="Chargement du classement..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Erreur lors du chargement
          </h3>
          <p className="text-muted-foreground">{error.message}</p>
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
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Classement{" "}
                {sortBy === "views24h"
                  ? "par vues 24h"
                  : sortBy === "createdAt"
                  ? "par date"
                  : "par vues"}{" "}
                ({displayTotalCount} cartes)
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Page {pageNumber} sur {displayTotalPages}
              </p>
            </div>
          </div>

          {/* Barre de recherche et tri */}
          <div className="flex flex-col gap-4 mb-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher par pseudo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Tri */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm text-muted-foreground">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="views">Vues totales</option>
                <option value="views24h">Vues 24h</option>
                <option value="createdAt">Date de création</option>
              </select>
            </div>
          </div>

          {/* Filtres par type de carte */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground mr-2">
                Filtrer par type :
              </span>
              {cardTypeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleCardTypeToggle(option.value)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedCardTypes.includes(option.value)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {selectedCardTypes.length > 0 && (
              <button
                onClick={() => setSelectedCardTypes([])}
                className="px-3 py-1 text-xs rounded-full border border-border hover:bg-accent transition-colors"
              >
                Tout afficher
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {displayCards.map((card: any, index: number) => {
            const globalIndex = (pageNumber - 1) * ITEMS_PER_PAGE + index;
            return (
              <div
                key={card.id}
                className="p-4 hover:bg-accent/50 rounded-lg transition-colors"
              >
                {/* Version Mobile - Grid layout */}
                <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-1 sm:hidden">
                  {/* Ligne 1 - Mobile: Numero | Nom | Stats */}
                  <span className="text-sm text-muted-foreground w-8 flex-shrink-0 row-start-1 col-start-1">
                    #{globalIndex + 1}
                  </span>
                  <span className="font-medium truncate row-start-1 col-start-2">
                    {card.username}
                  </span>
                  <div className="flex items-center gap-4 row-start-1 col-start-3">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {card.views?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">vues</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {card.views24h?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">24h</p>
                    </div>
                  </div>

                  {/* Ligne 2 - Mobile: (vide) | date | (vide) */}
                  <div className="col-start-2 row-start-2"></div>
                  <p className="text-xs text-muted-foreground col-start-2 row-start-2">
                    {new Date(card.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="col-start-3 row-start-2"></div>

                  {/* Ligne 3 - Mobile: (vide) | platform + type | Voir */}
                  <div className="col-start-2 row-start-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <PlatformIcon platform={card.platform} size={12} />
                        <span className="text-xs text-muted-foreground">
                          {
                            platformLabels[
                              card.platform as keyof typeof platformLabels
                            ]
                          }
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {
                          cardTypeLabels[
                            card.cardType as keyof typeof cardTypeLabels
                          ]
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end col-start-3 row-start-3">
                    <a
                      href={`/card?platform=${
                        card.platform
                      }&username=${encodeURIComponent(card.username)}&type=${
                        card.cardType
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline whitespace-nowrap"
                    >
                      Voir →
                    </a>
                  </div>
                </div>

                {/* Version Desktop - Flex layout */}
                <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-sm text-muted-foreground w-8 flex-shrink-0">
                      #{globalIndex + 1}
                    </span>
                    <span className="font-medium truncate">
                      {card.username}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <PlatformIcon platform={card.platform} size={12} />
                        <span className="text-xs text-muted-foreground">
                          {
                            platformLabels[
                              card.platform as keyof typeof platformLabels
                            ]
                          }
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {
                          cardTypeLabels[
                            card.cardType as keyof typeof cardTypeLabels
                          ]
                        }
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {card.views?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">vues</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {card.views24h?.toLocaleString() || "0"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">24h</p>
                    </div>
                    <a
                      href={`/card?platform=${
                        card.platform
                      }&username=${encodeURIComponent(card.username)}&type=${
                        card.cardType
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline whitespace-nowrap"
                    >
                      Voir →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {displayCards.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucune carte générée</p>
          </div>
        )}

        {/* Pagination */}
        {displayTotalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              {/* Bouton précédent */}
              <button
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber === 1}
                className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Pages */}
              {generatePaginationRange(pageNumber, displayTotalPages).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      page === pageNumber
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              {/* Bouton suivant */}
              <button
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={pageNumber === displayTotalPages}
                className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
