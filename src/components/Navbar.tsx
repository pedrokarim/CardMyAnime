"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Trophy, TrendingUp, Mail, Info, Github, Twitter, Menu, ListOrdered } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useValeurClient } from "@/lib/hooks/useValeurClient";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Platform } from "@/lib/types";
import { SITE_CONFIG } from "@/lib/constants";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SelecteurLangue } from "@/components/SelecteurLangue";
import { NavMoreMenu } from "@/components/NavMoreMenu";
import { useTraduction } from "@/lib/i18n/client";

interface NavbarProps {
  currentPlatform?: Platform;
}

const REFONTE_TENDANCES = new Date("2026-02-10").getTime();
const DUREE_BADGE_NEW = 20 * 24 * 60 * 60 * 1000;

function estTendancesRecent() {
  return Date.now() - REFONTE_TENDANCES < DUREE_BADGE_NEW;
}

export function Navbar({ currentPlatform }: NavbarProps) {
  const { t } = useTraduction();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Badge "NEW" visible pendant 20 jours après la refonte Tendances (10 fév 2026).
  // Lu côté client uniquement : l'horloge du serveur et celle du navigateur ne
  // tombent pas forcément du même côté de l'échéance, et un badge présent au
  // rendu serveur mais absent à l'hydratation casse React.
  const isTendancesNew = useValeurClient(estTendancesRecent, false);

  // Pages de la barre. Contact et À propos passent dans le menu « Plus » sur
  // grand écran : on y va une fois, elles n'ont pas à occuper la barre.
  const navLinks = [
    { href: "/", label: t.nav.accueil, icon: Home, isNew: false },
    { href: "/tops", label: t.nav.tops, icon: ListOrdered, isNew: false },
    { href: "/ranking", label: t.nav.classement, icon: Trophy, isNew: false },
    { href: "/tendances", label: t.nav.tendances, icon: TrendingUp, isNew: isTendancesNew },
  ];

  const secondaryLinks = [
    { href: "/contact", label: t.nav.contact, icon: Mail },
    { href: "/about", label: t.nav.apropos, icon: Info },
  ];

  const socialLinks = [
    { href: SITE_CONFIG.social.github, label: "GitHub", icon: Github },
    { href: SITE_CONFIG.social.twitter, label: "Twitter", icon: Twitter },
    { href: SITE_CONFIG.social.discord, label: "Discord", icon: DiscordIcon },
  ];

  const isHomePage = pathname === "/";

  return (
    /*
     * Sur l'accueil, la navbar flotte au-dessus du mur de jaquettes : un fond
     * plein la couperait en deux et une bordure franche serait pire encore.
     *
     * Deux couches superposées à la place :
     *   1. un dégradé partant de `--background` et s'ouvrant vers le bas,
     *   2. un flou dont l'opacité est masquée par le même dégradé.
     *
     * Le flou disparaît donc progressivement au lieu de s'arrêter sur une
     * ligne nette, et comme tout part de `--background`, le rendu suit le
     * thème clair comme le thème sombre sans être redéfini.
     */
    <nav
      aria-label={t.nav.principale}
      className={cn(
        isHomePage
          ? "fixed inset-x-0 top-0 z-50"
          : "bg-background border-b border-border"
      )}
    >
      {isHomePage && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(180deg, var(--background) 0%, color-mix(in oklab, var(--background) 82%, transparent) 45%, color-mix(in oklab, var(--background) 40%, transparent) 75%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[7px]"
            style={{
              maskImage:
                "linear-gradient(180deg, #000 0%, #000 45%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(180deg, #000 0%, #000 45%, transparent 100%)",
            }}
          />
        </>
      )}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src={SITE_CONFIG.site.logo}
              alt={`${SITE_CONFIG.site.name} Logo`}
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span translate="no" className="text-2xl font-bold text-foreground">
              {SITE_CONFIG.site.name}
            </span>
            {currentPlatform && isHomePage && (
              <div className="hidden sm:flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">{t.nav.via}</span>
                <PlatformIcon platform={currentPlatform} size={20} />
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative text-[15px] font-medium transition-colors px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:px-4 lg:text-[16px]",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {link.isNew && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full bg-orange-500 text-white">
                      {t.nav.nouveau}
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="ml-3 flex items-center gap-0.5">
              <ThemeToggle className="text-muted-foreground hover:text-foreground" />
              <NavMoreMenu pages={secondaryLinks} socials={socialLinks} />
            </div>
          </div>

          {/* Mobile : thème et menu. La langue est dans le menu. */}
          <div className="flex md:hidden items-center gap-1">
            <ThemeToggle className="text-muted-foreground hover:text-foreground" />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-muted"
                >
                <Menu className="h-6 w-6" />
                <span className="sr-only">{t.nav.ouvrirMenu}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader className="pb-6">
                <SheetTitle className="flex items-center gap-2">
                  <Image
                    src={SITE_CONFIG.site.logo}
                    alt={`${SITE_CONFIG.site.name} Logo`}
                    width={24}
                    height={24}
                    className="rounded"
                  />
                  {SITE_CONFIG.site.name}
                  {currentPlatform && isHomePage && (
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-muted-foreground">{t.nav.via}</span>
                      <PlatformIcon platform={currentPlatform} size={16} />
                    </div>
                  )}
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {[
                  ...navLinks,
                  ...secondaryLinks.map((link) => ({ ...link, isNew: false })),
                ].map((link) => {
                  const isActive = pathname === link.href;
                  const IconComponent = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <IconComponent aria-hidden="true" className="w-5 h-5" />
                      <span>{link.label}</span>
                      {link.isNew && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold leading-none rounded-full bg-orange-500 text-white">
                          {t.nav.nouveau}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-4 px-4">
                  {t.nav.suivezNous}
                </p>
                <div className="space-y-2">
                  {socialLinks.map((link, index) => {
                    const Icon = link.icon;

                    return (
                      <a
                        key={index}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Icon aria-hidden="true" className="w-5 h-5" />
                        <span>{link.label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-border px-4 pt-6">
                <span className="text-sm font-medium text-muted-foreground">
                  {t.commun.langue}
                </span>
                <SelecteurLangue />
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
