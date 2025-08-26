"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserData, CardType } from "@/lib/types";
import { generateSmallCard } from "@/lib/cards/smallCard";
import { generateMediumCard } from "@/lib/cards/mediumCard";
import { generateLargeCard } from "@/lib/cards/largeCard";
import { generateSummaryCard } from "@/lib/cards/summaryCard";
import ShareOptions from "./ShareOptions";
import { trpc } from "@/lib/trpc/client";
import { PlatformIcon } from "@/components/ui/platform-icon";

interface CardPreviewProps {
  userData: UserData;
  platform: string;
  cardType: CardType;
  useLastAnimeBackground: boolean;
  onCardGenerated: (cardUrl: string, shareableUrl: string) => void;
  onCardTypeChange?: (cardType: CardType) => void;
  preGeneratedCard?: {
    cardUrl: string;
    shareableUrl: string;
  } | null;
}

const cardGenerators = {
  small: generateSmallCard,
  medium: generateMediumCard,
  large: generateLargeCard,
  summary: generateSummaryCard,
};

const cardDimensions = {
  small: { width: 400, height: 200 },
  medium: { width: 600, height: 300 },
  large: { width: 800, height: 500 },
  summary: { width: 800, height: 600 },
};

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
    description: "Stats détaillées avec derniers animes/mangas",
    size: "600×400",
    icon: "📈",
  },
];

export function CardPreview({
  userData,
  platform,
  cardType,
  useLastAnimeBackground,
  onCardGenerated,
  onCardTypeChange,
  preGeneratedCard,
}: CardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCardTypeSelector, setShowCardTypeSelector] = useState(false);
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string | null>(
    preGeneratedCard?.cardUrl || null
  );
  const [shareableUrl, setShareableUrl] = useState<string | null>(
    preGeneratedCard?.shareableUrl || null
  );

  // Mettre à jour les données quand preGeneratedCard change
  useEffect(() => {
    if (preGeneratedCard) {
      setGeneratedCardUrl(preGeneratedCard.cardUrl);
      setShareableUrl(preGeneratedCard.shareableUrl);
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
    },
    onError: (error) => {
      console.error("Erreur lors de la génération:", error);
      setIsGenerating(false);
    },
  });

  const generateCard = async () => {
    if (!userData) return;

    setIsGenerating(true);
    generateCardMutation.mutate({
      platform: platform as any,
      username: userData.username,
      cardType: cardType,
      useLastAnimeBackground: useLastAnimeBackground,
    });
  };

  const downloadCard = () => {
    if (!generatedCardUrl) return;

    const link = document.createElement("a");
    link.download = `anime-card-${userData?.username}-${cardType}.png`;
    link.href = generatedCardUrl;
    link.click();
  };

  const dimensions = cardDimensions[cardType];

  return (
    <div className="space-y-8">
      {/* Informations utilisateur */}
      <div className="bg-card rounded-xl p-8 border border-border">
        <div className="flex items-center gap-6 mb-6">
          <img
            src={userData?.avatarUrl}
            alt={`Avatar de ${userData?.username}`}
            className="w-20 h-20 rounded-full border-2 border-primary shadow-lg"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-foreground">
                {userData?.username}
              </h3>
              <PlatformIcon platform={platform as any} size={24} />
            </div>
            <div className="flex gap-8 text-lg text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                {userData?.stats.animesSeen} animes
              </span>
              <span className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                {userData?.stats.mangasRead} mangas
              </span>
              {userData?.stats.avgScore && userData.stats.avgScore > 0 && (
                <span className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  {userData.stats.avgScore}/10
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Derniers animes/mangas */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <span className="text-xl">🎬</span>
              Derniers animes
            </h4>
            <div className="space-y-2">
              {userData?.lastAnimes.slice(0, 3).map((anime, index) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground truncate flex items-center gap-2"
                >
                  <span className="text-primary font-bold">{index + 1}.</span>
                  {anime.title}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <span className="text-xl">📚</span>
              Derniers mangas
            </h4>
            <div className="space-y-2">
              {userData?.lastMangas.slice(0, 3).map((manga, index) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground truncate flex items-center gap-2"
                >
                  <span className="text-primary font-bold">{index + 1}.</span>
                  {manga.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bouton pour afficher/masquer le sélecteur de type de carte */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowCardTypeSelector(!showCardTypeSelector)}
          variant="outline"
          className="px-6 py-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🎨</span>
            {showCardTypeSelector
              ? "Masquer les types de cartes"
              : "Changer le type de carte"}
          </div>
        </Button>
      </div>

      {/* Sélecteur de type de carte */}
      {showCardTypeSelector && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-xl font-bold text-foreground mb-4 text-center">
            Changer le type de carte
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cardTypes.map((cardTypeOption) => (
              <div
                key={cardTypeOption.value}
                onClick={() =>
                  onCardTypeChange?.(cardTypeOption.value as CardType)
                }
                className={`relative p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                  cardType === cardTypeOption.value
                    ? "bg-primary/10 border-primary shadow-lg"
                    : "bg-card border-border hover:border-primary/50 hover:bg-card/80"
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-3xl mb-2">{cardTypeOption.icon}</div>
                  <h4 className="font-semibold text-foreground text-sm">
                    {cardTypeOption.label}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {cardTypeOption.description}
                  </p>
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full inline-block">
                    {cardTypeOption.size}
                  </div>
                </div>
                {cardType === cardTypeOption.value && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone de prévisualisation */}
      <div className="flex justify-center">
        <div className="relative">
          <div
            className="relative rounded-xl overflow-hidden shadow-lg border border-border bg-card"
            style={{
              width: Math.min(dimensions.width, 600),
              height: Math.min(dimensions.height, 500),
            }}
          >
            {generatedCardUrl ? (
              <img
                src={generatedCardUrl}
                alt="Carte générée"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-4">🎨</div>
                  <p className="text-lg font-medium mb-2">
                    Carte générée automatiquement
                  </p>
                  <p className="text-sm">
                    Votre carte a été générée avec succès
                  </p>
                  <p className="text-xs mt-3 text-muted-foreground">
                    {dimensions.width} × {dimensions.height}px
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Indicateur de taille */}
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-full shadow-lg font-medium">
              {dimensions.width} × {dimensions.height}
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-6 justify-center">
        {generatedCardUrl && (
          <ShareOptions
            shareableUrl={shareableUrl}
            username={userData.username}
            platform={platform || ""}
            cardType={cardType}
            useLastAnimeBackground={useLastAnimeBackground}
          />
        )}
      </div>
    </div>
  );
}
