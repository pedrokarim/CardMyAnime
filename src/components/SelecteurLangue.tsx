"use client";

import { Languages } from "lucide-react";

import { cn } from "@/lib/utils";
import { LANGUES, type Langue } from "@/lib/i18n/config";
import { useChangerLangue, useTraduction } from "@/lib/i18n/client";

/*
 * Groupe de deux boutons plutôt qu'un menu déroulant : avec deux langues, un
 * menu ajoute un clic pour rien, et chaque option reste lisible dans sa propre
 * langue — « English » s'écrit toujours English, même affiché à un francophone.
 */
const NOMS: Record<Langue, string> = {
  fr: "Français",
  en: "English",
};

const CODES: Record<Langue, string> = {
  fr: "FR",
  en: "EN",
};

export function SelecteurLangue({ className }: { className?: string }) {
  const { langue, t } = useTraduction();
  const changerLangue = useChangerLangue();

  return (
    <div
      role="group"
      aria-label={t.commun.choisirLangue}
      className={cn(
        "flex items-center gap-0.5 rounded-md border border-border/60 p-0.5",
        className
      )}
    >
      <Languages
        aria-hidden="true"
        className="w-3.5 h-3.5 mx-1 text-muted-foreground shrink-0"
      />
      {LANGUES.map((code) => {
        const actif = code === langue;

        return (
          <button
            key={code}
            type="button"
            lang={code}
            onClick={() => !actif && changerLangue(code)}
            aria-current={actif ? "true" : undefined}
            // Le nom accessible dit la langue en toutes lettres ; le bouton
            // n'affiche que « FR » / « EN », faute de place.
            aria-label={NOMS[code]}
            title={NOMS[code]}
            className={cn(
              "px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              actif
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {CODES[code]}
          </button>
        );
      })}
    </div>
  );
}
