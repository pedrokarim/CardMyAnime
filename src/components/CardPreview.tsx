"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { UserData, CardType, Platform } from "@/lib/types";
import { CARD_DIMENSIONS } from "@/lib/cards/cardTypes";
import { CARD_TYPE_OPTIONS } from "@/lib/cardTypeOptions";
import { trpc } from "@/lib/trpc/client";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { CardLoading } from "@/components/ui/loading";
import { SharePanel } from "@/components/preview/SharePanel";
import { ProfileDetails } from "@/components/preview/ProfileDetails";
import { cn } from "@/lib/utils";

interface CardPreviewProps {
  userData: UserData;
  platform: string;
  cardType: CardType;
  useLastAnimeBackground: boolean;
  onCardGenerated: (cardUrl: string, shareableUrl: string) => void;
  onCardTypeChange?: (cardType: CardType) => void;
  onBackgroundToggle?: (useBackground: boolean) => void;
  onBack?: () => void;
  onRestart?: () => void;
  preGeneratedCard?: {
    cardUrl: string;
    shareableUrl: string;
  } | null;
}

/**
 * Écran d'aperçu.
 *
 * L'écran précédent était une colonne : un pavé de statistiques, puis les
 * derniers animes, puis les favoris, puis deux boutons de configuration, puis
 * un sélecteur qu'il fallait déplier, puis enfin la carte, puis le partage.
 * Trois hauteurs de fenêtre avant d'avoir vu ce qu'on était venu chercher.
 *
 * Il est réorganisé en deux questions posées côte à côte :
 *
 * - **à gauche, à quoi elle ressemble** — la carte, et juste dessous la bande
 *   des sept formats. Le choix du format était derrière un bouton « Changer
 *   le type » qui dépliait un second panneau ; il coûte maintenant un clic.
 * - **à droite, comment je la récupère** — lien, téléchargement, codes
 *   d'intégration, réseaux, options, et la sortie.
 *
 * Le reste du profil passe dans un bloc replié : il est déjà dessiné sur la
 * carte, le répéter en grand au-dessus d'elle ne renseignait personne.
 */
