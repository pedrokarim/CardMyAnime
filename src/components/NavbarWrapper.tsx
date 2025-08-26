"use client";

import { useQueryState } from "nuqs";
import { Navbar } from "./Navbar";
import { Platform } from "@/lib/types";

export function NavbarWrapper() {
  const [platform] = useQueryState<Platform>("platform", {
    defaultValue: "anilist",
    parse: (value): Platform => {
      if (["anilist", "mal", "nautiljon"].includes(value)) {
        return value as Platform;
      }
      return "anilist";
    },
  });

  return <Navbar currentPlatform={platform} />;
}
