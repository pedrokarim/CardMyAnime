"use client";

import { motion } from "framer-motion";
import { Star, Users, BookOpen, Clock, Tv } from "lucide-react";
import { getGenreColor } from "@/lib/utils/genreColors";
import {
  formatTimeUntilAiring,
  formatSeason,
  formatMediaFormat,
} from "@/lib/utils/timeFormat";
import { cardItemVariants } from "./animations";
import type { EnrichedMediaData } from "@/lib/services/mediaEnrichment";

interface TrendCardProps {
  rank: number;
  title: string;
  coverUrl: string;
  count: number;
  countLabel: string;
  avgScore: number | null;
  enriched: EnrichedMediaData | null;
  onImgError?: () => void;
}

function RankBadge({ rank }: { rank: number }) {
  const colors =
    rank === 1
      ? "bg-amber-500 text-black"
      : rank === 2
      ? "bg-gray-300 text-black"
      : rank === 3
      ? "bg-orange-700 text-white"
      : "bg-black/60 text-white";

  return (
    <span
      className={`absolute top-2 left-2 z-10 text-xs font-bold px-2 py-0.5 rounded-full ${colors}`}
    >
      #{rank}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
      <span className="text-sm font-semibold text-foreground">{score}</span>
    </div>
  );
}

function GenrePills({ genres }: { genres: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {genres.slice(0, 3).map((genre) => {
        const color = getGenreColor(genre);
        return (
          <span
            key={genre}
            className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${color.bg} ${color.text}`}
          >
            {genre}
          </span>
        );
      })}
    </div>
  );
}

export function TrendCard({
  rank,
  title,
  coverUrl,
  count,
  countLabel,
  avgScore,
  enriched,
  onImgError,
}: TrendCardProps) {
  const displayTitle = enriched?.title.userPreferred ?? title;
  const studio = enriched?.studios?.find((s) => s.isAnimationStudio)?.name ?? enriched?.studios?.[0]?.name;
  const format = formatMediaFormat(enriched?.format ?? null);
  const season = formatSeason(enriched?.season ?? null, enriched?.seasonYear ?? null);
  const coverSrc = enriched?.coverImage?.large ?? coverUrl;
  const score = enriched?.averageScore
    ? (enriched.averageScore / 10).toFixed(1)
    : avgScore
    ? avgScore.toFixed(1)
    : null;

  return (
    <motion.div variants={cardItemVariants} className="group">
      <div className="flex flex-col md:flex-row bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300">
        {/* Cover */}
        <div className="relative w-full md:w-32 shrink-0">
          <div className="aspect-[16/9] md:aspect-[3/4] relative overflow-hidden">
            <img
              src={coverSrc}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              onError={onImgError}
            />
            <RankBadge rank={rank} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
          <div>
            {/* Header row: title + score */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm md:text-base font-semibold text-foreground leading-tight line-clamp-1">
                {displayTitle}
              </h3>
              {score && <ScoreBadge score={parseFloat(score)} />}
            </div>

            {/* Studio */}
            {studio && (
              <p className="text-xs text-muted-foreground mb-1.5">{studio}</p>
            )}

            {/* Genres */}
            {enriched?.genres && enriched.genres.length > 0 && (
              <div className="mb-2">
                <GenrePills genres={enriched.genres} />
              </div>
            )}

            {/* Description */}
            {enriched?.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2 hidden md:block">
                {enriched.description}
              </p>
            )}
          </div>

          {/* Bottom meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {format && (
              <span className="flex items-center gap-1">
                <Tv className="w-3 h-3" />
                {format}
              </span>
            )}
            {enriched?.episodes && (
              <span>{enriched.episodes} ep</span>
            )}
            {enriched?.chapters && (
              <span>{enriched.chapters} ch</span>
            )}
            {season && <span>{season}</span>}
            <span className="flex items-center gap-1">
              {countLabel === "viewers" ? (
                <Users className="w-3 h-3" />
              ) : (
                <BookOpen className="w-3 h-3" />
              )}
              {count} {countLabel}
            </span>
            {enriched?.nextAiringEpisode && (
              <span className="flex items-center gap-1 text-green-400">
                <Clock className="w-3 h-3" />
                Ep {enriched.nextAiringEpisode.episode} dans{" "}
                {formatTimeUntilAiring(enriched.nextAiringEpisode.timeUntilAiring)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
