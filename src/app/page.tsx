"use client";

import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardPreview } from "@/components/CardPreview";
import { Platform, CardType, UserData } from "@/lib/types";
import { isPlatformDisabled } from "@/lib/platformStatus";
import { CoverWall, CoverWallVeils } from "@/components/home/CoverWall";
import { PlatformRail } from "@/components/home/PlatformRail";
import { StepIndicator } from "@/components/home/StepIndicator";
import { Samples } from "@/components/home/Samples";
import { CardTypeStep } from "@/components/home/CardTypeStep";
import { RecentUsernames } from "@/components/home/RecentUsernames";
import { useRecentUsernames } from "@/lib/recentUsernames";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { useQueryState } from "nuqs";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { ButtonLoading } from "@/components/ui/loading";
import { SITE_CONFIG } from "@/lib/constants";
import Link from "next/link";
import { captureCarteEchouee, captureCarteGeneree, captureEtape } from "@/lib/analytics";
import { ArrowLeft, ArrowRight, ChevronDown, Loader2 } from "lucide-react";

type Step = "platform" | "cardType" | "username" | "preview";

/**
 * Bascule accueil ↔ assistant confiée à l'API View Transition.
 *
 * La bande de plateformes est le seul élément présent des deux côtés — elle
 * porte un `view-transition-name`, le navigateur peut donc interpoler sa
 * position et sa taille au lieu de la faire sauter d'un endroit à l'autre.
 *
 * `flushSync` n'est pas une précaution : le navigateur photographie le DOM au
 * retour du callback. Un `setState` asynchrone n'aurait encore rien changé à
 * cet instant, les deux photos seraient identiques et il n'y aurait rien à
 * animer.
 *
 * Là où l'API manque — ou quand le mouvement est refusé — la bascule reste
 * correcte, simplement sans morphing.
 */
function withRailTransition(update: () => void) {
  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => unknown;
  };

  if (
    typeof doc.startViewTransition !== "function" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    return;
  }

  doc.startViewTransition(() => flushSync(update));
}

/**
 * Retour en haut après un changement d'étape.
 *
 * La grille des styles est plus haute qu'un écran : on choisit son format en
 * bas de page, et sans ça l'étape suivante s'ouvrait avec la page toujours
 * défilée — le titre, le fil d'étapes et le champ de saisie hors champ, sur
 * une zone désormais vide. Le défilement est reporté après la peinture, sinon
 * il vise la hauteur de l'étape qu'on vient de quitter.
 */
