"use client";

import { Flame, Star, Users, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import { useState } from "react";

export default function TendancesPage() {
  const { data, isLoading, error } = trpc.getTrends.useQuery();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-500 text-sm font-medium mb-4"
          >
            <Flame className="w-4 h-4" />
            Tendances
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
          >
            Ce que la communauté regarde
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-lg mx-auto"
          >
            Les animés et mangas les plus populaires parmi nos{" "}
            <span className="text-foreground font-medium">
              {totalUsers} profils
            </span>
          </motion.p>
        </div>

        {!hasContent && (
          <div className="text-center py-20">
            <Flame className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Pas encore de tendances
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Les tendances apparaîtront une fois que des utilisateurs auront
              généré des cartes.
            </p>
          </div>
        )}

        {/* Animés tendance */}
        {animes.length > 0 && (
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {animes.map((anime: any, index: number) => {
                const key = `anime-${index}`;
                if (imgErrors.has(key)) return null;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.02 * index }}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300">
                      {/* Image de couverture */}
                      <img
                        src={anime.coverUrl}
                        alt={anime.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={() => handleImgError(key)}
                      />

                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Badge rang */}
                      {index < 3 && (
                        <div className="absolute top-2 left-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              index === 0
                                ? "bg-amber-500 text-black"
                                : index === 1
                                ? "bg-gray-300 text-black"
                                : "bg-orange-700 text-white"
                            }`}
                          >
                            #{index + 1}
                          </span>
                        </div>
                      )}

                      {/* Score */}
                      {anime.avgScore && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-medium text-white">
                            {anime.avgScore}
                          </span>
                        </div>
                      )}

                      {/* Infos en bas */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-1">
                          {anime.title}
                        </h3>
                        <div className="flex items-center gap-1 text-white/70">
                          <Users className="w-3 h-3" />
                          <span className="text-[11px]">
                            {anime.viewers} viewer
                            {anime.viewers > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Mangas tendance */}
        {mangas.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {mangas.map((manga: any, index: number) => {
                const key = `manga-${index}`;
                if (imgErrors.has(key)) return null;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.02 * index }}
                    className="group"
                  >
                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted border border-border/50 shadow-sm group-hover:shadow-lg group-hover:border-primary/30 transition-all duration-300">
                      <img
                        src={manga.coverUrl}
                        alt={manga.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={() => handleImgError(key)}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {index < 3 && (
                        <div className="absolute top-2 left-2">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              index === 0
                                ? "bg-amber-500 text-black"
                                : index === 1
                                ? "bg-gray-300 text-black"
                                : "bg-orange-700 text-white"
                            }`}
                          >
                            #{index + 1}
                          </span>
                        </div>
                      )}

                      {manga.avgScore && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-[11px] font-medium text-white">
                            {manga.avgScore}
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-1">
                          {manga.title}
                        </h3>
                        <div className="flex items-center gap-1 text-white/70">
                          <BookOpen className="w-3 h-3" />
                          <span className="text-[11px]">
                            {manga.readers} lecteur
                            {manga.readers > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
