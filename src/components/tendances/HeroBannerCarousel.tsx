"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Star } from "lucide-react";
import { getGenreColor } from "@/lib/utils/genreColors";
import type { EnrichedMediaData } from "@/lib/services/mediaEnrichment";

interface HeroSlide {
  title: string;
  bannerImage: string;
  viewers: number;
  avgScore: number | null;
  enriched: EnrichedMediaData;
}

interface HeroBannerCarouselProps {
  animes: {
    title: string;
    coverUrl: string;
    viewers: number;
    avgScore: number | null;
    enriched: EnrichedMediaData | null;
  }[];
}

export function HeroBannerCarousel({ animes }: HeroBannerCarouselProps) {
  const slides: HeroSlide[] = animes
    .filter((a) => a.enriched?.bannerImage)
    .slice(0, 5)
    .map((a) => ({
      title: a.enriched!.title.userPreferred ?? a.title,
      bannerImage: a.enriched!.bannerImage!,
      viewers: a.viewers,
      avgScore: a.avgScore,
      enriched: a.enriched!,
    }));

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  // Static hero fallback for single slide
  if (slides.length === 1) {
    const slide = slides[0];
    return (
      <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
        <img
          src={slide.bannerImage}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        {/* Netflix-style gradient: strong dark bottom fading to transparent */}
        <div className="absolute inset-0 bg-gradient-to-t from-background from-5% via-background/50 via-35% to-transparent to-70%" />
        <SlideOverlay slide={slide} />
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 60 : -60,
    }),
    center: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -60 : 60,
      transition: { duration: 0.4, ease: "easeIn" as const },
    }),
  };

  return (
    <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={current}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {/* Ken Burns image */}
          <motion.img
            src={slides[current].bannerImage}
            alt={slides[current].title}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.1, x: -10, y: -5 }}
            transition={{ duration: 8, ease: "linear" }}
          />

          {/* Heavy bottom gradient that bleeds into page background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 via-30% to-transparent" />

          {/* Content overlay */}
          <SlideOverlay slide={slides[current]} />
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators - positioned above the overlap zone */}
      <div className="absolute bottom-32 sm:bottom-36 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-white w-6"
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function SlideOverlay({ slide }: { slide: HeroSlide }) {
  const studio = slide.enriched.studios?.find((s) => s.isAnimationStudio)?.name ?? slide.enriched.studios?.[0]?.name;
  const score = slide.enriched.averageScore
    ? (slide.enriched.averageScore / 10).toFixed(1)
    : slide.avgScore
    ? slide.avgScore.toFixed(1)
    : null;

  return (
    <div className="absolute bottom-28 sm:bottom-32 left-0 right-0 px-6 sm:px-8 lg:px-12 z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-3xl"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
          {slide.title}
        </h2>

        {studio && (
          <p className="text-sm text-white/70 mb-2">{studio}</p>
        )}

        {/* Genre pills */}
        {slide.enriched.genres && slide.enriched.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {slide.enriched.genres.slice(0, 4).map((genre) => {
              const color = getGenreColor(genre);
              return (
                <span
                  key={genre}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text} backdrop-blur-sm`}
                >
                  {genre}
                </span>
              );
            })}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-white/80">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {slide.viewers} viewer{slide.viewers > 1 ? "s" : ""}
          </span>
          {score && (
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              {score}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
