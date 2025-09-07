"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Shield, Settings } from "lucide-react";
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
import { Label } from "@/components/ui/label";

export default function AdminProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const handleSave = async () => {
    // TODO: Implémenter la sauvegarde du profil
    alert("Fonctionnalité de sauvegarde à implémenter");
    setIsEditing(false);
  };

  // L'authentification est maintenant gérée par AdminAuthWrapper dans le layout

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Profil Administrateur
        </h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et paramètres de compte
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informations Personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de profil et de contact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>Sauvegarder</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>Modifier</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Informations de Session
            </CardTitle>
            <CardDescription>Détails de votre session actuelle</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Email de connexion</div>
                <div className="text-sm text-muted-foreground">
                  {session.user.email}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Dernière connexion</div>
                <div className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">Rôle</div>
                <div className="text-sm text-muted-foreground">
                  Administrateur
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Paramètres de Sécurité
          </CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte administrateur
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Changer le mot de passe</div>
              <div className="text-sm text-muted-foreground">
                Mettez à jour votre mot de passe pour plus de sécurité
              </div>
            </div>
            <Button variant="outline">Modifier</Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">
                Authentification à deux facteurs
              </div>
              <div className="text-sm text-muted-foreground">
                Ajoutez une couche de sécurité supplémentaire
              </div>
            </div>
            <Button variant="outline">Configurer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
