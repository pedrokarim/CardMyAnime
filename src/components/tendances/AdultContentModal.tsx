"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";
import { useTraduction } from "@/lib/i18n/client";

interface AdultContentModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function AdultContentModal({ open, onConfirm, onCancel }: AdultContentModalProps) {
  const { t } = useTraduction();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Gardé dans une ref : les appelants passent souvent une lambda inline, dont
  // l'identité change à chaque rendu. La mettre en dépendance de l'effet
  // ci-dessous le relancerait et restaurerait le focus au mauvais moment.
  // La mise à jour se fait dans un effet et non pendant le rendu : muter une
  // ref en cours de rendu casse le rendu concurrent.
  const onCancelRef = useRef(onCancel);
  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    // On donne le focus au dialogue lui-même : le lecteur d'écran annonce son
    // titre, et Tab part de l'intérieur de la modale.
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancelRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      // Piège à focus : sans ça, Tab sort de la modale et navigue la page
      // qui se trouve derrière, toujours visible.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Retour du focus là où l'utilisateur l'avait laissé.
      previouslyFocused.current?.focus();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-contain"
          >
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="adult-modal-title"
              aria-describedby="adult-modal-description"
              tabIndex={-1}
              className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 relative focus:outline-none"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={onCancel}
                aria-label={t.commun.fermer}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X aria-hidden="true" className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <ShieldAlert aria-hidden="true" className="w-8 h-8 text-red-500" />
                </div>
              </div>

              {/* Content */}
              <h3
                id="adult-modal-title"
                className="text-lg font-bold text-foreground text-center mb-2"
              >
                {t.tendances.modaleTitre}
              </h3>
              <p
                id="adult-modal-description"
                className="text-sm text-muted-foreground text-center mb-6 leading-relaxed"
              >
                {t.tendances.modaleTexte}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {t.tendances.modaleRefuser}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  {t.tendances.modaleAccepter}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
