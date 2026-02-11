"use client";

import { motion } from "framer-motion";
import { Star, Users, BookOpen, Clock, Heart } from "lucide-react";
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
  const studio =
    enriched?.studios?.find((s) => s.isAnimationStudio)?.name ??
    enriched?.studios?.[0]?.name;
  const format = formatMediaFormat(enriched?.format ?? null);
  const season = formatSeason(
    enriched?.season ?? null,
    enriched?.seasonYear ?? null
  );
  const coverSrc = enriched?.coverImage?.large ?? coverUrl;
  const scorePercent = enriched?.averageScore ?? (avgScore ? avgScore * 10 : null);

  return (
    <motion.div variants={cardItemVariants} className="group">
      <div className="flex bg-card/60 rounded-xl overflow-hidden border border-border/40 hover:border-primary/30 hover:shadow-xl transition-all duration-300 h-full">
        {/* Cover left - with title/studio overlay like anichart */}
        <div className="relative w-[140px] lg:w-[180px] shrink-0 self-stretch">
          <img
            src={coverSrc}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={onImgError}
          />
          {/* Gradient overlay at bottom for title/studio */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-3 px-3">
            <h3 className="text-[13px] font-bold text-white leading-tight line-clamp-2">
              {displayTitle}
            </h3>
            {studio && (
              <p className="text-[11px] font-medium text-blue-400 mt-0.5 line-clamp-1">
                {studio}
              </p>
            )}
          </div>
        </div>

        {/* Info right */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          {/* Top row: meta + score/rank */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              {/* Left: count + format info */}
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {countLabel === "viewers" ? (
                    <Users className="w-3.5 h-3.5" />
                  ) : (
                    <BookOpen className="w-3.5 h-3.5" />
                  )}
                  <span className="font-medium text-foreground">
                    {count} {countLabel}
                  </span>
                </div>
                {format && (
                  <span>
                    {format}
                    {enriched?.episodes ? ` · ${enriched.episodes} ep` : ""}
                    {enriched?.chapters ? ` · ${enriched.chapters} ch` : ""}
                    {season ? ` · ${season}` : ""}
                  </span>
                )}
              </div>

              {/* Right: score + rank */}
              <div className="flex items-center gap-3 shrink-0">
                {scorePercent && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-green-400 fill-green-400" />
                    <span className="text-xs font-semibold text-green-400">
                      {scorePercent}%
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    #{rank}
                  </span>
                </div>
              </div>
            </div>

            {/* Airing info */}
            {enriched?.nextAiringEpisode && (
              <div className="text-xs text-green-400 mb-2">
                Ep {enriched.nextAiringEpisode.episode} dans{" "}
                {formatTimeUntilAiring(enriched.nextAiringEpisode.timeUntilAiring)}
              </div>
            )}

            {/* Description */}
            {enriched?.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 mb-3">
                {enriched.description}
              </p>
            )}
          </div>

          {/* Bottom: genre pills */}
          {enriched?.genres && enriched.genres.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-auto">
              {enriched.genres.slice(0, 3).map((genre) => {
                const color = getGenreColor(genre);
                return (
                  <span
                    key={genre}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${color.bg} ${color.text}`}
                  >
                    {genre}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
