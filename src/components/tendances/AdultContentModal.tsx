"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, X } from "lucide-react";

interface AdultContentModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function AdultContentModal({ open, onConfirm, onCancel }: AdultContentModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
              {/* Close button */}
              <button
                onClick={onCancel}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-red-500/10">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-foreground text-center mb-2">
                Contenu pour adultes
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
                Ce contenu est classifié comme réservé aux adultes (18+).
                Confirmez-vous avoir au moins 18 ans pour afficher ce contenu ?
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  Non, revenir
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                >
                  Oui, j'ai 18 ans
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
