"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Database,
  Shield,
  Bell,
  TrendingUp,
  Save,
  RotateCcw,
  CheckCircle,
  Settings,
} from "lucide-react";
import { InlineLoading } from "@/components/ui/loading";
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
  snapshotEnabled: "true",
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (session) fetchSettings();
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
        <p className="text-muted-foreground ml-4">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configuration du système
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Sauvegardé
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {saving ? "Sauvegarde..." : "Sauvegarder"}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Cache */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Cache</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expiration (heures)</label>
              <Input
                type="number"
                value={settings.cacheExpiration}
                onChange={(e) => updateSetting("cacheExpiration", e.target.value)}
                placeholder="24"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Rétention des logs (jours)</label>
              <Input
                type="number"
                value={settings.maxLogsRetention}
                onChange={(e) => updateSetting("maxLogsRetention", e.target.value)}
                placeholder="30"
              />
            </div>
          </div>
        </section>

        {/* Tendances */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Tendances</h2>
          </div>
          <div className="space-y-1.5 max-w-xs">
            <label className="text-sm font-medium">Snapshots</label>
            <Select
              value={settings.snapshotEnabled}
              onValueChange={(value) => updateSetting("snapshotEnabled", value)}
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
              La fréquence est gérée via le système de cron.
            </p>
          </div>
        </section>

        {/* Sécurité & Notifications */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Sécurité & Notifications</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mode maintenance</label>
              <Select
                value={settings.maintenanceMode}
                onValueChange={(value) => updateSetting("maintenanceMode", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="false">Désactivé</SelectItem>
                  <SelectItem value="true">Activé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notifications email</label>
              <Select
                value={settings.enableNotifications}
                onValueChange={(value) => updateSetting("enableNotifications", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activées</SelectItem>
                  <SelectItem value="false">Désactivées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Infos système */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Système</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Node.js</span>
              <p className="font-medium">{process.env.NODE_VERSION || "N/A"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Environnement</span>
              <p className="font-medium">{process.env.NODE_ENV || "development"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Base de données</span>
              <p className="font-medium">PostgreSQL</p>
            </div>
            <div>
              <span className="text-muted-foreground">Framework</span>
              <p className="font-medium">Next.js 15</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
