"use client";

import { AnimatePresence, motion } from "framer-motion";
import { History, X } from "lucide-react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import type { Platform } from "@/lib/types";
import type { RecentUsername } from "@/lib/recentUsernames";

interface RecentUsernamesProps {
  open: boolean;
  entries: RecentUsername[];
  onPick: (username: string, platform: Platform) => void;
  onForget: (username: string, platform: Platform) => void;
}

/**
 * Panneau des recherches récentes, sous le champ de saisie.
 *
 * Il apparaît à la prise de focus et disparaît à sa perte. Le clic sur une
 * entrée devant survivre à ce départ de focus, c'est `onMouseDown` qui est
 * intercepté : au `click`, le panneau serait déjà démonté.
 *
 * Chaque ligne se retire par sa croix, et la liste étant coupée à sept alors
 * que vingt sont conservées, retirer une entrée en fait remonter une autre au
 * lieu de laisser un trou.
 */
export function RecentUsernames({
  open,
  entries,
  onPick,
  onForget,
}: RecentUsernamesProps) {
  return (
    <AnimatePresence>
      {open && entries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.985 }}
          transition={{ duration: 0.18, ease: [0.22, 0.9, 0.24, 1] }}
          onMouseDown={(event) => event.preventDefault()}
          /* Sept entrées dépassent le bas de l'écran sur un portable, et
             l'étape est centrée dans la hauteur de fenêtre — la page ne peut
             pas défiler pour les révéler. Le panneau défile donc lui-même.
             Le plafond en `vh` est calé sur ce qui reste réellement sous le
             champ, à peu près un tiers de la fenêtre : au-delà, le bas du
             panneau se faisait couper par le bord de l'écran. */
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[min(300px,28vh)] origin-top overflow-y-auto overscroll-contain rounded-xl border border-border/70 bg-popover/95 p-1.5 text-left shadow-[0_16px_40px_rgba(0,0,0,.35)] backdrop-blur-xl"
        >
          <p className="flex items-center gap-2 px-2.5 pb-1.5 pt-1 text-[11.5px] font-medium uppercase tracking-wide text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            Recherché récemment
          </p>

          {entries.map((entry) => (
            <div
              key={`${entry.platform}-${entry.username}`}
              className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-accent/70"
            >
              <button
                type="button"
                onClick={() => onPick(entry.username, entry.platform)}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <PlatformIcon
                  platform={entry.platform}
                  size={18}
                  className="shrink-0 rounded"
                />
                <span className="truncate text-sm text-foreground">
                  {entry.username}
                </span>
              </button>

              <button
                type="button"
                aria-label={`Retirer ${entry.username} de l'historique`}
                onClick={() => onForget(entry.username, entry.platform)}
                /* Toujours visible au doigt : sans survol, une croix révélée
                   au `group-hover` n'existe simplement pas sur mobile. */
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-[opacity,color] hover:text-foreground sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
