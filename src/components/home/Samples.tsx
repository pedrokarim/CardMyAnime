"use client";

import { motion } from "framer-motion";
import { useTraduction } from "@/lib/i18n/client";

/**
 * Section « exemples » de l'accueil, cible de l'ancre `#exemples`.
 *
 * Les six images sont de vraies cartes produites par le générateur, exportées
 * puis converties en WebP à leur taille d'affichage — c'est l'argument de la
 * section, une capture d'interface ne dirait pas la même chose.
 *
 * `<img>` brut plutôt que `next/image` : ces fichiers sont déjà au bon format
 * et à la bonne taille, l'optimiseur n'aurait rien à faire et ajouterait un
 * aller-retour par le serveur. Même raisonnement que pour le mur de jaquettes.
 */

const SAMPLES = [
  {
    file: "small",
    label: "Petite",
    meta: "400 × 150 — signatures de forum",
    width: 400,
    height: 150,
  },
  { file: "medium", label: "Moyenne", meta: "600 × 300", width: 600, height: 300 },
  { file: "neon", label: "Néon", meta: "600 × 350", width: 600, height: 350 },
  { file: "glass", label: "Glass", meta: "700 × 400", width: 700, height: 400 },
  { file: "large", label: "Grande", meta: "800 × 500", width: 760, height: 475 },
  { file: "summary", label: "Résumé", meta: "800 × 600", width: 760, height: 570 },
];

export function Samples() {
  const { t } = useTraduction();

  return (
    <section
      id="exemples"
      className="mx-auto w-[min(1120px,92vw)] scroll-mt-24 pb-[88px] pt-[72px] sm:pb-[110px] sm:pt-[88px]"
    >
      <h2 className="text-[clamp(24px,3vw,32px)] font-bold tracking-[-0.02em] text-foreground">
        {t.accueil.exemplesTitre}
      </h2>
      <p className="mb-[34px] mt-2 max-w-[56ch] text-[15.5px] leading-relaxed text-muted-foreground">
        {t.accueil.exemplesSousTitre}
      </p>

      {/* Colonnes CSS et non une grille : les sept formats vont du 400 × 150
          au 800 × 600. En grille, chaque ligne prend la hauteur de sa carte la
          plus haute et les autres se retrouvent avec un bas vide sous leur
          légende. Ici chacune ne mesure que ce qu'elle occupe. */}
      <div className="columns-1 gap-[22px] sm:columns-2 lg:columns-3">
        {SAMPLES.map((sample, index) => (
          /* Le clic sur « Voir des exemples » amenait la section d'un coup,
             déjà entièrement dessinée. Les cartes se posent maintenant à
             mesure que le défilement les atteint : l'arrivée se lit comme un
             mouvement, pas comme une coupe. `once` — rejouer à chaque
             passage transformerait un défilement ordinaire en diaporama. */
          <motion.figure
            key={sample.file}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15, margin: "0px 0px -60px 0px" }}
            transition={{
              duration: 0.5,
              delay: (index % 3) * 0.07,
              ease: [0.22, 0.9, 0.24, 1],
            }}
            className="group mb-[22px] break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-card/60 transition-[transform,border-color] duration-300 motion-safe:hover:-translate-y-1 hover:border-primary/40"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/samples/${sample.file}.webp`}
              alt={`Exemple de carte ${sample.label.toLowerCase()}`}
              width={sample.width}
              height={sample.height}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
            <figcaption className="flex justify-between gap-2.5 px-4 py-3 text-[13px] text-muted-foreground">
              <b className="font-semibold text-foreground">{sample.label}</b>
              <span>{sample.meta}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
