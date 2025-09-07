"use client";

import { useQueryState } from "nuqs";
import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Platform } from "@/lib/types";

export function NavbarWrapper() {
  const pathname = usePathname();
  const [platform] = useQueryState<Platform>("platform", {
    defaultValue: "anilist",
    parse: (value): Platform => {
      if (["anilist", "mal", "nautiljon"].includes(value)) {
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
