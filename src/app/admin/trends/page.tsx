"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  Trash2,
  RefreshCw,
  Users,
  Star,
  BookOpen,
  Flame,
  ImageOff,
} from "lucide-react";
import { InlineLoading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";

export default function AdminTrendsPage() {
  const { data: session } = useSession();
  const { data, isLoading, refetch } = trpc.getTrends.useQuery();
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set());
  const [clearing, setClearing] = useState(false);

  const handleImgError = (key: string) => {
    setImgErrors((prev) => new Set(prev).add(key));
  };

  const handleClearCache = async () => {
    if (!confirm("Vider le cache des données utilisateur ? Les tendances seront recalculées au prochain chargement.")) return;

    setClearing(true);
    try {
      const res = await fetch("/api/admin/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cleanup-expired" }),
      });
      if (res.ok) {
        const result = await res.json();
        alert(result.message || "Cache nettoyé");
        refetch();
      } else {
        alert("Erreur lors du nettoyage");
      }
    } catch {
      alert("Erreur lors du nettoyage");
    } finally {
      setClearing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <InlineLoading />
        <p className="text-muted-foreground ml-4">Chargement...</p>
      </div>
    );
  }

  const animes = data?.animes || [];
  const mangas = data?.mangas || [];
  const totalUsers = data?.totalUsers || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tendances</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalUsers} profil{totalUsers > 1 ? "s" : ""} indexé{totalUsers > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearCache} disabled={clearing}>
            <Trash2 className="w-4 h-4" />
            {clearing ? "Nettoyage..." : "Vider le cache"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium">Animés</span>
          </div>
          <p className="text-2xl font-semibold">{animes.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <BookOpen className="w-4 h-4" />
            <span className="text-xs font-medium">Mangas</span>
          </div>
          <p className="text-2xl font-semibold">{mangas.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">Profils</span>
          </div>
          <p className="text-2xl font-semibold">{totalUsers}</p>
        </div>
      </div>

      {/* Animés */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Animés en tendance ({animes.length})
        </h2>
        {animes.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">Aucun animé en cache</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {animes.map((anime: any, index: number) => {
              const key = `admin-anime-${index}`;
              if (imgErrors.has(key)) {
                return (
                  <div key={key} className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center border border-border">
                    <ImageOff className="w-6 h-6 text-muted-foreground" />
                  </div>
                );
              }
              return (
                <div key={key} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border">
                  <img
                    src={anime.coverUrl}
                    alt={anime.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => handleImgError(key)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/60 text-white">
                      #{index + 1}
                    </span>
                  </div>
                  {anime.avgScore && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/60">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-medium text-white">{anime.avgScore}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-[11px] font-semibold text-white line-clamp-2 leading-tight">{anime.title}</p>
                    <p className="text-[10px] text-white/70 flex items-center gap-0.5 mt-0.5">
                      <Users className="w-2.5 h-2.5" />
                      {anime.viewers}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mangas */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-purple-500" />
          Mangas en tendance ({mangas.length})
        </h2>
        {mangas.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4">Aucun manga en cache</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {mangas.map((manga: any, index: number) => {
              const key = `admin-manga-${index}`;
              if (imgErrors.has(key)) {
                return (
                  <div key={key} className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center border border-border">
                    <ImageOff className="w-6 h-6 text-muted-foreground" />
                  </div>
                );
              }
              return (
                <div key={key} className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border border-border">
                  <img
                    src={manga.coverUrl}
                    alt={manga.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => handleImgError(key)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-black/60 text-white">
                      #{index + 1}
                    </span>
                  </div>
                  {manga.avgScore && (
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-black/60">
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] font-medium text-white">{manga.avgScore}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-[11px] font-semibold text-white line-clamp-2 leading-tight">{manga.title}</p>
                    <p className="text-[10px] text-white/70 flex items-center gap-0.5 mt-0.5">
                      <BookOpen className="w-2.5 h-2.5" />
                      {manga.readers}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
