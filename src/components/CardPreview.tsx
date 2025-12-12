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
import { CardLoading } from "@/components/ui/loading";

interface CardPreviewProps {
  userData: UserData;
  platform: string;
  cardType: CardType;
  useLastAnimeBackground: boolean;
  onCardGenerated: (cardUrl: string, shareableUrl: string) => void;
  onCardTypeChange?: (cardType: CardType) => void;
  onBackgroundToggle?: (useBackground: boolean) => void;
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
  onBackgroundToggle,
  preGeneratedCard,
}: CardPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialGeneration, setIsInitialGeneration] = useState(
    !preGeneratedCard?.cardUrl
  );
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
      setIsInitialGeneration(false);
    }
  }, [preGeneratedCard]);

  // Génération automatique si aucune carte n'est pré-générée
  useEffect(() => {
    if (isInitialGeneration && userData && !isGenerating) {
      generateCard();
    }
  }, [isInitialGeneration, userData]);

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

  const handleBackgroundToggle = (newBackgroundValue: boolean) => {
    onBackgroundToggle?.(newBackgroundValue);

    // Régénérer automatiquement la carte avec le nouveau background
    if (userData) {
      setIsGenerating(true);
      generateCardMutation.mutate({
        platform: platform as any,
        username: userData.username,
        cardType: cardType,
        useLastAnimeBackground: newBackgroundValue,
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

  const dimensions = cardDimensions[cardType];

  return (
    <div className="space-y-8">
      {/* Informations utilisateur */}
      <div className="bg-card/50 rounded-2xl p-8 border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
        {isGenerating && (
          <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-primary font-medium">
                Régénération de la carte en cours...
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-6">
          <img
            src={userData?.avatarUrl || "/images/avatar-fallback.png"}
            alt={`Avatar de ${userData?.username}`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-primary shadow-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/avatar-fallback.png";
            }}
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                {userData?.username}
              </h3>
              <PlatformIcon platform={platform as any} size={20} className="mx-auto sm:mx-0" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="text-xl">🎬</span>
                {userData?.stats.animesSeen} animes
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xl">📚</span>
                {userData?.stats.mangasRead} mangas
              </span>
              {userData?.stats.avgScore && userData.stats.avgScore > 0 && (
                <span className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  {userData.stats.avgScore}/10
                </span>
              )}
              {userData?.stats.totalEpisodes && (
                <span className="flex items-center gap-2">
                  <span className="text-xl">📺</span>
                  {userData.stats.totalEpisodes} épisodes
                </span>
              )}
              {userData?.stats.totalChapters && (
                <span className="flex items-center gap-2">
                  <span className="text-xl">📖</span>
                  {userData.stats.totalChapters} chapitres
                </span>
              )}
              {userData?.stats.daysWatched && (
                <span className="flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  {userData.stats.daysWatched} jours
                </span>
              )}
              {userData?.stats.watchingCount && (
                <span className="flex items-center gap-2">
                  <span className="text-xl">▶️</span>
                  {userData.stats.watchingCount} en cours
                </span>
              )}
              {userData?.stats.completedCount && (
                <span className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  {userData.stats.completedCount} terminés
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Informations de profil supplémentaires */}
        {(userData?.profile ||
          userData?.personalMessage ||
          userData?.stats.favoriteGenres) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {userData?.personalMessage && (
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30 backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  Message personnel
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {userData.personalMessage}
                </p>
              </div>
            )}

            {userData?.profile?.joinDate && (
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30 backdrop-blur-sm">
                <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                  <span className="text-lg">📅</span>
                  Membre depuis
                </h4>
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const date = new Date(userData.profile.joinDate);
                    return isNaN(date.getTime())
                      ? userData.profile.joinDate
                      : date.toLocaleDateString("fr-FR");
                  })()}
                </p>
                {userData.profile.memberDays && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ({userData.profile.memberDays} jours)
                  </p>
                )}
              </div>
            )}

            {userData?.stats.favoriteGenres &&
              userData.stats.favoriteGenres.length > 0 && (
                <div className="bg-muted/20 rounded-xl p-4 border border-border/30 backdrop-blur-sm">
                  <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                    <span className="text-lg">🎭</span>
                    Genres favoris
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {userData.stats.favoriteGenres
                      .slice(0, 5)
                      .map((genre, index) => (
                        <span
                          key={index}
                          className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Derniers animes/mangas */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <span className="text-xl">🎬</span>
              Derniers animes
            </h4>
            <div className="space-y-2">
              {userData?.lastAnimes && userData.lastAnimes.length > 0 ? (
                userData.lastAnimes.slice(0, 3).map((anime, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary font-bold flex-shrink-0">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{anime.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {anime.score && (
                          <span className="flex items-center gap-1">
                            <span>⭐</span>
                            {anime.score}/10
                          </span>
                        )}
                        {anime.status && (
                          <span className="bg-muted px-2 py-0.5 rounded-full">
                            {anime.status}
                          </span>
                        )}
                        {anime.progress && anime.totalEpisodes && (
                          <span>
                            {anime.progress}/{anime.totalEpisodes} épisodes
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucune donnée trouvée
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
              <span className="text-xl">📚</span>
              Derniers mangas
            </h4>
            <div className="space-y-2">
              {userData?.lastMangas && userData.lastMangas.length > 0 ? (
                userData.lastMangas.slice(0, 3).map((manga, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="text-primary font-bold flex-shrink-0">
                      {index + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{manga.title}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        {manga.score && (
                          <span className="flex items-center gap-1">
                            <span>⭐</span>
                            {manga.score}/10
                          </span>
                        )}
                        {manga.status && (
                          <span className="bg-muted px-2 py-0.5 rounded-full">
                            {manga.status}
                          </span>
                        )}
                        {manga.progress && manga.totalChapters && (
                          <span>
                            {manga.progress}/{manga.totalChapters} chapitres
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucune donnée trouvée
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Favoris si disponibles */}
        {userData?.favorites &&
          (userData.favorites.anime?.length > 0 ||
            userData.favorites.manga?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userData.favorites.anime &&
                userData.favorites.anime.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                      <span className="text-xl">❤️</span>
                      Animes favoris
                    </h4>
                    <div className="space-y-2">
                      {userData.favorites.anime
                        .slice(0, 3)
                        .map((anime, index) => (
                          <div
                            key={index}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="text-primary font-bold flex-shrink-0">
                              {anime.position || index + 1}.
                            </span>
                            <span className="truncate font-medium">
                              {anime.title}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

              {userData.favorites.manga &&
                userData.favorites.manga.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                      <span className="text-xl">💖</span>
                      Mangas favoris
                    </h4>
                    <div className="space-y-2">
                      {userData.favorites.manga
                        .slice(0, 3)
                        .map((manga, index) => (
                          <div
                            key={index}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="text-primary font-bold flex-shrink-0">
                              {manga.position || index + 1}.
                            </span>
                            <span className="truncate font-medium">
                              {manga.title}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          )}
      </div>

      {/* Boutons de configuration */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
        <Button
          onClick={() => setShowCardTypeSelector(!showCardTypeSelector)}
          variant="outline"
          className="px-4 sm:px-6 py-3 w-full sm:w-auto"
          disabled={isGenerating}
        >
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
              <span className="text-lg">🎨</span>
            )}
            <span className="hidden sm:inline">
              {isGenerating
                ? "Génération..."
                : showCardTypeSelector
                ? "Masquer les types"
                : "Changer le type"}
            </span>
            <span className="sm:hidden">
              {isGenerating
                ? "Génération..."
                : showCardTypeSelector
                ? "Masquer"
                : "Changer type"}
            </span>
          </div>
        </Button>

        {/* Bouton pour activer/désactiver le background */}
        <Button
          onClick={() => handleBackgroundToggle(!useLastAnimeBackground)}
          variant={useLastAnimeBackground ? "default" : "outline"}
          className="px-4 sm:px-6 py-3 w-full sm:w-auto"
          disabled={isGenerating}
        >
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
            ) : (
              <span className="text-lg">
                {useLastAnimeBackground ? "🖼️" : "🎭"}
              </span>
            )}
            <span className="hidden sm:inline">
              {isGenerating
                ? "Génération..."
                : useLastAnimeBackground
                ? "Désactiver le background"
                : "Activer le background"}
            </span>
            <span className="sm:hidden">
              {isGenerating
                ? "Génération..."
                : useLastAnimeBackground
                ? "Désactiver BG"
                : "Activer BG"}
            </span>
          </div>
        </Button>
      </div>

        {/* Sélecteur de type de carte */}
        {showCardTypeSelector && (
          <div className="bg-card/50 rounded-2xl p-6 border border-border/50 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h3 className="text-xl font-bold text-foreground mb-4 text-center">
            Changer le type de carte
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {cardTypes.map((cardTypeOption) => (
              <div
                key={cardTypeOption.value}
                onClick={() =>
                  onCardTypeChange?.(cardTypeOption.value as CardType)
                }
                className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 border border-border/50 backdrop-blur-sm ${
                  cardType === cardTypeOption.value
                    ? "bg-primary/5 border-primary/60 shadow-[0_4px_16px_rgba(0,0,0,0.12)] scale-[1.02]"
                    : "bg-card/50 hover:border-primary/30 hover:bg-card/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:scale-[1.01]"
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
                  <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
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
            className="relative rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-border/50 bg-card/50 backdrop-blur-sm"
            style={{
              width: Math.min(dimensions.width, 600),
              height: Math.min(dimensions.height, 500),
            }}
          >
            {isGenerating || isInitialGeneration ? (
              <div className="w-full h-full flex items-center justify-center">
                <CardLoading
                  message={
                    isInitialGeneration
                      ? "Génération initiale de votre carte..."
                      : "Régénération de votre carte..."
                  }
                />
              </div>
            ) : generatedCardUrl ? (
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
        {generatedCardUrl && shareableUrl && (
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
