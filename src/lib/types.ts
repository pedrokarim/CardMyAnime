export interface UserData {
  username: string;
  avatarUrl: string;
  personalMessage?: string;
  role?: string;
  stats: {
    animesSeen: number;
    mangasRead: number;
    avgScore: number;
    // Nouvelles stats
    totalEpisodes?: number;
    totalChapters?: number;
    daysWatched?: number;
    daysRead?: number;
    favoriteGenres?: string[];
    topGenres?: Array<{ name: string; count: number }>;
    watchingCount?: number;
    readingCount?: number;
    completedCount?: number;
    droppedCount?: number;
    planToWatchCount?: number;
    planToReadCount?: number;
    commentsCount?: number;
    notesCount?: number;
    forumMessagesCount?: number;
    // Nautiljon-specific stats
    collections?: any;
  };
  lastAnimes: Array<{
    title: string;
    coverUrl: string;
    score?: number;
    status?: string;
    progress?: number;
    totalEpisodes?: number;
  }>;
  lastMangas: Array<{
    title: string;
    coverUrl: string;
    score?: number;
    status?: string;
    progress?: number;
    totalChapters?: number;
  }>;
  // Nouvelles données
  profile?: {
    joinDate?: string;
    lastActive?: string;
    bio?: string;
    location?: string;
    website?: string;
    gender?: string;
    memberDays?: number;
  };
  favorites?: {
    anime?: Array<{ title: string; coverUrl: string; position?: number }>;
    manga?: Array<{ title: string; coverUrl: string; position?: number }>;
    characters?: Array<{ name: string; imageUrl: string; position?: number }>;
  };
  achievements?: Array<{
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
  }>;
  interests?: any;
  contacts?: Array<{
    username: string;
    avatarUrl: string;
  }>;
  commentsInfo?: {
    total: number;
    hasNotifications: boolean;
  };
  // Nautiljon-specific data
  collections?: any;
  nautiliste?: any;
  watchlist?: any;
  detailedStats?: any;
}

export type Platform = "anilist" | "mal" | "nautiljon";
export type CardType = "small" | "medium" | "large" | "summary";

export interface CardGenerationRequest {
  platform: Platform;
  username: string;
  cardType: CardType;
  useLastAnimeBackground?: boolean; // Nouveau paramètre
}

export interface CardGenerationResponse {
  success: boolean;
  data?: UserData;
  error?: string;
  cardUrl?: string;
}
