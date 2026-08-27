export interface AscenciaWidget {
  on(
    event: "signin" | "signout" | "refresh" | "error" | "cancelled",
    listener: (payload?: unknown) => void,
  ): () => void;
}

declare global {
  interface Window {
    AscenciaID?: AscenciaWidget;
  }
}

export const ascenciaWidgetProps = {
  src: `https://cdn.ascencia.re/id.js?v=4e97c9a259241d5901d94d992aa7a1e73c1ab1ad`,
  "data-client-id": process.env.NEXT_PUBLIC_ASCENCIA_CLIENT_ID,
  "data-issuer":
    process.env.NEXT_PUBLIC_ASCENCIA_ISSUER ?? "https://id.ascencia.re",
  "data-redirect-uri": process.env.NEXT_PUBLIC_ASCENCIA_REDIRECT_URI,
  "data-exchange-url": "/api/auth/exchange",
  "data-scopes": "openid profile email offline_access ascencia.roles",
  "data-site-name": "CardMyAnime",
} as const;
