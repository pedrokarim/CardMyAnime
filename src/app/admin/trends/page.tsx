"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Camera,
  Trash2,
  RefreshCw,
  Clock,
  Database,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  InlineLoading,
  ButtonLoading,
} from "@/components/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TrendStats {
  totalSnapshots: number;
  lastSnapshotAt: string | null;
  snapshotsToday: number;
  snapshots7d: number;
}

export default function AdminTrendsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<TrendStats | null>(null);
  const [settings, setSettings] = useState({
    snapshotIntervalHours: "6",
    snapshotEnabled: "true",
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes] = await Promise.all([
        fetch("/api/admin/trends"),
        fetch("/api/admin/settings"),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (settingsRes.ok) {
        const allSettings = await settingsRes.json();
        setSettings({
          snapshotIntervalHours:
            allSettings.snapshotIntervalHours || "6",
          snapshotEnabled: allSettings.snapshotEnabled || "true",
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (
      action === "delete-all" &&
      !confirm(
        "Voulez-vous vraiment supprimer tous les snapshots ? Cette action est irréversible."
      )
    ) {
      return;
    }

    setActionLoading(action);
    try {
      const response = await fetch("/api/admin/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        await fetchData();
      } else {
        alert(result.error || "Erreur lors de l'action");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'action");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Configuration sauvegardée");
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <InlineLoading />
        <p className="text-muted-foreground ml-4">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Tendances</h1>
        <p className="text-muted-foreground">
          Gestion des snapshots et du système de tendances
        </p>
      </div>

      {/* Configuration des snapshots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Configuration des Snapshots
          </CardTitle>
          <CardDescription>
            Paramètres de fréquence et activation des snapshots automatiques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Intervalle des snapshots
              </label>
              <Select
                value={settings.snapshotIntervalHours}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    snapshotIntervalHours: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Toutes les heures</SelectItem>
                  <SelectItem value="6">Toutes les 6 heures</SelectItem>
                  <SelectItem value="12">Toutes les 12 heures</SelectItem>
                  <SelectItem value="24">Toutes les 24 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={settings.snapshotEnabled}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    snapshotEnabled: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activés</SelectItem>
                  <SelectItem value="false">Désactivés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSaveSettings} disabled={savingSettings}>
            {savingSettings ? "Sauvegarde..." : "Sauvegarder la configuration"}
          </Button>
        </CardContent>
      </Card>

      {/* Statistiques des snapshots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Statistiques des Snapshots
          </CardTitle>
          <CardDescription>
            État actuel du système de capture des tendances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-sm">Total Snapshots</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.totalSnapshots.toLocaleString()}
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-sm">Dernier Snapshot</h3>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {stats.lastSnapshotAt
                    ? new Date(stats.lastSnapshotAt).toLocaleString("fr-FR")
                    : "Aucun"}
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-sm">Snapshots 24h</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.snapshotsToday.toLocaleString()}
                </p>
              </div>

              <div className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-sm">Snapshots 7j</h3>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {stats.snapshots7d.toLocaleString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <InlineLoading />
              <p className="text-muted-foreground mt-4">Chargement...</p>
            </div>
          )}

          <Button
            onClick={fetchData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </CardContent>
      </Card>

      {/* Actions manuelles */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Manuelles</CardTitle>
          <CardDescription>
            Gérer les snapshots de tendances manuellement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => handleAction("take-snapshot")}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              {actionLoading === "take-snapshot" ? (
                <ButtonLoading size="sm" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              <div className="text-left">
                <div className="font-semibold">Prendre un snapshot</div>
                <div className="text-sm text-muted-foreground">
                  Capturer l&apos;état actuel des vues
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleAction("cleanup")}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 h-auto p-4"
              variant="outline"
            >
              {actionLoading === "cleanup" ? (
                <ButtonLoading size="sm" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              <div className="text-left">
                <div className="font-semibold">Nettoyer les anciens</div>
                <div className="text-sm text-muted-foreground">
                  Supprimer les snapshots &gt; 90 jours
                </div>
              </div>
            </Button>

            <Button
              onClick={() => handleAction("delete-all")}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 h-auto p-4"
              variant="destructive"
            >
              {actionLoading === "delete-all" ? (
                <ButtonLoading size="sm" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <div className="text-left">
                <div className="font-semibold">Tout supprimer</div>
                <div className="text-sm text-muted-foreground">
                  Supprimer tous les snapshots
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
