"use client";

import {
  TrendingUp,
  Eye,
  ChevronRight,
  Flame,
  Zap,
  Crown,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { PageLoading } from "@/components/ui/loading";
import { motion, AnimatePresence } from "framer-motion";

const periods = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
] as const;

const categories = [
  {
    value: "trending" as const,
    label: "Top Tendance",
    icon: Flame,
    color: "text-orange-500",
    description: "Les profils avec la plus forte croissance",
  },
  {
    value: "rising" as const,
    label: "En hausse",
    icon: Zap,
    color: "text-amber-500",
    description: "Les nouveaux profils qui montent",
  },
  {
    value: "mostViewed" as const,
    label: "Plus vus",
    icon: Crown,
    color: "text-blue-500",
    description: "Les profils les plus populaires",
  },
];

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

export default function TendancesPage() {
  const [period, setPeriod] = useQueryState("period", {
    defaultValue: "7d",
  });
  const [category, setCategory] = useQueryState("category", {
    defaultValue: "trending",
  });
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = trpc.getTrends.useQuery({
    period: period as "24h" | "7d" | "30d",
    limit: 20,
    category: category as "trending" | "rising" | "mostViewed",
  });

  const trends = data?.trends || [];
  const activeCategory = categories.find((c) => c.value === category) || categories[0];

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

  if (isLoading) {
    return <PageLoading message="Chargement des tendances..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground" />
          </div>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-7 h-7 text-orange-500" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Tendances
            </h1>
          </div>
          <p className="text-muted-foreground">
            Découvrez les profils anime les plus populaires du moment
          </p>
        </div>

        {/* Sélecteur de période */}
        <div className="flex flex-wrap gap-2 mb-6">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Catégories */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/30 hover:bg-accent/50"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive ? cat.color : "text-muted-foreground"
                  }`}
                />
                <div>
                  <div
                    className={`font-medium text-sm ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {cat.label}
                  </div>
                  <div className="text-xs text-muted-foreground hidden sm:block">
                    {cat.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Liste des tendances */}
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {trends.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <activeCategory.icon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Aucune tendance disponible
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  {category === "trending"
                    ? "Les tendances apparaîtront une fois que des données auront été collectées."
                    : category === "rising"
                    ? "Aucun nouveau profil en hausse pour cette période."
                    : "Aucun profil avec des vues pour le moment."}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`${category}-${period}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {trends.map((trend: any, index: number) => {
                  const userKey = `${trend.platform}-${trend.username}`;
                  const isExpanded = expandedUsers.has(userKey);

                  return (
                    <motion.div
                      key={userKey}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="rounded-lg border border-border/50 overflow-hidden transition-colors hover:border-border"
                    >
                      {/* Ligne principale */}
                      <div
                        className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => toggleExpand(userKey)}
                      >
                        {/* Version Mobile */}
                        <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 sm:hidden">
                          <span className="text-sm text-muted-foreground w-8 flex-shrink-0 row-start-1 col-start-1 flex items-center">
                            #{index + 1}
                          </span>
                          <div className="row-start-1 col-start-2 min-w-0">
                            <span className="font-medium truncate block">
                              {trend.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 row-start-1 col-start-3">
                            {category !== "mostViewed" &&
                              trend.viewsGain > 0 && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                                  <span className="text-sm font-medium text-emerald-500">
                                    +{trend.viewsGain.toLocaleString()}
                                  </span>
                                </div>
                              )}
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {trend.totalViews.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="col-start-2 row-start-2 col-span-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="flex items-center gap-1">
                                <PlatformIcon
                                  platform={trend.platform}
                                  size={12}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {platformLabels[trend.platform] ||
                                    trend.platform}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {trend.cardTypes.length} carte
                                {trend.cardTypes.length > 1 ? "s" : ""}
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
                              #{index + 1}
                            </span>
                            <span className="font-medium truncate">
                              {trend.username}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <PlatformIcon
                                platform={trend.platform}
                                size={14}
                              />
                              <span className="text-xs text-muted-foreground">
                                {platformLabels[trend.platform] ||
                                  trend.platform}
                              </span>
                            </div>
                            {/* Badges types de carte */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {trend.cardTypes
                                .slice(0, 4)
                                .map((ct: string, i: number) => (
                                  <span
                                    key={i}
                                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                      cardTypeColors[ct] ||
                                      "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {cardTypeLabels[ct] || ct}
                                  </span>
                                ))}
                              {trend.cardTypes.length > 4 && (
                                <span className="text-[10px] text-muted-foreground">
                                  +{trend.cardTypes.length - 4}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 flex-shrink-0">
                            {/* Indicateur de gain */}
                            {category !== "mostViewed" &&
                              trend.viewsGain > 0 && (
                                <div className="text-center">
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-sm font-semibold text-emerald-500">
                                      +
                                      {trend.viewsGain.toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    gain
                                  </p>
                                </div>
                              )}
                            {/* Vélocité */}
                            {category !== "mostViewed" &&
                              trend.velocity > 0 && (
                                <div className="text-center">
                                  <div className="flex items-center gap-1">
                                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-sm font-medium">
                                      {trend.velocity.toFixed(1)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    vues/h
                                  </p>
                                </div>
                              )}
                            {/* Vues totales */}
                            <div className="text-center">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                  {trend.totalViews.toLocaleString()}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                vues
                              </p>
                            </div>
                            <span className="text-xs text-primary">
                              {isExpanded ? "▲ Masquer" : "▼ Détails"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Détails dépliés */}
                      {isExpanded && (
                        <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {trend.cardTypes.map(
                              (ct: string, i: number) => (
                                <a
                                  key={i}
                                  href={`/card?platform=${
                                    trend.platform
                                  }&username=${encodeURIComponent(
                                    trend.username
                                  )}&type=${ct}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-background/50 hover:bg-accent/50 hover:border-primary/30 transition-colors group"
                                >
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded border ${
                                      cardTypeColors[ct] ||
                                      "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {cardTypeLabels[ct] || ct}
                                  </span>
                                  <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    Voir
                                    <ChevronRight className="w-3 h-3" />
                                  </span>
                                </a>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