function backToTop() {
  requestAnimationFrame(() =>
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }))
  );
}

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
  const [recentOpen, setRecentOpen] = useState(false);
  const [isSlowSearch, setIsSlowSearch] = useState(false);
  const recent = useRecentUsernames();

  /*
   * Une recherche prend d'ordinaire moins d'une seconde. Passé trois, le
   * spinner ne dit plus rien d'utile : il tourne aussi bien quand ça avance
   * que quand c'est bloqué. Le message reprend la parole à ce moment-là.
   */
  useEffect(() => {
    if (!isLoading) {
      setIsSlowSearch(false);
      return;
    }
    const timer = setTimeout(() => setIsSlowSearch(true), 3000);
    return () => clearTimeout(timer);
  }, [isLoading]);
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

  const fetchUserDataMutation = trpc.fetchUserData.useMutation({
    onSuccess: async (result) => {
      if (result.success && result.data) {
        setUserData(result.data);
        // Mémorisé sur l'aboutissement, et avec la casse renvoyée par la
        // plateforme plutôt que celle tapée : l'historique doit proposer des
        // pseudos qui existent.
        recent.remember(result.data.username, platform as Platform);
        await setCurrentStep("preview");
        backToTop();
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

  /**
   * `overrideUsername` sert aux entrées de l'historique : `setUsername` passe
   * par nuqs et n'est donc pas immédiat, la valeur choisie ne serait pas
   * encore lisible ici. On la transmet directement plutôt que d'attendre.
   */
  const fetchUserData = async (overrideUsername?: string) => {
    const value = (overrideUsername ?? username ?? "").trim();

    if (!value) {
      setError("Veuillez entrer un nom d'utilisateur");
      return;
    }

    if (!platform) {
      setError("Veuillez sélectionner une plateforme");
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchUserDataMutation.mutate({
      platform: platform as Platform,
      username: value,
    });
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
      // Seule bascule où la bande de plateformes change de place.
      withRailTransition(() => {
        setCurrentStep("cardType");
        captureEtape("cardType", { platform: platform ?? "" });
      });
    } else if (currentStep === "cardType") {
      await setCurrentStep("username");
      captureEtape("username", { platform: platform ?? "", cardType });
    }
    backToTop();
  };

  const goToPreviousStep = async () => {
    if (currentStep === "cardType")
      withRailTransition(() => setCurrentStep("platform"));
    else if (currentStep === "username") await setCurrentStep("cardType");
    else if (currentStep === "preview") await setCurrentStep("username");
    backToTop();
  };

  // L'accueil et l'étape 1 sont une seule et même chose : la hero EST la
  // sélection de plateforme. On ne change donc jamais de page, on replie la
  // scène.
  const isHero = currentStep === "platform";

  return (
    <>
      {/*
       * La scène tient l'écran entier et le mur y est confiné. Aucun
       * `container` ici : le prototype pose `width:min(1120px,92vw)` sur la
       * seule colonne de contenu et laisse le fond courir jusqu'aux bords. Un
       * `container mx-auto` bridait le contenu au centre pendant que le mur,
       * lui, prenait toute la largeur — les deux ne parlaient plus de la même
       * page.
       *
       * `min-h-svh` et non `min-h-screen` : sur mobile, `100vh` compte la
       * barre d'adresse qui n'est pas là, et le bas de la hero passait sous
       * le pli.
       */}
      <section className="relative flex min-h-svh flex-col overflow-hidden bg-background">
        <CoverWall dimmed={!isHero} />
        <CoverWallVeils dimmed={!isHero} />

        {/*
         * Le contenu est centré dans ce qui reste sous la navbar flottante,
         * pas dans l'écran : d'où un rembourrage haut plus épais que le bas.
         * L'écart des deux (80 px) vaut deux fois le décalage recherché, la
         * navbar faisant environ 80 px de haut.
         */}
        {/*
         * L'accroche est centrée dans ce qui reste sous la navbar flottante,
         * pas dans l'écran : d'où un rembourrage haut plus épais que le bas,
         * leur écart valant deux fois le décalage recherché.
         *
         * L'assistant en demande moins. Son contenu est long — l'aperçu tient
         * deux colonnes et une bande de formats — et ces 48 px de respiration
         * en trop suffisaient à le pousser sous le pli.
         */}
        <div
          className={cn(
            "relative z-10 mx-auto flex w-[min(1120px,92vw)] flex-1 flex-col justify-center",
            isHero
              ? "pb-16 pt-[132px] sm:pb-20 sm:pt-40"
              : "pb-12 pt-[108px] sm:pb-16 sm:pt-28"
          )}
        >
          {/* Accroche. Elle disparaît entièrement dès qu'on entre dans
              l'assistant : la place qu'elle libère est exactement celle dont
              le stepper et le panneau ont besoin. */}
          {isHero && (
            <>
              <div className="hero-rise">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-[12.5px] font-medium text-muted-foreground backdrop-blur-md">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  {/* Un seul enfant de flex, sinon le `gap` du conteneur
                      s'insère aussi entre les fragments de la phrase. */}
                  <span>
                    Sans compte · 7 styles
                    <span className="hidden sm:inline">
                      {" · mise à jour automatique"}
                    </span>
                  </span>
                </span>
              </div>

              <div className="hero-rise mt-6 [--rise-delay:80ms] sm:mt-7">
                <h1 className="text-[clamp(36px,5vw,58px)] font-bold leading-[1.04] tracking-[-0.025em] text-foreground">
                  Votre profil anime,
                  <br />
                  <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                    en une image
                  </span>
                </h1>
                <p className="mt-[18px] max-w-[52ch] text-[16.5px] leading-[1.55] text-muted-foreground">
                  Un pseudo, un style. On génère une carte PNG de vos dernières
                  séries, avec un lien direct à coller où vous voulez.
                </p>
              </div>
            </>
          )}

          {/* Pivot de la page : la bande existe dans les deux états. Elle ne
              disparaît pas au passage à l'assistant, elle se compacte et vient
              se recentrer au-dessus du stepper. */}
          <div
            className={cn(
              isHero ? "hero-rise mt-8 [--rise-delay:160ms]" : "mb-[26px]"
            )}
          >
            <PlatformRail
              selected={platform as Platform}
              onSelect={(value) => setPlatform(value)}
              compact={!isHero}
            />
          </div>

          {isHero ? (
            <div className="hero-rise mt-[30px] flex items-center gap-3 [--rise-delay:240ms]">
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!platform}
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5 text-[15px] font-semibold text-primary-foreground transition-transform duration-200 disabled:pointer-events-none disabled:opacity-50 motion-safe:hover:-translate-y-0.5 sm:px-[26px]"
                style={{
                  background:
                    "linear-gradient(92deg, var(--primary), color-mix(in srgb, var(--primary) 62%, white))",
                  boxShadow:
                    "0 10px 28px color-mix(in srgb, var(--primary) 32%, transparent)",
                }}
              >
                Continuer
                <ArrowRight className="h-[17px] w-[17px] transition-transform duration-200 group-hover:translate-x-[3px]" />
              </button>
              <a
                href="#exemples"
                className="group inline-flex items-center justify-center gap-2.5 rounded-xl border border-border/70 px-5 py-3.5 text-[15px] font-semibold text-foreground transition-colors hover:bg-accent/60 sm:px-6"
              >
                <span className="sm:hidden">Exemples</span>
                <span className="hidden sm:inline">Voir des exemples</span>
                <ChevronDown className="h-[17px] w-[17px] transition-transform duration-200 group-hover:translate-y-[2px]" />
              </a>
            </div>
          ) : (
            <StepIndicator current={currentStep as Step} />
          )}

          {/* L'aperçu reprend toute la largeur de la scène : ses deux colonnes
              ne tiennent pas dans les 896 px qui conviennent à un formulaire. */}
          <div
            className={cn(
              "mx-auto w-full",
              currentStep === "preview" ? "max-w-none" : "max-w-4xl"
            )}
          >
            {/* Étape 2: Sélection du type de carte */}
            {currentStep === "cardType" && (
              <CardTypeStep
                cardType={cardType as CardType}
                onSelect={(value) => setCardType(value)}
                useBackground={useLastAnimeBackground === "1"}
                onBackgroundChange={(value) =>
                  setUseLastAnimeBackground(value ? "1" : "0")
                }
                onBack={goToPreviousStep}
                onContinue={goToNextStep}
              />
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

                <div className="mx-auto max-w-2xl space-y-6">
                  {/* Empilés sur mobile : côte à côte, il restait moins de
                      200 px au champ et le libellé y était tronqué. */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    {/* `relative` : c'est l'ancrage du panneau des recherches
                        récentes, qui se pose sous le champ. */}
                    <div className="relative flex-1">
                      <Input
                        placeholder="Entrez votre nom d'utilisateur..."
                        value={username || ""}
                        onChange={(e) => setUsername(e.target.value)}
                        onFocus={() => setRecentOpen(true)}
                        onBlur={() => setRecentOpen(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") fetchUserData();
                          if (e.key === "Escape") setRecentOpen(false);
                        }}
                        className="w-full py-4 text-lg"
                      />
                      <RecentUsernames
                        open={recentOpen}
                        entries={recent.shown}
                        onPick={(value) => {
                          setRecentOpen(false);
                          setUsername(value);
                          fetchUserData(value);
                        }}
                        onForget={recent.forget}
                      />
                    </div>
                    <Button
                      onClick={() => fetchUserData()}
                      disabled={isLoading || !username?.trim()}
                      className="w-full px-8 py-4 text-lg font-semibold sm:w-auto"
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

                  {/*
                   * Passé trois secondes, l'attente cesse d'être lisible comme
                   * un chargement : on ne sait plus si ça avance ou si c'est
                   * cassé. Le message ne fait que redonner cette information.
                   */}
                  <AnimatePresence>
                    {isSlowSearch && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.22, 0.9, 0.24, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 text-left backdrop-blur-sm">
                          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">
                            Ça prend un peu plus de temps que d'habitude.
                            Patientez quelques instants, ça arrive.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/20 p-4">
                      <p className="text-destructive">{error}</p>
                    </div>
                  )}
                </div>

                <Button
                  onClick={goToPreviousStep}
                  variant="outline"
                  className="gap-2 px-8 py-3"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
              </div>
            )}

            {/* Étape 4: Prévisualisation.
                Pas de titre ici : le fil d'étapes affiche déjà « Aperçu »
                juste au-dessus, et ces deux lignes de plus poussaient la
                colonne de partage sous le pli. */}
            {currentStep === "preview" && (
              <div>
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
                    /* Modifier et Recommencer sont absorbés par la colonne
                       de droite : ils faisaient partie de « et ensuite »,
                       pas d'une barre isolée en pied d'écran. */
                    onBack={goToPreviousStep}
                    onRestart={resetToStart}
                    preGeneratedCard={generatedCardData}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cible de l'ancre « Voir des exemples ». Elle vit hors de la scène :
          le mur est confiné à la hauteur d'écran, la page continue en dessous
          sur un fond net. */}
      <Samples />

      {/* Footer */}
      <footer className="mx-auto w-[min(1120px,92vw)] pb-12 text-center text-muted-foreground">
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
      </footer>
    </>
  );
}