export function CardPreview({
  userData,
  platform,
  cardType,
  useLastAnimeBackground,
  onCardGenerated,
  onCardTypeChange,
  onBackgroundToggle,
  onBack,
  onRestart,
  preGeneratedCard,
}: CardPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialGeneration, setIsInitialGeneration] = useState(
    !preGeneratedCard?.cardUrl
  );
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string | null>(
    preGeneratedCard?.cardUrl || null
  );
  const [shareableUrl, setShareableUrl] = useState<string | null>(
    preGeneratedCard?.shareableUrl || null
  );

  useEffect(() => {
    if (preGeneratedCard) {
      setGeneratedCardUrl(preGeneratedCard.cardUrl);
      setShareableUrl(preGeneratedCard.shareableUrl);
      setIsInitialGeneration(false);
    }
  }, [preGeneratedCard]);

  const generateCardMutation = trpc.generateCard.useMutation({
    onSuccess: (result) => {
      if (result.success && result.cardUrl && result.shareableUrl) {
        setGeneratedCardUrl(result.cardUrl);
        setShareableUrl(result.shareableUrl);
        onCardGenerated?.(result.cardUrl, result.shareableUrl);
      }
      setIsGenerating(false);
      setIsInitialGeneration(false);
    },
    onError: (error) => {
      console.error("Erreur lors de la génération:", error);
      setIsGenerating(false);
      setIsInitialGeneration(false);
    },
  });

  useEffect(() => {
    if (isInitialGeneration && userData && !isGenerating) {
      setIsGenerating(true);
      generateCardMutation.mutate({
        platform: platform as Platform,
        username: userData.username,
        cardType,
        useLastAnimeBackground,
      });
    }
  }, [isInitialGeneration, userData]);

  const handleBackgroundToggle = (value: boolean) => {
    onBackgroundToggle?.(value);
    if (userData) {
      setIsGenerating(true);
      generateCardMutation.mutate({
        platform: platform as Platform,
        username: userData.username,
        cardType,
        useLastAnimeBackground: value,
      });
    }
  };

  const downloadCard = () => {
    if (!generatedCardUrl) return;
    const link = document.createElement("a");
    link.download = `anime-card-${userData?.username}-${cardType}.png`;
    link.href = generatedCardUrl;
    link.click();
  };

  const dimensions = CARD_DIMENSIONS[cardType];
  const busy = isGenerating || isInitialGeneration;

  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const absoluteCardUrl = shareableUrl ? `${siteUrl}${shareableUrl}` : "";

  /*
   * Une date d'inscription absente ou nulle revient du côté serveur en `0`,
   * que `new Date` traduit fidèlement par le 1er janvier 1970. Affiché tel
   * quel, ça se lit comme une donnée et non comme un trou : la ligne est
   * simplement omise sous un plancher de plausibilité — aucune des deux
   * plateformes n'existait avant 2004.
   */
  const joinedOn = (() => {
    const raw = userData?.profile?.joinDate;
    if (!raw) return null;
    const date = new Date(raw);
    if (isNaN(date.getTime())) return null;
    if (date.getFullYear() < 2000) return null;
    return date.toLocaleDateString("fr-FR");
  })();

  const stats = [
    { value: userData?.stats.animesSeen, label: "animes" },
    { value: userData?.stats.mangasRead, label: "mangas" },
    { value: userData?.stats.totalEpisodes, label: "épisodes" },
    {
      value: userData?.stats.avgScore
        ? userData.stats.avgScore.toLocaleString("fr-FR")
        : undefined,
      label: "note moy.",
    },
  ].filter((stat) => stat.value !== undefined && stat.value !== 0);

  return (
    <div>
      {/* Bandeau d'identité. Une ligne, pas un pavé : ces chiffres sont déjà
          dessinés sur la carte juste en dessous. */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/60 bg-card/60 px-4 py-3.5 backdrop-blur-sm">
        <img
          src={userData?.avatarUrl || "/images/avatar-fallback.png"}
          alt=""
          className="h-11 w-11 shrink-0 rounded-full border-2 border-primary object-cover"
          onError={(event) => {
            (event.target as HTMLImageElement).src =
              "/images/avatar-fallback.png";
          }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-foreground">
              {userData?.username}
            </span>
            <PlatformIcon platform={platform as Platform} size={16} />
          </div>
          {joinedOn && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Membre depuis {joinedOn}
            </p>
          )}
        </div>

        <div className="ml-auto flex flex-wrap gap-x-6 gap-y-2">
          {stats.map((stat) => (
            <div key={stat.label} className="text-left sm:text-right">
              <b className="block text-[17px] font-semibold leading-tight text-foreground">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("fr-FR")
                  : stat.value}
              </b>
              <span className="text-[11px] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Colonne de gauche : la carte et ce qui la change. */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
          <div className="grid min-h-[280px] place-items-center rounded-xl border border-border/40 bg-gradient-to-br from-white/[.04] to-white/[.01] p-3.5">
            {busy ? (
              <CardLoading
                message={
                  isInitialGeneration
                    ? "Génération de votre carte..."
                    : "Régénération de votre carte..."
                }
              />
            ) : generatedCardUrl ? (
              <img
                src={generatedCardUrl}
                alt={`Carte ${cardType} de ${userData?.username}`}
                className="max-h-[340px] w-auto max-w-full rounded-lg shadow-[0_18px_44px_rgba(0,0,0,.55)]"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                La carte n'a pas pu être générée.
              </p>
            )}
          </div>

          <div className="mt-2.5 flex justify-center">
            <span className="rounded-full border border-border/70 px-2.5 py-0.5 text-[11.5px] text-muted-foreground">
              {dimensions.width} × {dimensions.height} px — PNG
            </span>
          </div>

          <p className="mb-2 mt-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Format de la carte
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CARD_TYPE_OPTIONS.map((option) => {
              const active = option.value === cardType;
              const { width, height } = CARD_DIMENSIONS[option.value];
              // La silhouette dit le rapport de forme, pas la taille : à
              // l'échelle réelle « Petite » serait un trait de 15 px et les
              // sept vignettes se ressembleraient toutes.
              const shapeWidth = Math.min(58, Math.round((20 * width) / height));

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  disabled={busy}
                  onClick={() => onCardTypeChange?.(option.value)}
                  className={cn(
                    "w-[84px] shrink-0 rounded-xl border px-1.5 py-2 text-center transition-all duration-200",
                    "disabled:pointer-events-none disabled:opacity-50",
                    active
                      ? "border-primary/70 bg-primary/12"
                      : "border-border/60 bg-white/[.02] hover:border-foreground/25 motion-safe:hover:-translate-y-0.5"
                  )}
                >
                  <span className="mb-1.5 grid h-[30px] place-items-center rounded-md border border-border/40 bg-muted/50">
                    <span
                      className={cn(
                        "block rounded-[2px]",
                        active ? "bg-primary/80" : "bg-muted-foreground/45"
                      )}
                      style={{ width: shapeWidth, height: 20 }}
                    />
                  </span>
                  <b className="block text-[11.5px] font-semibold text-foreground">
                    {option.label}
                  </b>
                  <span className="text-[9.5px] text-muted-foreground">
                    {width}×{height}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Colonne de droite : ce qu'on fait de la carte. */}
        <div className="flex flex-col gap-3">
          <SharePanel
            cardUrl={absoluteCardUrl}
            siteUrl={siteUrl}
            username={userData.username}
            cardType={cardType}
            onDownload={downloadCard}
            disabled={busy || !generatedCardUrl}
          />

          <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
            <h3 className="mb-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
              Options
            </h3>
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] text-foreground">Arrière-plan</p>
                <p className="text-[11px] text-muted-foreground">
                  La jaquette du dernier anime suivi
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={useLastAnimeBackground}
                aria-label="Arrière-plan avec le dernier anime"
                disabled={busy}
                onClick={() => handleBackgroundToggle(!useLastAnimeBackground)}
                className={cn(
                  "relative inline-flex h-[22px] w-10 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
                  useLastAnimeBackground
                    ? "bg-primary"
                    : "bg-muted-foreground/40"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                    useLastAnimeBackground ? "translate-x-[21px]" : "translate-x-[3px]"
                  )}
                />
              </button>
            </div>
          </div>

          {(onBack || onRestart) && (
            <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm">
              <h3 className="mb-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">
                Et ensuite
              </h3>
              <div className="flex gap-2">
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/70 py-2.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-accent/60"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Modifier
                  </button>
                )}
                {onRestart && (
                  <button
                    type="button"
                    onClick={onRestart}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/70 py-2.5 text-[12.5px] font-medium text-foreground transition-colors hover:bg-accent/60"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Recommencer
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ProfileDetails userData={userData} />
    </div>
  );
}
