"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTraduction } from "@/lib/i18n/client";

export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTraduction();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    // Position du clic pour l'origine du cercle
    const x = e.clientX;
    const y = e.clientY;

    if (document.startViewTransition) {
      const root = document.documentElement;
      root.style.setProperty("--x", `${x}px`);
      root.style.setProperty("--y", `${y}px`);

      document.startViewTransition(() => {
        if (newTheme === "dark") {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        setTheme(newTheme);
      });
    } else {
      setTheme(newTheme);
    }
  };

  if (!mounted) {
    return (
      <button
        className={cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted",
          className
        )}
        aria-label={t.commun.changerTheme}
      >
        <span className="h-5 w-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted cursor-pointer",
        className
      )}
      aria-label={isDark ? t.commun.modeClair : t.commun.modeSombre}
      title={isDark ? t.commun.modeClair : t.commun.modeSombre}
    >
      <Sun
        aria-hidden="true"
        className={cn(
          // rotate-* et scale-* compilent vers les propriétés CSS `rotate` et
          // `scale` en Tailwind v4, pas vers `transform`.
          "h-5 w-5 transition-[rotate,scale,opacity] duration-300",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
        style={{ position: isDark ? "absolute" : "relative" }}
      />
      <Moon
        aria-hidden="true"
        className={cn(
          // rotate-* et scale-* compilent vers les propriétés CSS `rotate` et
          // `scale` en Tailwind v4, pas vers `transform`.
          "h-5 w-5 transition-[rotate,scale,opacity] duration-300",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        )}
        style={{ position: !isDark ? "absolute" : "relative" }}
      />
    </button>
  );
}
