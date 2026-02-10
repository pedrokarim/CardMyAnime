"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { ButtonLoading, InlineLoading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

interface AdminStats {
  cards: {
    total: number;
    totalViews: number;
    totalViews24h: number;
  };
  cache: {
    totalEntries: number;
    expiredEntries: number;
    validEntries: number;
  };
  views: {
    totalViews: number;
    uniqueViews24h: number;
    totalLogs: number;
    expiredLogs: number;
  };
}

export default function StatsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/cache");
      const result = await response.json();
      if (response.ok) {
        setStats(result);
        setLastUpdate(new Date());
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
        headers: { "Content-Type": "application/json" },
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

  const cleanupLogs = async () => {
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
      } else {
        alert("Erreur lors du nettoyage des logs");
      }
    } catch (error) {
      console.error("Erreur lors du nettoyage:", error);
      alert("Erreur lors du nettoyage des logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchStats();
  }, [session]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-16">
        <InlineLoading />
        <p className="text-muted-foreground ml-3">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistiques</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyse des performances et de l&apos;utilisation
          </p>
        </div>
        <Button onClick={fetchStats} disabled={loading} variant="outline" size="sm">
          {loading ? <ButtonLoading size="sm" /> : <RefreshCw className="w-4 h-4" />}
          Actualiser
        </Button>
      </div>

      {/* Cartes */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">Cartes</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-2xl font-semibold">{stats.cards.total}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium">Vues 24h</span>
            </div>
            <p className="text-2xl font-semibold">{stats.cards.totalViews24h.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">Uniques 24h</span>
            </div>
            <p className="text-2xl font-semibold">{stats.views.uniqueViews24h.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Cache */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Cache</h2>
          <Button
            onClick={cleanupCache}
            disabled={loading || stats.cache.expiredEntries === 0}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Nettoyer ({stats.cache.expiredEntries})
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Database className="w-4 h-4" />
              <span className="text-xs font-medium">Total</span>
            </div>
            <p className="text-2xl font-semibold">{stats.cache.totalEntries}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-green-500 mb-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Valides</span>
            </div>
            <p className="text-2xl font-semibold">{stats.cache.validEntries}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Expirés</span>
            </div>
            <p className="text-2xl font-semibold">{stats.cache.expiredEntries}</p>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Logs</h2>
          <Button
            onClick={cleanupLogs}
            disabled={loading || stats.views.expiredLogs === 0}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Nettoyer ({stats.views.expiredLogs})
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Database className="w-4 h-4" />
              <span className="text-xs font-medium">Total logs</span>
            </div>
            <p className="text-2xl font-semibold">{stats.views.totalLogs.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <XCircle className="w-4 h-4" />
              <span className="text-xs font-medium">Expirés</span>
            </div>
            <p className="text-2xl font-semibold">{stats.views.expiredLogs.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Mis à jour : {lastUpdate.toLocaleString("fr-FR")}
        </p>
      )}
    </div>
  );
}
