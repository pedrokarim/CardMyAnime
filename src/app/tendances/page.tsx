"use client";

import { Flame, Star, Users, BookOpen, LayoutGrid, Rows3 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { useState } from "react";
import { HeroBannerCarousel } from "@/components/tendances/HeroBannerCarousel";
import { TrendCard } from "@/components/tendances/TrendCard";
import { EmptyState } from "@/components/tendances/EmptyState";
import { cardContainerVariants } from "@/components/tendances/animations";

type ViewMode = "grid" | "compact";

export default function TendancesPage() {
  const { data, isLoading, error } = trpc.getTrends.useQuery();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const handleImgError = (key: string) => {
    setImgErrors((prev) => new Set(prev).add(key));
  };

  if (isLoading) {
    return <PageLoading message="Chargement des tendances..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Erreur lors du chargement
          </h3>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const animes = data?.animes || [];
  const mangas = data?.mangas || [];
  const totalUsers = data?.totalUsers || 0;
  const hasContent = animes.length > 0 || mangas.length > 0;

  const hasCarousel = animes.some((a: any) => a.enriched?.bannerImage);

  // Empty state: beautiful backdrop with message
  if (!hasContent) {
    return (
      <div className="min-h-screen bg-background">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner - full bleed, outside container */}
      {animes.length > 0 && <HeroBannerCarousel animes={animes} />}

      {/* Content overlaps the carousel via negative margin */}
      <div className={`container mx-auto px-4 relative z-10 ${hasCarousel ? "-mt-28 sm:-mt-32" : "pt-8"}`}>
        {/* Stats bar + view toggle */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              Tendances
            </h1>
            <p className="text-sm text-muted-foreground">
              Les animés et mangas les plus populaires parmi nos{" "}
              <span className="text-foreground font-medium">
                {totalUsers} profils
              </span>
            </p>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border border-border/50">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Grille</span>
            </button>
            <button
              onClick={() => setViewMode("compact")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === "compact"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Rows3 className="w-4 h-4" />
              <span className="hidden sm:inline">Compact</span>
            </button>
          </div>
        </motion.div>

        {/* Animés tendance */}
        {animes.length > 0 && (
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Animés tendance
                </h2>
                <p className="text-sm text-muted-foreground">
                  Les plus regardés par la communauté
                </p>
              </div>
            </motion.div>

            {viewMode === "grid" ? (
              <motion.div
                variants={cardContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {animes.map((anime: any, index: number) => {
                  const key = `anime-${index}`;
                  if (imgErrors.has(key)) return null;
                  return (
                    <TrendCard
                      key={key}
                      rank={index + 1}
                      title={anime.title}
                      coverUrl={anime.coverUrl}
                      count={anime.viewers}
                      countLabel="viewers"
                      avgScore={anime.avgScore}
                      enriched={anime.enriched}
                      onImgError={() => handleImgError(key)}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {animes.map((anime: any, index: number) => {
                  const key = `anime-compact-${index}`;
                  if (imgErrors.has(key)) return null;
                  return (
                    <CompactCard
                      key={key}
                      rank={index + 1}
                      title={anime.enriched?.title.userPreferred ?? anime.title}
                      coverUrl={anime.enriched?.coverImage?.large ?? anime.coverUrl}
                      count={anime.viewers}
                      countLabel="viewers"
                      avgScore={anime.avgScore}
                      enrichedScore={anime.enriched?.averageScore}
                      delay={0.02 * index}
                      onImgError={() => handleImgError(key)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Mangas tendance */}
        {mangas.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BookOpen className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Mangas tendance
                </h2>
                <p className="text-sm text-muted-foreground">
                  Les plus lus par la communauté
                </p>
              </div>
            </motion.div>

            {viewMode === "grid" ? (
              <motion.div
                variants={cardContainerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {mangas.map((manga: any, index: number) => {
                  const key = `manga-${index}`;
                  if (imgErrors.has(key)) return null;
                  return (
                    <TrendCard
                      key={key}
                      rank={index + 1}
                      title={manga.title}
                      coverUrl={manga.coverUrl}
                      count={manga.readers}
                      countLabel="lecteurs"
                      avgScore={manga.avgScore}
                      enriched={manga.enriched}
                      onImgError={() => handleImgError(key)}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {mangas.map((manga: any, index: number) => {
                  const key = `manga-compact-${index}`;
                  if (imgErrors.has(key)) return null;
                  return (
                    <CompactCard
                      key={key}
                      rank={index + 1}
                      title={manga.enriched?.title.userPreferred ?? manga.title}
                      coverUrl={manga.enriched?.coverImage?.large ?? manga.coverUrl}
                      count={manga.readers}
                      countLabel="lecteurs"
                      avgScore={manga.avgScore}
                      enrichedScore={manga.enriched?.averageScore}
                      delay={0.02 * index}
                      onImgError={() => handleImgError(key)}
                    />
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

// Compact card (cover-only view)
function CompactCard({
  rank,
  title,
  coverUrl,
  count,
  countLabel,
  avgScore,
  enrichedScore,
  delay,
  onImgError,
}: {
  rank: number;
  title: string;
  coverUrl: string;
  count: number;
  countLabel: string;
  avgScore: number | null;
  enrichedScore?: number | null;
  delay: number;
  onImgError: () => void;
}) {
  const score = enrichedScore
    ? Math.round(enrichedScore)
    : avgScore
    ? Math.round(avgScore * 10)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="group"
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={onImgError}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {rank <= 3 && (
          <div className="absolute top-2 left-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                rank === 1
                  ? "bg-amber-500 text-black"
                  : rank === 2
                  ? "bg-gray-300 text-black"
                  : "bg-orange-700 text-white"
              }`}
            >
              #{rank}
            </span>
          </div>
        )}

        {score && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-medium text-white">
              {score}%
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-1">
            {title}
          </h3>
          <div className="flex items-center gap-1 text-white/70">
            {countLabel === "viewers" ? (
              <Users className="w-3 h-3" />
            ) : (
              <BookOpen className="w-3 h-3" />
            )}
            <span className="text-[11px]">
              {count} {countLabel}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
