"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardPreview } from "@/components/CardPreview";
import { Platform, CardType, UserData } from "@/lib/types";
import { trpc } from "@/lib/trpc/client";
import { useQueryState } from "nuqs";
import Image from "next/image";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { motion, AnimatePresence } from "framer-motion";
import { ButtonLoading } from "@/components/ui/loading";
import { SITE_CONFIG } from "@/lib/constants";
import Link from "next/link";
import { CardStyleSvg } from "@/components/CardStyleSvg";
import { captureCarteEchouee, captureCarteGeneree, captureEtape } from "@/lib/analytics";

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
      if (["anilist", "mal", "nautiljon"].includes(value)) {
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
  ];

  const cardTypes = [
    {
      value: "small",
      label: "Petite",
      description: "Avatar + pseudo + 3 derniers animes",
      size: "400×200",
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block mb-8">
            {/* Logo et titre - avec AnimatePresence pour libérer l'espace */}
            <AnimatePresence>
              {currentStep === "platform" && (
                <motion.div
                  initial={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.3, opacity: 0, y: -50 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div className="flex justify-center mb-6">
                    <Image
                      src={SITE_CONFIG.site.logo}
                      alt={`${SITE_CONFIG.site.name} Logo`}
                      width={120}
                      height={120}
                    />
                  </div>
                  {/* Titre et sous-titre */}
                  <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                      {SITE_CONFIG.site.name}
                    </h1>
                    <p className="text-xl text-gray-300">
                      Générez vos cartes de profil anime personnalisées
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {SITE_CONFIG.site.description}
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex justify-center mb-12">
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
            <div className="text-center space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  Choisissez votre plateforme
                </h2>
                <p className="text-xl text-muted-foreground">
                  Sélectionnez la plateforme d'anime de votre choix
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {platforms.map((platformOption) => (
                  <div
                    key={platformOption.value}
                    onClick={() =>
                      setPlatform(platformOption.value as Platform)
                    }
                    className={`relative p-6 sm:p-8 rounded-2xl cursor-pointer transition-all duration-300 border border-border/50 backdrop-blur-sm ${
                      platform === platformOption.value
                        ? "bg-primary/5 border-primary/60 shadow-[0_4px_16px_rgba(0,0,0,0.12)] scale-[1.02]"
                        : "bg-card/50 hover:border-primary/30 hover:bg-card/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:scale-[1.01]"
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
                    </div>
                    {platform === platformOption.value && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-3 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={goToNextStep}
                disabled={!platform}
                className="px-8 py-3 text-lg font-semibold"
              >
                Continuer →
              </Button>
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
