"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Database, Shield, Users, Bell } from "lucide-react";
import { PageLoading } from "@/components/ui/loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState({
    cacheExpiration: "24",
    maxLogsRetention: "30",
    enableNotifications: "true",
    maintenanceMode: "false",
  });

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

  const handleSave = async () => {
    // Ici tu peux ajouter la logique pour sauvegarder les paramètres
    alert("Paramètres sauvegardés (fonctionnalité à implémenter)");
  };

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Paramètres</h1>
        <p className="text-muted-foreground">
          Configuration du système d'administration
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
                Durée d'expiration du cache (heures)
              </label>
              <Input
                type="number"
                value={settings.cacheExpiration}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    cacheExpiration: e.target.value,
                  }))
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
                  setSettings((prev) => ({
                    ...prev,
                    maxLogsRetention: e.target.value,
                  }))
                }
                placeholder="30"
              />
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
            Configuration des paramètres de sécurité et d'accès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Mode maintenance</label>
            <Select
              value={settings.maintenanceMode}
              onValueChange={(value) =>
                setSettings((prev) => ({ ...prev, maintenanceMode: value }))
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
              Active le mode maintenance pour limiter l'accès au site
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
                setSettings((prev) => ({ ...prev, enableNotifications: value }))
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
        <Button variant="outline">Réinitialiser</Button>
        <Button onClick={handleSave}>Sauvegarder</Button>
      </div>
    </div>
  );
}
