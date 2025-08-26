"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Database,
  Trash2,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  PageLoading,
  ButtonLoading,
  InlineLoading,
} from "@/components/ui/loading";

interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  validEntries: number;
}

interface AdminStats {
  cards: {
    total: number;
    totalViews: number;
    totalViews24h: number;
  };
  cache: CacheStats;
  views: {
    totalViews: number;
    uniqueViews24h: number;
    totalLogs: number;
    expiredLogs: number;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/cache");
      const result = await response.json();

      if (response.ok) {
        setStats(result);
        setLastUpdate(new Date());
      } else {
        console.error("Erreur API:", result.error);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupCache = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cleanup-expired" }),
      });
      const result = await response.json();

      if (response.ok) {
        await fetchStats();
        alert(result.message);
      } else {
        alert("Erreur lors du nettoyage du cache");
      }
    } catch (error) {
      console.error("Erreur lors du nettoyage:", error);
      alert("Erreur lors du nettoyage du cache");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  if (status === "loading") {
    return <PageLoading message="Vérification de l'authentification..." />;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Administration CardMyAnime
            </h1>
            <p className="text-muted-foreground">
              Connecté en tant que {session.user?.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/logs"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Voir les logs
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-transparent border border-border hover:bg-accent text-foreground px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Statistiques du cache */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Statistiques du Cache</h2>

          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Cache Total</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.cache.totalEntries}
                </p>
                <p className="text-sm text-muted-foreground">
                  Entrées en cache
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Cache Valides</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.cache.validEntries}
                </p>
                <p className="text-sm text-muted-foreground">Données à jour</p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold">Cache Expirées</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.cache.expiredEntries}
                </p>
                <p className="text-sm text-muted-foreground">À renouveler</p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold">Cartes</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.cards.total}
                </p>
                <p className="text-sm text-muted-foreground">Total générées</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">
                Chargement des statistiques...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? (
                <ButtonLoading size="sm" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Actualiser les stats
            </button>

            <button
              onClick={cleanupCache}
              disabled={loading || !stats || stats.cache.expiredEntries === 0}
              className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 disabled:opacity-50 text-destructive-foreground px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Nettoyer le cache ({stats?.cache.expiredEntries || 0})
            </button>
          </div>

          {lastUpdate && (
            <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Dernière mise à jour : {lastUpdate.toLocaleString("fr-FR")}
            </p>
          )}
        </div>

        {/* Statistiques des vues */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Statistiques des Vues</h2>

          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Vues Totales</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.cards.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Toutes les cartes
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Vues 24h</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.cards.totalViews24h.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Dernières 24h</p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold">Logs de Vues</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.views.totalLogs.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total enregistrés
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold">Logs Expirés</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.views.expiredLogs.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">À nettoyer</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <InlineLoading size="md" />
              <p className="text-muted-foreground mt-2">
                Chargement des statistiques...
              </p>
            </div>
          )}

          {/* Actions pour les vues */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const response = await fetch("/api/admin/cache", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "cleanup-view-logs" }),
                  });
                  const result = await response.json();
                  if (response.ok) {
                    await fetchStats();
                    alert(result.message);
                  }
                } catch (error) {
                  console.error("Erreur:", error);
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || !stats || stats.views.expiredLogs === 0}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Nettoyer les logs ({stats?.views.expiredLogs || 0})
            </button>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Informations</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Durée de cache : 24 heures</span>
            </div>
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Renouvellement automatique en arrière-plan</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>
                Les données expirées restent disponibles pendant le
                renouvellement
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>
                Système anti-spam : 1 vue par heure par visiteur unique
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
