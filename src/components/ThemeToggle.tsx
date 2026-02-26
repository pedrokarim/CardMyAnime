"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
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
        aria-label="Changer de thème"
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
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
      title={isDark ? "Mode clair" : "Mode sombre"}
    >
      <Sun
        className={cn(
          "h-5 w-5 transition-all duration-300",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
        style={{ position: isDark ? "absolute" : "relative" }}
      />
      <Moon
        className={cn(
          "h-5 w-5 transition-all duration-300",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        )}
        style={{ position: !isDark ? "absolute" : "relative" }}
      />
    </button>
  );
}
