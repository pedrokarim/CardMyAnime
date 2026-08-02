"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Fond animé de la page d'accueil : des colonnes de jaquettes défilant
 * verticalement en sens alternés, l'ensemble incliné.
 *
 * Choix de mise en œuvre :
 *
 * - **Défilement vertical**, pas horizontal : le texte de la hero se lit
 *   horizontalement, un mouvement de fond sur le même axe le contrarie.
 * - **Trois vitesses** réparties sur les colonnes. Parfaitement synchronisées,
 *   elles se lisent comme un seul bloc qui glisse et l'effet retombe.
 * - **Chaque colonne est dupliquée** : l'animation va de 0 à -50%, donc la
 *   seconde moitié retombe exactement sur la première et la boucle n'a pas de
 *   raccord. Il faut pour cela qu'une colonne simple couvre déjà la hauteur
 *   visible — d'où les 7 jaquettes par colonne.
 * - **Images auto-hébergées en WebP**, converties par
 *   `scripts/generate-cover-wall.js`. Les 56 jaquettes pèsent 738 Ko au total,
 *   contre ~1,8 Mo en pointant les JPEG du CDN de MyAnimeList. Elles sont
 *   servies depuis notre domaine, sur la connexion déjà ouverte, et l'accueil
 *   ne dépend plus d'un CDN tiers.
 * - **`<img>` brut plutôt que `next/image`** : ces fichiers sont déjà à la
 *   bonne taille et au bon format, l'optimiseur n'aurait rien à faire.
 * - **Manifeste lu au runtime**, et non un module importé à la compilation :
 *   la sélection est régénérée chaque mois par un cron en production. Un
 *   import figerait le mur sur la sélection du jour du build.
 */
export function CoverWall({ dimmed = false }: { dimmed?: boolean }) {
  const [columns, setColumns] = useState<string[][]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/covers/manifest.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && Array.isArray(data?.columns)) setColumns(data.columns);
      })
      .catch(() => {
        // Fond purement décoratif : son absence ne doit rien casser.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (columns.length === 0) return null;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-x-[15%] -inset-y-[22%] flex justify-center gap-3 sm:gap-4",
        "origin-center [transform:rotate(-8deg)_scale(1.08)]",
        "transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(.22,.9,.24,1)]",
        dimmed
          ? "opacity-[.14] blur-[2px] saturate-50 [transform:rotate(-8deg)_scale(1.24)]"
          : "opacity-50 saturate-[.9]"
      )}
    >
      {columns.map((column, index) => (
        <div
          key={index}
          className={cn(
            "flex h-max shrink-0 flex-col gap-3 will-change-transform sm:gap-4",
            // Au-dela de 4 colonnes, un telephone n'en voit rien : on evite de
            // telecharger les jaquettes correspondantes.
            index >= 4 && "hidden lg:flex",
            index % 2 === 0 ? "animate-wall-up" : "animate-wall-down",
            index % 3 === 1 && "[animation-duration:74s]",
            index % 3 === 2 && "[animation-duration:88s]"
          )}
        >
          {/* Doublé : c'est ce qui rend la boucle invisible. */}
          {[...column, ...column].map((file, i) => (
            /* Fichiers déjà convertis en WebP à la bonne taille par le script
               de génération : next/image n'aurait rien à optimiser et
               ajouterait un aller-retour par notre serveur. */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${file}-${i}`}
              src={`/covers/${file}`}
              alt=""
              width={120}
              height={172}
              loading="lazy"
              decoding="async"
              className="h-[128px] w-[90px] shrink-0 rounded-lg bg-muted object-cover shadow-[0_8px_24px_rgba(0,0,0,.45)] sm:h-[172px] sm:w-[120px]"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Voiles de lisibilité posés au-dessus du mur.
 *
 * Tout part de `--background`, qui change avec le thème : le dégradé suit donc
 * le mode clair comme le mode sombre sans avoir à être redéfini.
 */
export function CoverWallVeils({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-[900ms]",
          dimmed ? "opacity-35" : "opacity-100"
        )}
        style={{
          background:
            "linear-gradient(100deg, var(--background) 0%, color-mix(in oklab, var(--background) 96%, transparent) 30%, color-mix(in oklab, var(--background) 66%, transparent) 52%, color-mix(in oklab, var(--background) 34%, transparent) 76%, color-mix(in oklab, var(--background) 58%, transparent) 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--background) 0%, transparent 20%, transparent 74%, var(--background) 100%)",
        }}
      />
    </>
  );
}
