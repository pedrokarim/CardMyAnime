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
      if (["small", "medium", "large", "summary"].includes(value)) {
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
  ];

  const fetchUserDataMutation = trpc.fetchUserData.useMutation({
    onSuccess: async (result) => {
      if (result.success && result.data) {
        setUserData(result.data);
        await setCurrentStep("preview");
        // Générer automatiquement la carte après avoir récupéré les données
        generateCardMutation.mutate({
          platform: platform as Platform,
          username: username?.trim() || "",
          cardType: cardType,
          useLastAnimeBackground: useLastAnimeBackground === "1",
        });
      } else {
        setError(result.error || "Erreur lors de la récupération des données");
      }
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Erreur tRPC:", error);
      setError("Erreur de connexion - Vérifiez le nom d'utilisateur");
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
        console.log("Carte générée automatiquement:", result.shareableUrl);
      }
    },
    onError: (error) => {
      console.error("Erreur lors de la génération automatique:", error);
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

  const goToNextStep = async () => {
    if (currentStep === "platform") await setCurrentStep("cardType");
    else if (currentStep === "cardType") await setCurrentStep("username");
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
                      src="/images/cma-logo.png"
                      alt="CardMyAnime Logo"
                      width={120}
                      height={120}
                    />
                  </div>
                  {/* Titre et sous-titre */}
                  <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                      CardMyAnime
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
            Créez des cartes de profil dynamiques et élégantes pour vos
            plateformes d'anime préférées
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-6">
            {["platform", "cardType", "username", "preview"].map(
              (step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2 ${
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
                      className={`w-20 h-0.5 mx-4 transition-all duration-300 ${
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {platforms.map((platformOption) => (
                  <div
                    key={platformOption.value}
                    onClick={() =>
                      setPlatform(platformOption.value as Platform)
                    }
                    className={`relative p-8 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                      platform === platformOption.value
                        ? "bg-primary/10 border-primary shadow-lg"
                        : "bg-card border-border hover:border-primary/50 hover:bg-card/80"
                    }`}
                  >
                    <div className="text-center space-y-4">
                      <div className="flex justify-center mb-4">
                        <PlatformIcon
                          platform={platformOption.value as Platform}
                          size={64}
                          className="rounded-lg"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {platformOption.label}
                      </h3>
                      <p className="text-muted-foreground">
                        {platformOption.description}
                      </p>
                    </div>
                    {platform === platformOption.value && (
                      <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full"></div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cardTypes.map((cardTypeOption) => (
                  <div
                    key={cardTypeOption.value}
                    onClick={() =>
                      setCardType(cardTypeOption.value as CardType)
                    }
                    className={`relative p-8 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                      cardType === cardTypeOption.value
                        ? "bg-primary/10 border-primary shadow-lg"
                        : "bg-card border-border hover:border-primary/50 hover:bg-card/80"
                    }`}
                  >
                    <div className="text-center space-y-4">
                      <div className="text-5xl mb-4">{cardTypeOption.icon}</div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {cardTypeOption.label}
                      </h3>
                      <p className="text-muted-foreground">
                        {cardTypeOption.description}
                      </p>
                      <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full inline-block">
                        {cardTypeOption.size}
                      </div>
                    </div>
                    {cardType === cardTypeOption.value && (
                      <div className="absolute top-4 right-4 w-3 h-3 bg-primary rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Toggle pour l'arrière-plan du dernier anime */}
              <div className="flex items-center justify-center space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
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
                  preGeneratedCard={generatedCardData}
                />
              )}

              <div className="text-center space-x-4">
                <Button
                  onClick={goToPreviousStep}
                  variant="outline"
                  className="px-8 py-3"
                >
                  ← Modifier les paramètres
                </Button>
                <Button
                  onClick={resetToStart}
                  variant="outline"
                  className="px-8 py-3"
                >
                  🔄 Recommencer
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-muted-foreground">
          <div className="flex flex-col gap-2 text-sm">
            <p>
              CardMyAnime utilise les APIs publiques d'AniList et MyAnimeList,
              ainsi que le scraping pour Nautiljon.
            </p>
            <p>
              Les cartes sont générées côté serveur et stockées temporairement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
