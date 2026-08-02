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
 *
 * **Le cadrage n'est pas décoratif, il est calculé.** Le bloc est débordé de
 * 15 % de chaque côté puis agrandi de 8 %, et les 8 colonnes de 150 px
 * espacées de 18 px occupent alors très exactement la largeur de l'écran sur
 * un 1440. Rétrécir les jaquettes casse ce calage : à 120 px les 8 colonnes ne
 * mesurent plus que 1072 px, le mur cesse d'atteindre les bords et laisse à
 * droite une bande de fond nu qui se lit comme un bloc opaque. D'où des
 * valeurs figées plutôt que responsives.
 */
export function CoverWall({ dimmed = false }: { dimmed?: boolean }) {
  const [columns, setColumns] = useState<string[][]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/covers/manifest.json")
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
        "pointer-events-none absolute -inset-x-[15%] -inset-y-[30%] flex justify-center gap-[18px]",
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
            "flex h-max shrink-0 flex-col gap-[18px] will-change-transform",
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
              src={`/api/covers/${file}`}
              alt=""
              width={150}
              height={214}
              loading="lazy"
              decoding="async"
              className="h-[214px] w-[150px] shrink-0 rounded-xl bg-muted object-cover shadow-[0_10px_30px_rgba(0,0,0,.5)]"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/*
 * Voiles de lisibilité posés au-dessus du mur.
 *
 * Tout part de `--background`, qui change avec le thème : le dégradé suit donc
 * le mode clair comme le mode sombre sans avoir à être redéfini. Le mélange
 * est fait `in srgb` et non `in oklab` — on cherche l'équivalent exact d'un
 * `rgba(fond, .66)`, pas une interpolation perceptuelle qui décale la teinte
 * dans les zones intermédiaires.
 */
const veil = (stops: string) => ({ background: `linear-gradient(${stops})` });

const bg = (percent: number) =>
  `color-mix(in srgb, var(--background) ${percent}%, transparent)`;

/**
 * Voile latéral. Il remonte volontairement à 58 % au bord droit au lieu de
 * finir à zéro : sans cette remontée le mur vient buter en pleine lumière
 * contre le bord de l'écran, et la hero se termine sur une arête au lieu d'un
 * fond diffus.
 *
 * La version mobile est plus couvrante et plus verticale : le texte y occupe
 * toute la largeur, il n'a plus la colonne de gauche protégée dont il dispose
 * sur grand écran.
 */
export function CoverWallVeils({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-[900ms] sm:hidden",
          dimmed ? "opacity-35" : "opacity-100"
        )}
        style={veil(
          `118deg, ${bg(98)} 0%, ${bg(90)} 32%, ${bg(70)} 62%, ${bg(62)} 100%`
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 hidden transition-opacity duration-[900ms] sm:block",
          dimmed ? "opacity-35" : "opacity-100"
        )}
        style={veil(
          `100deg, ${bg(99)} 0%, ${bg(96)} 30%, ${bg(66)} 52%, ${bg(34)} 76%, ${bg(58)} 100%`
        )}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={veil(
          `180deg, var(--background) 0%, transparent 20%, transparent 74%, var(--background) 100%`
        )}
      />
    </>
  );
}
