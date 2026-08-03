"use client";

import { useEffect, useState } from "react";
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
import { Trash2, Shield, AlertTriangle, Wand2 } from "lucide-react";
import { ReCAPTCHAComponent } from "@/components/recaptcha";
import { faker } from "@faker-js/faker";
import { useTraduction } from "@/lib/i18n/client";
import type { Dictionnaire } from "@/lib/i18n";

/** Champs obligatoires, dans l'ordre du formulaire : le focus part au premier
 *  manquant, qui est celui que l'utilisateur voit en premier. */
const champsRequis = (t: Dictionnaire) =>
  [
    { cle: "platform", id: "champ-plateforme", message: t.suppression.erreurPlateforme },
    { cle: "username", id: "champ-pseudo", message: t.suppression.erreurPseudo },
    { cle: "email", id: "champ-email", message: t.suppression.erreurEmail },
    { cle: "reason", id: "champ-raison", message: t.suppression.erreurRaison },
  ] as const;

/** Erreur d'un champ, rendue juste sous lui plutôt que dans un bloc global. */
function MessageErreur({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} className="text-sm text-destructive">
      {message}
    </p>
  );
}

export default function DataDeletionPage() {
  const { t } = useTraduction();
  const isDev = process.env.NODE_ENV === "development";

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
  const [erreursChamps, setErreursChamps] = useState<Record<string, string>>({});

  const formulaireEntame =
    !isSubmitted &&
    Object.values(formData).some((valeur) => valeur.trim() !== "");

  // Un formulaire RGPD à moitié rempli, perdu sur un clic accidentel, se
  // recommence en entier. Le navigateur demande confirmation à notre place.
  useEffect(() => {
    if (!formulaireEntame) return;

    const avertir = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Certains navigateurs exigent encore returnValue pour afficher l'invite.
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", avertir);
    return () => window.removeEventListener("beforeunload", avertir);
  }, [formulaireEntame]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation à la soumission, pas en désactivant le bouton : un bouton
    // grisé sans explication ne dit pas *ce qui* manque.
    const requis = champsRequis(t);
    const manquants: Record<string, string> = {};
    for (const champ of requis) {
      if (!formData[champ.cle].trim()) manquants[champ.cle] = champ.message;
    }

    if (Object.keys(manquants).length > 0) {
      setErreursChamps(manquants);
      const premier = requis.find((c) => manquants[c.cle]);
      document.getElementById(premier!.id)?.focus();
      return;
    }

    setErreursChamps({});

    // Vérifier que reCAPTCHA est validé (sauf en dev)
    if (!isDev && !recaptchaToken) {
      setRecaptchaError(t.suppression.recaptchaEchec);
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
          recaptchaToken: isDev ? "dev-bypass-token" : recaptchaToken,
          recaptchaAction: "data_deletion",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        // Afficher l'erreur reCAPTCHA spécifique si disponible
        if (data.details && data.details.includes("invalid-keys")) {
          setRecaptchaError(t.suppression.recaptchaInvalide);
        } else if (
          data.details &&
          data.details.includes("invalid-input-response")
        ) {
          setRecaptchaError(t.suppression.recaptchaExpire);
        } else {
          setRecaptchaError(data.error || t.suppression.erreurEnvoi);
        }
      }
    } catch (error) {
      console.error("Erreur:", error);
      setRecaptchaError(t.suppression.erreurConnexion);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // L'erreur disparaît dès que le champ est corrigé, sans attendre un
    // second envoi.
    setErreursChamps((prev) => {
      if (!prev[field]) return prev;
      const suivant = { ...prev };
      delete suivant[field];
      return suivant;
    });
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    setRecaptchaError(null);
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    setRecaptchaError(t.suppression.recaptchaEchec);
  };

  // Fonction pour générer des données de test avec Faker
  const generateTestData = () => {
    const platforms = ["anilist", "mal", "nautiljon", "all"];
    const reasons = [
      "privacy",
      "no-longer-use",
      "data-accuracy",
      "legal",
      "other",
    ];

    const testData = {
      platform: faker.helpers.arrayElement(platforms),
      username: faker.internet.username(),
      email: faker.internet.email(),
      reason: faker.helpers.arrayElement(reasons),
      additionalInfo:
        faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.7,
        }) || "",
    };

    setFormData(testData);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div
          className="container mx-auto px-4 py-8 max-w-2xl"
          role="status"
          aria-live="polite"
        >
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                <Shield aria-hidden="true" className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-800 dark:text-green-200">
                {t.suppression.succesTitre}
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                {t.suppression.succesDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  {t.suppression.prochainesEtapes}
                </h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• {t.suppression.etape1}</li>
                  <li>• {t.suppression.etape2}</li>
                  <li>• {t.suppression.etape3}</li>
                  <li>• {t.suppression.etape4}</li>
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
                  {t.suppression.nouvelleDemande}
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
              <Trash2 aria-hidden="true" className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">
              {t.suppression.titre}
            </h1>
            <div className="h-1 bg-red-500 rounded-full w-32 mx-auto"></div>
          </div>
          <p className="text-lg text-muted-foreground">
            {t.suppression.sousTitre(SITE_CONFIG.site.name)}
          </p>
        </div>

        {/* Avertissement */}
        <Card className="mb-8 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle aria-hidden="true" className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                  {t.suppression.avertissementTitre}
                </h3>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <li>
                    • {t.suppression.avertissement1Prefixe}{" "}
                    <strong>{t.suppression.avertissement1Gras}</strong>
                  </li>
                  <li>• {t.suppression.avertissement2}</li>
                  <li>• {t.suppression.avertissement3}</li>
                  <li>• {t.suppression.avertissement4}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t.suppression.formulaireTitre}</CardTitle>
                <CardDescription>
                  {t.suppression.formulaireDesc}
                </CardDescription>
              </div>
              {/* Bouton de génération de données de test - visible uniquement en dev */}
              {process.env.NODE_ENV === "development" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateTestData}
                  className="flex items-center gap-2 text-xs"
                >
                  <Wand2 aria-hidden="true" className="w-3 h-3" />
                  {t.suppression.donneesTest}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Plateforme */}
              <div className="space-y-2">
                {/* Le déclencheur Radix est un <button> : un <label for> ne s'y
                    associe pas, on le relie par aria-labelledby. */}
                <span id="libelle-plateforme" className="block text-sm font-medium">
                  {t.suppression.labelPlateforme}{" "}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </span>
                <Select
                  value={formData.platform}
                  onValueChange={(value) =>
                    handleInputChange("platform", value)
                  }
                >
                  <SelectTrigger
                    id="champ-plateforme"
                    className="w-full"
                    aria-labelledby="libelle-plateforme"
                    aria-required="true"
                    aria-invalid={!!erreursChamps.platform}
                    aria-describedby={
                      erreursChamps.platform ? "erreur-plateforme" : undefined
                    }
                  >
                    <SelectValue placeholder={t.suppression.placeholderPlateforme} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anilist">AniList</SelectItem>
                    <SelectItem value="mal">MyAnimeList</SelectItem>
                    <SelectItem value="nautiljon">Nautiljon</SelectItem>
                    <SelectItem value="all">
                      {t.suppression.toutesPlateformes}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <MessageErreur id="erreur-plateforme" message={erreursChamps.platform} />
              </div>

              {/* Nom d'utilisateur */}
              <div className="space-y-2">
                <label htmlFor="champ-pseudo" className="block text-sm font-medium">
                  {t.suppression.labelPseudo}{" "}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <Input
                  id="champ-pseudo"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-required="true"
                  aria-invalid={!!erreursChamps.username}
                  aria-describedby={
                    erreursChamps.username ? "erreur-pseudo" : undefined
                  }
                  placeholder={t.suppression.placeholderPseudo}
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                />
                <MessageErreur id="erreur-pseudo" message={erreursChamps.username} />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="champ-email" className="block text-sm font-medium">
                  {t.suppression.labelEmail}{" "}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <Input
                  id="champ-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  aria-required="true"
                  aria-invalid={!!erreursChamps.email}
                  aria-describedby={`aide-email${
                    erreursChamps.email ? " erreur-email" : ""
                  }`}
                  placeholder={t.suppression.placeholderEmail}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
                <p id="aide-email" className="text-xs text-muted-foreground">
                  {t.suppression.aideEmail}
                </p>
                <MessageErreur id="erreur-email" message={erreursChamps.email} />
              </div>

              {/* Raison */}
              <div className="space-y-2">
                <span id="libelle-raison" className="block text-sm font-medium">
                  {t.suppression.labelRaison}{" "}
                  <span className="text-red-500" aria-hidden="true">*</span>
                </span>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => handleInputChange("reason", value)}
                >
                  <SelectTrigger
                    id="champ-raison"
                    className="w-full"
                    aria-labelledby="libelle-raison"
                    aria-required="true"
                    aria-invalid={!!erreursChamps.reason}
                    aria-describedby={
                      erreursChamps.reason ? "erreur-raison" : undefined
                    }
                  >
                    <SelectValue placeholder={t.suppression.placeholderRaison} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privacy">
                      {t.suppression.raisonPrivacy}
                    </SelectItem>
                    <SelectItem value="no-longer-use">
                      {t.suppression.raisonInutilise}
                    </SelectItem>
                    <SelectItem value="data-accuracy">
                      {t.suppression.raisonDonnees}
                    </SelectItem>
                    <SelectItem value="legal">
                      {t.suppression.raisonLegal}
                    </SelectItem>
                    <SelectItem value="other">
                      {t.suppression.raisonAutre}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <MessageErreur id="erreur-raison" message={erreursChamps.reason} />
              </div>

              {/* Informations supplémentaires */}
              <div className="space-y-2">
                <label htmlFor="champ-details" className="block text-sm font-medium">
                  {t.suppression.labelDetails}
                </label>
                <Textarea
                  id="champ-details"
                  name="additionalInfo"
                  placeholder={t.suppression.placeholderDetails}
                  value={formData.additionalInfo}
                  onChange={(e) =>
                    handleInputChange("additionalInfo", e.target.value)
                  }
                  rows={4}
                />
              </div>

              {/* reCAPTCHA v3 */}
              <div className="space-y-2">
                {process.env.NODE_ENV === "development" ? (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                      {t.suppression.recaptchaDev}
                    </p>
                  </div>
                ) : (
                  <ReCAPTCHAComponent
                    onChange={handleRecaptchaChange}
                    onError={handleRecaptchaError}
                    action="data_deletion"
                    className="my-4"
                  />
                )}
                {/* Erreur serveur : elle arrive après l'envoi, sans changement
                    de page — il faut l'annoncer. */}
                <div aria-live="polite" className="empty:hidden">
                  {recaptchaError && (
                    <p className="text-sm text-destructive text-center">
                      {recaptchaError}
                    </p>
                  )}
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="pt-4">
                {/* Actif jusqu'au départ de la requête : c'est la validation à
                    la soumission qui explique ce qui manque, pas un bouton
                    grisé et muet. */}
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div
                        aria-hidden="true"
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                      />
                      {t.suppression.envoiEnCours}
                    </div>
                  ) : (
                    <>
                      <Trash2 aria-hidden="true" className="w-4 h-4 mr-2" />
                      {t.suppression.envoyer}
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
            <h3 className="font-semibold mb-3">{t.suppression.droitsTitre}</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
{t.suppression.droitsTexte}
              </p>
              <p>
                {t.suppression.droitsContact}{" "}
                <a
                  href={SITE_CONFIG.social.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Discord
                </a>{" "}
                {t.suppression.ou}{" "}
                <a
                  href={SITE_CONFIG.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
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
