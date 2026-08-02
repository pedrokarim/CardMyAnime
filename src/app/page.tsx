"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardPreview } from "@/components/CardPreview";
import { Platform, CardType, UserData } from "@/lib/types";
import {
  PLATFORM_STATUS,
  isPlatformDisabled,
  platformDisabledReason,
} from "@/lib/platformStatus";
import { CoverWall, CoverWallVeils } from "@/components/home/CoverWall";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { useQueryState } from "nuqs";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { ButtonLoading } from "@/components/ui/loading";
import { SITE_CONFIG } from "@/lib/constants";
import Link from "next/link";
import { CardStyleSvg } from "@/components/CardStyleSvg";
import { captureCarteEchouee, captureCarteGeneree, captureEtape } from "@/lib/analytics";
import { ArrowRight, ChevronDown } from "lucide-react";

type Step = "platform" | "cardType" | "username" | "preview";

export default function HomePage() {
  const [currentStep, setCurrentStep] = useQueryState<Step>("step", {
    defaultValue: "platform",
    parse: (value): Step => {
      if (["platform", "cardType", "username", "preview"].includes(value)) {
        return value as Step;
      }
      return "platform";
    },
  });

  const [platform, setPlatform] = useQueryState<Platform>("platform", {
    defaultValue: "anilist",
    parse: (value): Platform => {
      // Une plateforme suspendue est ignorée : arriver par une vieille URL
      // ?platform=… ne doit pas lancer un parcours qui échouera plus loin.
      if (["anilist", "mal", "nautiljon"].includes(value) && !isPlatformDisabled(value)) {
        return value as Platform;
      }
      return "anilist";
    },
  });

  const [username, setUsername] = useQueryState("username", {
    defaultValue: "",
  });

  const [cardType, setCardType] = useQueryState<CardType>("cardType", {
    defaultValue: "small",
    parse: (value): CardType => {
      if (["small", "medium", "large", "summary", "neon", "minimal", "glassmorphism"].includes(value)) {
        return value as CardType;
      }
      return "small";
    },
  });

  const [useLastAnimeBackground, setUseLastAnimeBackground] = useQueryState(
    "background",
    {
      defaultValue: "1", // Activé par défaut
    }
  );

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCardData, setGeneratedCardData] = useState<{
    cardUrl: string;
    shareableUrl: string;
  } | null>(null);

  // Récupération automatique des données au chargement de la page
  useEffect(() => {
    if (
      currentStep === "preview" &&
      platform &&
      username?.trim() &&
      !userData &&
      !isLoading
    ) {
      console.log("Récupération automatique des données pour:", {
        platform,
        username,
      });
      fetchUserDataMutation.mutate({
        platform: platform as Platform,
        username: username.trim(),
      });
    }
  }, [currentStep, platform, username, userData, isLoading, cardType]);

  const platforms = [
    {
      value: "anilist",
      label: "AniList",
      description: "API GraphQL officielle",
    },
    {
      value: "mal",
      label: "MyAnimeList",
      description: "API Jikan non-officielle",
    },
    {
      value: "nautiljon",
      label: "Nautiljon",
      description: "Scraping de profils publics",
    },
  ].map((platformOption) => ({
    ...platformOption,
    disabled: isPlatformDisabled(platformOption.value),
    disabledReason: platformDisabledReason(platformOption.value),
    shortLabel: PLATFORM_STATUS[platformOption.value as Platform].shortLabel,
  }));

  const cardTypes = [
    {
      value: "small",
      label: "Petite",
      description: "Avatar + pseudo + 3 derniers animes",
      size: "400×150",
      icon: "🎌",
    },
    {
      value: "medium",
      label: "Moyenne",
      description: "Avatar + stats + derniers animes/mangas",
      size: "600×300",
      icon: "📊",
    },
    {
      value: "large",
      label: "Grande",
      description: "Profil complet avec images",
      size: "800×500",
      icon: "🖼️",
    },
    {
      value: "summary",
      label: "Résumé",
      description: "Profil complet avec stats détaillées",
      size: "800×600",
      icon: "📈",
    },
    {
      value: "neon",
      label: "Néon",
      description: "Style cyberpunk avec effets néon lumineux",
      size: "600×350",
      icon: "💜",
    },
    {
      value: "minimal",
      label: "Minimal",
      description: "Design épuré et élégant sur fond clair",
      size: "500×250",
      icon: "✨",
    },
    {
      value: "glassmorphism",
      label: "Glass",
      description: "Effet verre givré avec fond coloré",
      size: "700×400",
      icon: "💎",
    },
  ];

  const fetchUserDataMutation = trpc.fetchUserData.useMutation({
    onSuccess: async (result) => {
      if (result.success && result.data) {
        setUserData(result.data);
        await setCurrentStep("preview");
        captureEtape("preview", { platform: platform ?? "", cardType });
        // Générer automatiquement la carte après avoir récupéré les données
        generateCardMutation.mutate({
          platform: platform as Platform,
          username: username?.trim() || "",
          cardType: cardType,
          useLastAnimeBackground: useLastAnimeBackground === "1",
        });
      } else {
        setError(result.error || "Erreur lors de la récupération des données");
        // Motif catégorisé, jamais le message brut : il peut contenir le pseudo
        // cherché, qui est l'identité d'une personne sur une plateforme tierce.
        captureCarteEchouee(platform ?? "", "profil_introuvable");
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Erreur tRPC:", error);
      setError("Erreur de connexion - Vérifiez le nom d'utilisateur");
      captureCarteEchouee(platform ?? "", "erreur_reseau");
      setIsLoading(false);
    },
  });

  const generateCardMutation = trpc.generateCard.useMutation({
    onSuccess: (result) => {
      if (result.success && result.cardUrl && result.shareableUrl) {
        setGeneratedCardData({
          cardUrl: result.cardUrl,
          shareableUrl: result.shareableUrl,
        });
        // Le pseudo saisi ne part pas : la plateforme et le format disent ce
        // qui sert, l'identité de la personne n'apprend rien de plus.
        captureCarteGeneree(platform ?? "", cardType);
        console.log("Carte générée automatiquement:", result.shareableUrl);
      }
    },
    onError: (error) => {
      console.error("Erreur lors de la génération automatique:", error);
      captureCarteEchouee(platform ?? "", "generation_echouee");
    },
  });

  const handleGenerateCard = () => {
    if (platform && username?.trim() && cardType) {
      generateCardMutation.mutate({
        platform: platform as Platform,
        username: username.trim(),
        cardType: cardType as CardType,
        useLastAnimeBackground: useLastAnimeBackground === "1",
      });
    }
  };

  const fetchUserData = async () => {
    if (!username?.trim()) {
      setError("Veuillez entrer un nom d'utilisateur");
      return;
    }

    if (!platform) {
      setError("Veuillez sélectionner une plateforme");
      return;
    }

    setIsLoading(true);
    setError(null);

    const params = {
      platform: platform as Platform,
      username: username.trim(),
    };

    fetchUserDataMutation.mutate(params);
  };

  const handleCardGenerated = (cardUrl: string, shareableUrl: string) => {};

  const handleCardTypeChange = async (newCardType: CardType) => {
    await setCardType(newCardType);
    // Régénérer automatiquement la carte avec le nouveau type
    if (userData && platform) {
      generateCardMutation.mutate({
        platform: platform as Platform,
        username: userData.username,
        cardType: newCardType,
        useLastAnimeBackground: useLastAnimeBackground === "1",
      });
    }
  };

  const resetToStart = async () => {
    await setCurrentStep("platform");
    await setPlatform("anilist");
    await setCardType("small");
    await setUsername("");
    setUserData(null);
    setGeneratedCardData(null);
    setError(null);
  };

  /*
   * Les quatre étapes partagent une seule URL — l'état vit dans la query
   * string — donc aucune pageview ne les distingue. Sans ces événements, on
   * saurait combien de gens ouvrent l'accueil et combien repartent avec une
   * carte, mais jamais **où** les autres s'arrêtent.
   */
  const goToNextStep = async () => {
    if (currentStep === "platform") {
      await setCurrentStep("cardType");
      captureEtape("cardType", { platform: platform ?? "" });
    } else if (currentStep === "cardType") {
      await setCurrentStep("username");
      captureEtape("username", { platform: platform ?? "", cardType });
    }
  };

  const goToPreviousStep = async () => {
    if (currentStep === "cardType") await setCurrentStep("platform");
    else if (currentStep === "username") await setCurrentStep("cardType");
    else if (currentStep === "preview") await setCurrentStep("username");
  };

  // L'accueil et l'étape 1 sont une seule et même chose : la hero EST la
  // sélection de plateforme. On ne change donc jamais de page, on replie la
  // scène.
  const isHero = currentStep === "platform";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <CoverWall dimmed={!isHero} />
      <CoverWallVeils dimmed={!isHero} />

      <div className="relative z-10 container mx-auto px-4 pb-12 pt-24 sm:pb-8 sm:pt-28">
        {/* Accroche : disparaît dès qu'on entre dans le wizard */}
        {isHero && (
          <div className="mx-auto mb-8 max-w-3xl sm:mb-10">
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Votre profil anime,
              <br />
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                en une image
              </span>
            </h1>
            <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              Un pseudo, un style. On génère une carte PNG de vos dernières
              séries, avec un lien direct à coller où vous voulez.
            </p>
          </div>
        )}

        {/* Indicateur d'étapes */}
        <div className={cn("justify-center mb-12", isHero ? "hidden" : "flex")}>
          <div className="flex items-center space-x-2 md:space-x-6">
            {["platform", "cardType", "username", "preview"].map(
              (step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2 ${
                      currentStep === step
                        ? "bg-primary text-primary-foreground border-primary"
                        : index <
                          [
                            "platform",
                            "cardType",
                            "username",
                            "preview",
                          ].indexOf(currentStep)
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-card text-muted-foreground border-border"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div
                      className={`w-8 md:w-20 h-0.5 mx-2 md:mx-4 transition-all duration-300 ${
                        index <
                        ["platform", "cardType", "username", "preview"].indexOf(
                          currentStep
                        )
                          ? "bg-green-600"
                          : "bg-border"
                      }`}
                    ></div>
                  )}
                </div>
              )
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Étape 1: Sélection de plateforme */}
          {currentStep === "platform" && (
            <div className="space-y-8">
              {/* Bande horizontale. Elle ne disparaîtra pas au passage à
                  l'étape suivante : elle se compacte et remonte au-dessus du
                  stepper. */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
                {platforms.map((platformOption) => (
                  <div
                    key={platformOption.value}
                    onClick={() =>
                      !platformOption.disabled &&
                      setPlatform(platformOption.value as Platform)
                    }
                    aria-disabled={platformOption.disabled}
                    title={platformOption.disabledReason}
                    className={`relative p-6 sm:p-8 rounded-2xl transition-all duration-300 border border-border/50 backdrop-blur-sm ${
                      platformOption.disabled
                        ? "bg-muted/30 opacity-60 cursor-not-allowed"
                        : platform === platformOption.value
                        ? "bg-primary/5 border-primary/60 shadow-[0_4px_16px_rgba(0,0,0,0.12)] scale-[1.02] cursor-pointer"
                        : "bg-card/50 hover:border-primary/30 hover:bg-card/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:scale-[1.01] cursor-pointer"
                    }`}
                  >
                    <div className="text-center space-y-3 sm:space-y-4">
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <PlatformIcon
                          platform={platformOption.value as Platform}
                          size={48}
                          className="rounded-lg sm:w-16 sm:h-16"
                        />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                        {platformOption.label}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground px-2">
                        {platformOption.description}
                      </p>
                      {platformOption.disabled && (
                        <p className="text-xs sm:text-sm font-medium text-amber-600 dark:text-amber-500 px-2">
                          {platformOption.shortLabel}
                        </p>
                      )}
                    </div>
                    {!platformOption.disabled &&
                      platform === platformOption.value && (
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                      )}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  onClick={goToNextStep}
                  disabled={!platform}
                  className="gap-2 px-7 py-3 text-base font-semibold"
                >
                  Continuer
                  <ArrowRight className="h-[17px] w-[17px]" />
                </Button>
                <a
                  href="#exemples"
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  Voir des exemples
                  <ChevronDown className="h-[17px] w-[17px]" />
                </a>
              </div>
            </div>
          )}

          {/* Étape 2: Sélection du type de carte */}
          {currentStep === "cardType" && (
            <div className="text-center space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Choisissez le type de carte
                </h2>
                <p className="text-xl text-muted-foreground">
                  Sélectionnez le format qui vous convient le mieux
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {cardTypes.map((cardTypeOption) => (
                  <div
                    key={cardTypeOption.value}
                    onClick={() =>
                      setCardType(cardTypeOption.value as CardType)
                    }
                    className={`relative p-6 sm:p-8 rounded-2xl cursor-pointer transition-all duration-300 border border-border/50 backdrop-blur-sm ${
                      cardType === cardTypeOption.value
                        ? "bg-primary/5 border-primary/60 shadow-[0_4px_16px_rgba(0,0,0,0.12)] scale-[1.02]"
                        : "bg-card/50 hover:border-primary/30 hover:bg-card/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:scale-[1.01]"
                    }`}
                  >
                    <div className="text-center space-y-3 sm:space-y-4">
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <CardStyleSvg type={cardTypeOption.value as CardType} size={100} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                        {cardTypeOption.label}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground px-2">
                        {cardTypeOption.description}
                      </p>
                      <div className="text-xs sm:text-sm text-muted-foreground bg-muted px-2 sm:px-3 py-1 rounded-full inline-block">
                        {cardTypeOption.size}
                      </div>
                    </div>
                    {cardType === cardTypeOption.value && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Toggle pour l'arrière-plan du dernier anime */}
              <div className="flex items-center justify-center space-x-3 p-4 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <span className="text-white text-sm">
                  Arrière-plan avec le dernier anime
                </span>
                <button
                  onClick={() =>
                    setUseLastAnimeBackground(
                      useLastAnimeBackground === "1" ? "0" : "1"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useLastAnimeBackground === "1"
                      ? "bg-primary"
                      : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useLastAnimeBackground === "1"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-white/60 text-xs">
                  {useLastAnimeBackground === "1" ? "Activé" : "Désactivé"}
                </span>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={goToPreviousStep}
                  variant="outline"
                  className="px-8 py-3"
                >
                  ← Retour
                </Button>
                <Button
                  onClick={goToNextStep}
                  disabled={!cardType}
                  className="px-8 py-3 text-lg font-semibold"
                >
                  Continuer →
                </Button>
              </div>
            </div>
          )}

          {/* Étape 3: Saisie du nom d'utilisateur */}
          {currentStep === "username" && (
            <div className="text-center space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Entrez votre nom d'utilisateur
                </h2>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <PlatformIcon platform={platform} size={32} />
                  <p className="text-xl text-muted-foreground">
                    Récupérez vos données depuis {platform}
                  </p>
                </div>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex gap-4">
                  <Input
                    placeholder="Entrez votre nom d'utilisateur..."
                    value={username || ""}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && fetchUserData()}
                    className="text-lg py-4"
                  />
                  <Button
                    onClick={fetchUserData}
                    disabled={isLoading || !username?.trim()}
                    className="px-8 py-4 text-lg font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <ButtonLoading size="sm" />
                        Récupération...
                      </div>
                    ) : (
                      "Récupérer"
                    )}
                  </Button>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/20 border border-destructive/30 rounded-xl">
                    <p className="text-destructive">{error}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={goToPreviousStep}
                variant="outline"
                className="px-8 py-3"
              >
                ← Retour
              </Button>
            </div>
          )}

          {/* Étape 4: Prévisualisation */}
          {currentStep === "preview" && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Votre carte personnalisée
                </h2>
                <p className="text-xl text-muted-foreground">
                  Visualisez et téléchargez votre carte générée
                </p>
              </div>

              {userData && (
                <CardPreview
                  userData={userData}
                  platform={platform as Platform}
                  cardType={cardType as CardType}
                  useLastAnimeBackground={useLastAnimeBackground === "1"}
                  onCardGenerated={(cardUrl, shareableUrl) => {
                    setGeneratedCardData({ cardUrl, shareableUrl });
                  }}
                  onCardTypeChange={(newCardType) => {
                    setCardType(newCardType);
                    // Régénérer la carte avec le nouveau type
                    generateCardMutation.mutate({
                      platform: platform as Platform,
                      username: userData.username,
                      cardType: newCardType,
                      useLastAnimeBackground: useLastAnimeBackground === "1",
                    });
                  }}
                  onBackgroundToggle={(useBackground) => {
                    setUseLastAnimeBackground(useBackground ? "1" : "0");
                    // Régénérer la carte avec le nouveau background
                    generateCardMutation.mutate({
                      platform: platform as Platform,
                      username: userData.username,
                      cardType: cardType as CardType,
                      useLastAnimeBackground: useBackground,
                    });
                  }}
                  preGeneratedCard={generatedCardData}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={goToPreviousStep}
                  variant="outline"
                  className="px-6 sm:px-8 py-3 w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">← Modifier les paramètres</span>
                  <span className="sm:hidden">← Modifier</span>
                </Button>
                <Button
                  onClick={resetToStart}
                  variant="outline"
                  className="px-6 sm:px-8 py-3 w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">🔄 Recommencer</span>
                  <span className="sm:hidden">🔄 Recommencer</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-muted-foreground">
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <p>
                {SITE_CONFIG.site.name} utilise les APIs publiques d'AniList et
                MyAnimeList, ainsi que le scraping pour Nautiljon.
              </p>
              <p>
                Les cartes sont générées côté serveur et stockées
                temporairement.
              </p>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
                <p>
                  © 2025{" "}
                  <a
                    href={SITE_CONFIG.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {SITE_CONFIG.company.name}
                  </a>
                </p>
                <span className="hidden sm:inline">•</span>
                <Link href="/terms" className="text-primary hover:underline">
                  Conditions d'utilisation
                </Link>
                <span className="hidden sm:inline">•</span>
                <Link
                  href="/data-deletion"
                  className="text-primary hover:underline"
                >
                  Suppression de données
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
