"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SITE_CONFIG } from "@/lib/constants";
import { Trash2, Shield, AlertTriangle } from "lucide-react";
import { ReCAPTCHAComponent } from "@/components/ui/recaptcha";

export default function DataDeletionPage() {
  const [formData, setFormData] = useState({
    platform: "",
    username: "",
    email: "",
    reason: "",
    additionalInfo: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérifier que reCAPTCHA est validé
    if (!recaptchaToken) {
      setRecaptchaError("Veuillez valider le reCAPTCHA");
      return;
    }

    setIsSubmitting(true);
    setRecaptchaError(null);

    try {
      const response = await fetch("/api/data-deletion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        // Afficher l'erreur reCAPTCHA spécifique si disponible
        if (data.details && data.details.includes("invalid-keys")) {
          setRecaptchaError(
            "Configuration reCAPTCHA invalide. Veuillez contacter l'administrateur."
          );
        } else if (
          data.details &&
          data.details.includes("invalid-input-response")
        ) {
          setRecaptchaError("Le reCAPTCHA a expiré. Veuillez le refaire.");
        } else {
          setRecaptchaError(
            data.error || "Erreur lors de l'envoi de la demande"
          );
        }

        // Log pour le débogage
        console.error("Erreur reCAPTCHA:", {
          error: data.error,
          details: data.details,
          debug: data.debug,
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setRecaptchaError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    setRecaptchaError(null);
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    setRecaptchaError("Le reCAPTCHA a expiré. Veuillez le refaire.");
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    setRecaptchaError("Erreur avec le reCAPTCHA. Veuillez réessayer.");
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-200">
                Demande reçue avec succès
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Votre demande de suppression de données a été transmise à notre
                équipe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  Prochaines étapes :
                </h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Nous traiterons votre demande sous 7 jours ouvrés</li>
                  <li>• Vous recevrez une confirmation par email</li>
                  <li>
                    • Toutes vos données seront supprimées de nos serveurs
                  </li>
                  <li>• Les cartes générées seront également supprimées</li>
                </ul>
              </div>
              <div className="text-center">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFormData({
                      platform: "",
                      username: "",
                      email: "",
                      reason: "",
                      additionalInfo: "",
                    });
                  }}
                  variant="outline"
                >
                  Faire une nouvelle demande
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-6">
            <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full w-fit mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Suppression de données
            </h1>
            <div className="h-1 bg-red-500 rounded-full w-32 mx-auto"></div>
          </div>
          <p className="text-lg text-muted-foreground">
            Demandez la suppression de vos données personnelles de{" "}
            {SITE_CONFIG.site.name}
          </p>
        </div>

        {/* Avertissement */}
        <Card className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  Important à savoir
                </h3>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <li>
                    • Cette action est <strong>irréversible</strong>
                  </li>
                  <li>• Toutes vos cartes générées seront supprimées</li>
                  <li>
                    • Vos données ne seront plus accessibles via notre service
                  </li>
                  <li>• Le processus prend jusqu'à 7 jours ouvrés</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>Formulaire de demande</CardTitle>
            <CardDescription>
              Remplissez ce formulaire pour demander la suppression de vos
              données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Plateforme */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Plateforme concernée <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.platform}
                  onValueChange={(value) =>
                    handleInputChange("platform", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre plateforme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anilist">AniList</SelectItem>
                    <SelectItem value="mal">MyAnimeList</SelectItem>
                    <SelectItem value="nautiljon">Nautiljon</SelectItem>
                    <SelectItem value="all">Toutes les plateformes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nom d'utilisateur */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Nom d'utilisateur <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Votre nom d'utilisateur sur la plateforme"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Adresse email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Nous utiliserons cet email pour vous confirmer la suppression
                </p>
              </div>

              {/* Raison */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Raison de la suppression{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => handleInputChange("reason", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une raison" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privacy">
                      Protection de la vie privée
                    </SelectItem>
                    <SelectItem value="no-longer-use">
                      Je n'utilise plus le service
                    </SelectItem>
                    <SelectItem value="data-accuracy">
                      Données incorrectes
                    </SelectItem>
                    <SelectItem value="legal">Obligation légale</SelectItem>
                    <SelectItem value="other">Autre raison</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Informations supplémentaires */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Informations supplémentaires
                </label>
                <Textarea
                  placeholder="Décrivez votre demande plus en détail (optionnel)"
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    handleInputChange("additionalInfo", e.target.value)
                  }
                  rows={4}
                />
              </div>

              {/* reCAPTCHA */}
              <div className="space-y-2">
                <ReCAPTCHAComponent
                  onChange={handleRecaptchaChange}
                  onExpired={handleRecaptchaExpired}
                  onError={handleRecaptchaError}
                  className="my-4"
                />
                {recaptchaError && (
                  <p className="text-sm text-red-500 text-center">
                    {recaptchaError}
                  </p>
                )}
              </div>

              {/* Bouton de soumission */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={
                    isSubmitting ||
                    !formData.platform ||
                    !formData.username ||
                    !formData.email ||
                    !formData.reason ||
                    !recaptchaToken
                  }
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </div>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Demander la suppression
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informations légales */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">Vos droits</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                Conformément au RGPD, vous avez le droit de demander la
                suppression de vos données personnelles. Cette demande sera
                traitée dans les délais légaux.
              </p>
              <p>
                Pour toute question, contactez-nous via{" "}
                <a
                  href={SITE_CONFIG.social.discord}
                  className="text-primary hover:underline"
                >
                  Discord
                </a>{" "}
                ou{" "}
                <a
                  href={SITE_CONFIG.social.github}
                  className="text-primary hover:underline"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
