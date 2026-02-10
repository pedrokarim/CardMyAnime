"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminProfilePage() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const handleSave = async () => {
    alert("Fonctionnalité de sauvegarde à implémenter");
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Informations personnelles et paramètres de compte
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Informations</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>Sauvegarder</Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Annuler</Button>
                </>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)}>Modifier</Button>
              )}
            </div>
          </div>
        </section>

        {/* Session */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">Session</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email de connexion</p>
                <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Dernière connexion</p>
                <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Rôle</p>
                <p className="text-sm text-muted-foreground">Administrateur</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Sécurité */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide">Sécurité</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Changer le mot de passe</p>
              <p className="text-xs text-muted-foreground">Mettre à jour votre mot de passe</p>
            </div>
            <Button variant="outline" size="sm">Modifier</Button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Authentification 2FA</p>
              <p className="text-xs text-muted-foreground">Couche de sécurité supplémentaire</p>
            </div>
            <Button variant="outline" size="sm">Configurer</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
