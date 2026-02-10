"use client";

import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useQueryState } from "nuqs";
import { useState, useEffect } from "react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { PageLoading } from "@/components/ui/loading";

const ITEMS_PER_PAGE = 20;

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
  const [currentPage, setCurrentPage] = useQueryState("page", {
    defaultValue: "1",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "views24h" | "createdAt">(
    "views"
  );
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const pageNumber = parseInt(currentPage);

  const { data, isLoading, error } = trpc.getTopCards.useQuery({
    page: pageNumber,
    limit: ITEMS_PER_PAGE,
    search: searchTerm.trim() || undefined,
    sortBy,
  });

  const displayUsers = data?.users || [];
  const displayTotalCount = data?.totalCount || 0;
  const displayTotalPages = data?.totalPages || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page.toString());
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

  // Réinitialiser la page quand on change les filtres
  useEffect(() => {
    if (pageNumber > 1) {
      setCurrentPage("1");
    }
  }, [searchTerm, sortBy, setCurrentPage]);

  const cardTypeLabels: Record<string, string> = {
    small: "Petite",
    medium: "Moyenne",
    large: "Grande",
    summary: "Résumé",
    neon: "Néon",
    minimal: "Minimal",
    glassmorphism: "Glass",
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
                ({displayTotalCount} profils)
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Page {pageNumber} sur {displayTotalPages || 1}
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
        </div>

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
                {/* Ligne principale */}
                <div
                  className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleExpand(userKey)}
                >
                  {/* Version Mobile */}
                  <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 sm:hidden">
                    {/* Ligne 1: Rang | Pseudo | Stats */}
                    <span className="text-sm text-muted-foreground w-8 flex-shrink-0 row-start-1 col-start-1 flex items-center">
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
                          <Eye className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {user.totalViews?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {user.totalViews24h?.toLocaleString() || "0"}
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
                          {cardCount} carte{cardCount > 1 ? "s" : ""}
                        </span>
                        <span className="text-xs text-primary">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Version Desktop */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className="text-sm text-muted-foreground w-8 flex-shrink-0">
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
                          {cardCount} carte{cardCount > 1 ? "s" : ""}
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
                          <Eye className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {user.totalViews?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">vues</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {user.totalViews24h?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">24h</p>
                      </div>
                      <span className="text-xs text-primary">
                        {isExpanded ? "▲ Masquer" : "▼ Détails"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Détails dépliés - Liste des types de cartes */}
                {isExpanded && (
                  <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(user.cardTypes || []).map((ct: any, i: number) => (
                        <a
                          key={i}
                          href={`/card?platform=${user.platform}&username=${encodeURIComponent(user.username)}&type=${ct.cardType}`}
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
                              <Eye className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs">
                                {ct.views?.toLocaleString() || "0"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs">
                                {ct.views24h?.toLocaleString() || "0"}
                              </span>
                            </div>
                            <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              Voir →
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
            <p className="text-muted-foreground">Aucune carte générée</p>
          </div>
        )}

        {/* Pagination */}
        {displayTotalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber === 1}
                className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

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
