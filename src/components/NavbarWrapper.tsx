"use client";

import { useQueryState } from "nuqs";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Platform } from "@/lib/types";
import { isPlatform } from "@/lib/cards/cardTypes";

export function NavbarWrapper() {
  const pathname = usePathname();
  const [platform] = useQueryState<Platform>("platform", {
    defaultValue: "anilist",
    parse: (value): Platform => {
      if (isPlatform(value)) {
        return value as Platform;
      }
      return "anilist";
    },
  });

  // Ne pas afficher la navbar sur les pages admin
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return <Navbar currentPlatform={platform} />;
}
