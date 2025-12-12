"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Trophy, Mail, Info, Github, Twitter, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Platform } from "@/lib/types";
import { SITE_CONFIG } from "@/lib/constants";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  currentPlatform?: Platform;
}

export function Navbar({ currentPlatform }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/ranking", label: "Classement" },
    { href: "/contact", label: "Contact" },
    { href: "/about", label: "À propos" },
  ];

  const socialLinks = [
    { href: SITE_CONFIG.social.github, label: "GitHub", icon: Github },
    { href: SITE_CONFIG.social.twitter, label: "Twitter", icon: Twitter },
    { href: SITE_CONFIG.social.discord, label: "Discord", icon: DiscordIcon },
  ];

  const isHomePage = pathname === "/";

  return (
    <nav className="bg-background border-b border-border">
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
            <span className="text-2xl font-bold text-foreground">
              {SITE_CONFIG.site.name}
            </span>
            {currentPlatform && isHomePage && (
              <div className="hidden sm:flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">via</span>
                <PlatformIcon platform={currentPlatform} size={20} />
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, index) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={index}
                  href={link.href}
                  className={cn(
                    "text-[16px] font-medium transition-colors px-4 py-2",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {socialLinks.map((link, index) => {
              const Icon = link.icon;

              return (
                <Link
                  key={index}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={link.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground hover:bg-muted"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
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
                      <span className="text-xs text-muted-foreground">via</span>
                      <PlatformIcon platform={currentPlatform} size={16} />
                    </div>
                  )}
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href;
                  const IconComponent = index === 0 ? Home : index === 1 ? Trophy : index === 2 ? Mail : Info;

                  return (
                    <Link
                      key={index}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground mb-4 px-4">
                  Suivez-nous
                </p>
                <div className="space-y-2">
                  {socialLinks.map((link, index) => {
                    const Icon = link.icon;

                    return (
                      <Link
                        key={index}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                        title={link.label}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
