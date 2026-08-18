import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hors ligne — CardMyAnime",
  robots: { index: false, follow: false },
};

/**
 * Page de repli quand le réseau manque.
 *
 * C'est la seule page que le service worker garde en réserve, et elle est
 * volontairement bilingue : on ne sait pas dans quelle langue naviguait la
 * personne au moment de la coupure, et une page de secours qui dépendrait du
 * chargement des traductions serait la première à ne pas s'afficher.
 *
 * Aucune donnée n'est montrée ici — les cartes ne sont jamais mises en cache,
 * et prétendre le contraire serait leur servir des chiffres périmés.
 */
export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-svh w-[min(560px,92vw)] flex-col items-center justify-center gap-5 text-center">
      <svg
        viewBox="0 0 64 64"
        fill="currentColor"
        aria-hidden
        className="h-14 w-14 text-primary opacity-70"
      >
        <defs>
          <mask id="hors-ligne" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
            <rect width="64" height="64" fill="#fff" />
            <rect x="5.4" y="10.4" width="37.2" height="49.2" rx="9.1" fill="#000" />
          </mask>
        </defs>
        <g mask="url(#hors-ligne)" opacity="0.62">
          <rect x="26" y="10" width="30" height="42" rx="6" transform="rotate(14 41 31)" />
        </g>
        <rect x="8" y="13" width="32" height="44" rx="6.5" />
      </svg>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Pas de connexion
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          CardMyAnime a besoin du réseau pour lire votre profil et fabriquer la
          carte. Revenez dès que la connexion est rétablie.
        </p>
      </div>

      <div className="w-full border-t border-border/60 pt-5">
        <h2 className="text-sm font-semibold text-foreground">No connection</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          CardMyAnime needs the network to read your profile and build the card.
          Come back once you are online again.
        </p>
      </div>
    </main>
  );
}
