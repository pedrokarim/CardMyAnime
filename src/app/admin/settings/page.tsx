"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Settings,
  Database,
  Shield,
  Bell,
  TrendingUp,
  Save,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { InlineLoading } from "@/components/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULTS: Record<string, string> = {
  cacheExpiration: "24",
  maxLogsRetention: "30",
  enableNotifications: "true",
  maintenanceMode: "false",
  snapshotIntervalHours: "6",
  snapshotEnabled: "true",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert("Erreur lors de la sauvegarde des paramètres");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde des paramètres");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...DEFAULTS });
  };

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <InlineLoading />
        <p className="text-muted-foreground ml-4">
          Chargement des paramètres...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Paramètres</h1>
        <p className="text-muted-foreground">
          Configuration du système d&apos;administration
        </p>
      </div>

      {/* Paramètres du cache */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Paramètres du Cache
          </CardTitle>
          <CardDescription>
            Configuration de la gestion du cache et des données temporaires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Durée d&apos;expiration du cache (heures)
              </label>
              <Input
                type="number"
                value={settings.cacheExpiration}
                onChange={(e) =>
                  updateSetting("cacheExpiration", e.target.value)
                }
                placeholder="24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Rétention des logs (jours)
              </label>
              <Input
                type="number"
                value={settings.maxLogsRetention}
                onChange={(e) =>
                  updateSetting("maxLogsRetention", e.target.value)
                }
                placeholder="30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres des tendances */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tendances
          </CardTitle>
          <CardDescription>
            Configuration du système de snapshots pour le suivi des tendances
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
                  updateSetting("snapshotIntervalHours", value)
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
              <p className="text-xs text-muted-foreground">
                Fréquence de capture des données de tendances
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Snapshots activés
              </label>
              <Select
                value={settings.snapshotEnabled}
                onValueChange={(value) =>
                  updateSetting("snapshotEnabled", value)
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
              <p className="text-xs text-muted-foreground">
                Active ou désactive la capture automatique des snapshots
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Sécurité
          </CardTitle>
          <CardDescription>
            Configuration des paramètres de sécurité et d&apos;accès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mode maintenance</label>
            <Select
              value={settings.maintenanceMode}
              onValueChange={(value) =>
                updateSetting("maintenanceMode", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="false">Désactivé</SelectItem>
                <SelectItem value="true">Activé</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Active le mode maintenance pour limiter l&apos;accès au site
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configuration des notifications et alertes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Notifications par email
            </label>
            <Select
              value={settings.enableNotifications}
              onValueChange={(value) =>
                updateSetting("enableNotifications", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activées</SelectItem>
                <SelectItem value="false">Désactivées</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Recevoir des notifications par email pour les événements
              importants
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informations système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Informations Système
          </CardTitle>
          <CardDescription>
            Détails sur la configuration actuelle du système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Version Node.js:</span>
              <span className="ml-2 text-muted-foreground">
                {process.env.NODE_VERSION || "Non disponible"}
              </span>
            </div>
            <div>
              <span className="font-medium">Environnement:</span>
              <span className="ml-2 text-muted-foreground">
                {process.env.NODE_ENV || "development"}
              </span>
            </div>
            <div>
              <span className="font-medium">Base de données:</span>
              <span className="ml-2 text-muted-foreground">PostgreSQL</span>
            </div>
            <div>
              <span className="font-medium">Framework:</span>
              <span className="ml-2 text-muted-foreground">Next.js 15</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Sauvegardé
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
