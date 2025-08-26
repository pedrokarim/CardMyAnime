import Image from "next/image";
import { Platform } from "@/lib/types";

interface PlatformIconProps {
  platform: Platform;
  size?: number;
  className?: string;
}

export function PlatformIcon({
  platform,
  size = 24,
  className = "",
}: PlatformIconProps) {
  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "anilist":
        return "/images/anilist-android-chrome-512x512.png";
      case "mal":
        return "/images/MAL_Favicon_2020.png";
      case "nautiljon":
        return "/images/nautiljon-logo.jpg";
      default:
        return "/images/anilist-android-chrome-512x512.png";
    }
  };

  return (
    <Image
      src={getPlatformIcon(platform)}
      alt={`Logo ${platform}`}
      width={size}
      height={size}
      className={`rounded ${className}`}
    />
  );
}
