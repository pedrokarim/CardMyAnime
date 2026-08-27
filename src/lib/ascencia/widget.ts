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
  src: `https://cdn.ascencia.re/id.js?v=fb577fdbf98af2ddc6b921af22dc048e3a6e5cf5`,
  "data-client-id": process.env.NEXT_PUBLIC_ASCENCIA_CLIENT_ID,
  "data-issuer":
    process.env.NEXT_PUBLIC_ASCENCIA_ISSUER ?? "https://id.ascencia.re",
  "data-redirect-uri": process.env.NEXT_PUBLIC_ASCENCIA_REDIRECT_URI,
  "data-exchange-url": "/api/auth/exchange",
  "data-scopes": "openid profile email offline_access ascencia.roles",
  "data-site-name": "CardMyAnime",
} as const;
