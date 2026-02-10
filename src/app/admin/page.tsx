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
  Eye,
  Users,
  Activity,
  TrendingUp,
} from "lucide-react";
import {
  PageLoading,
  ButtonLoading,
  InlineLoading,
} from "@/components/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function AdminHomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

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

  useEffect(() => {
    if (session) {
      fetchStats();
    }
  }, [session]);

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground">
          Vue d'ensemble de l'administration CardMyAnime
        </p>
      </div>

      {/* Statistiques du cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Statistiques du Cache
          </CardTitle>
          <CardDescription>
            État actuel du cache et des données temporaires
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <p className="text-sm text-muted-foreground">Entrées valides</p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold">Cache Expirés</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.cache.expiredEntries}
                </p>
                <p className="text-sm text-muted-foreground">
                  Entrées expirées
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold">Vues Total</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.views.totalViews.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Vues enregistrées
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <InlineLoading />
              <p className="text-muted-foreground mt-4">
                Chargement des statistiques...
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <ButtonLoading size="sm" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Actualiser
            </Button>
            <Button
              onClick={cleanupCache}
              disabled={loading || !stats || stats.cache.expiredEntries === 0}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Nettoyer le cache ({stats?.cache.expiredEntries || 0})
            </Button>
          </div>

          {lastUpdate && (
            <p className="text-sm text-muted-foreground mt-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Dernière mise à jour : {lastUpdate.toLocaleString("fr-FR")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Statistiques des cartes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Statistiques des Cartes
          </CardTitle>
          <CardDescription>
            Performance et utilisation des cartes générées
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Cartes Total</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.cards.total}
                </p>
                <p className="text-sm text-muted-foreground">Cartes générées</p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Eye className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold">Vues 24h</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.cards.totalViews24h.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Dernières 24h</p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold">Vues Uniques 24h</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.views.uniqueViews24h.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Utilisateurs uniques
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <InlineLoading />
              <p className="text-muted-foreground mt-4">
                Chargement des statistiques...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>
            Accès direct aux fonctionnalités d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => router.push("/admin/logs")}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <Eye className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Voir les logs</div>
                <div className="text-sm text-muted-foreground">
                  Consulter les logs de vues
                </div>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/admin/data-deletion")}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <Trash2 className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Suppressions</div>
                <div className="text-sm text-muted-foreground">
                  Gérer les demandes de suppression
                </div>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/admin/trends")}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <TrendingUp className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Tendances</div>
                <div className="text-sm text-muted-foreground">
                  Gérer les snapshots de tendances
                </div>
              </div>
            </Button>

            <Button
              onClick={() => router.push("/admin/settings")}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              <Database className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Paramètres</div>
                <div className="text-sm text-muted-foreground">
                  Configuration du système
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
