"use client";

import Link from "next/link";
import { Ellipsis, type LucideIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUES, type Langue } from "@/lib/i18n/config";
import { useChangerLangue, useTraduction } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

export interface NavMenuLink {
  href: string;
  label: string;
  icon: LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
}

/** Chaque langue s'écrit dans sa propre langue : « English » reste English. */
const LANGUAGE_NAMES: Record<Langue, string> = {
  fr: "Français",
  en: "English",
};

interface NavMoreMenuProps {
  /** Pages secondaires : présentes, mais pas assez fréquentées pour la barre. */
  pages: NavMenuLink[];
  socials: NavMenuLink[];
  className?: string;
}

/**
 * Menu « Plus » de la barre de navigation.
 *
 * La droite de la barre cumulait cinq liens, trois icônes de réseaux, le
 * sélecteur de langue et le bouton de thème : dix cibles côte à côte, dont
 * la moitié ne sert qu'une fois. Les pages secondaires, la langue et les
 * réseaux sont regroupés ici ; la barre ne garde que les pages qu'on visite
 * et le thème, qu'on bascule d'un clic.
 */
export function NavMoreMenu({ pages, socials, className }: NavMoreMenuProps) {
  const { langue, t } = useTraduction();
  const changeLanguage = useChangerLangue();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={t.nav.more}
        title={t.nav.more}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted data-[state=open]:text-foreground",
          className
        )}
      >
        <Ellipsis aria-hidden="true" className="h-5 w-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        {pages.map((page) => {
          const Icon = page.icon;
          return (
            <DropdownMenuItem key={page.href} asChild>
              <Link href={page.href}>
                <Icon aria-hidden="true" className="h-4 w-4" />
                {page.label}
              </Link>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          {t.commun.langue}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={langue}
          onValueChange={(value) => {
            if (value !== langue) changeLanguage(value as Langue);
          }}
        >
          {LANGUES.map((code) => (
            <DropdownMenuRadioItem key={code} value={code} lang={code}>
              {LANGUAGE_NAMES[code]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          {t.nav.suivezNous}
        </DropdownMenuLabel>
        {socials.map((social) => {
          const Icon = social.icon;
          return (
            <DropdownMenuItem key={social.href} asChild>
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.commun.nouvelOnglet(social.label)}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {social.label}
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
