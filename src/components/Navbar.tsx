"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Trophy, Mail, Info, Github, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { DiscordIcon } from "@/components/ui/discord-icon";
import { Platform } from "@/lib/types";
import { SITE_CONFIG } from "@/lib/constants";

interface NavbarProps {
  currentPlatform?: Platform;
}

export function Navbar({ currentPlatform }: NavbarProps) {
  const pathname = usePathname();

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
    <nav className="bg-background">
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
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">via</span>
                <PlatformIcon platform={currentPlatform} size={20} />
              </div>
            )}
          </Link>

          {/* Navigation Links + Social Icons (grouped together) */}
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
        </div>
      </div>
    </nav>
  );
}
