import { notFound } from "next/navigation";
import { SharedImage } from "@/components/share/SharedImage";
import { isPlatform } from "@/lib/cards/cardTypes";
import { lireDictionnaire } from "@/lib/i18n/serveur";
import { PLATFORM_NAMES, platformProfileUrl } from "@/lib/platforms";
import { shareMetadata } from "@/lib/social/shareMetadata";
import {
  buildTopPath,
  buildTopSharePath,
  buildTopSocialImagePath,
  isTopMediaType,
  isValidTopSize,
  parseTopSlug,
} from "@/lib/tops/topConfig";

type Params = { params: Promise<{ slug: string[] }> };

/** Valide l'URL : /share/top/{platform}/{username}/{media}-{taille}. */
async function readTop({ params }: Params) {
  const { slug } = await params;
  const parsed = parseTopSlug(slug);
  if (
    !parsed ||
    !isPlatform(parsed.platform) ||
    !isTopMediaType(parsed.media) ||
    !isValidTopSize(parsed.size)
  ) {
    return null;
  }
  return { ...parsed, platform: parsed.platform, media: parsed.media };
}

export async function generateMetadata(props: Params) {
  const top = await readTop(props);
  // Ici et non seulement dans la page : une fois le rendu lancé, le statut
  // HTTP est déjà parti en 200.
  if (!top) notFound();
  const t = await lireDictionnaire();
  const title = t.sharePage.topTitle(top.size, t.tops[top.media].toLowerCase(), top.username);

  return shareMetadata({
    title,
    description: t.sharePage.topDescription(top.username, PLATFORM_NAMES[top.platform]),
    pagePath: buildTopSharePath(top.platform, top.username, top.media, top.size),
    imagePath: buildTopSocialImagePath(top.platform, top.username, top.media, top.size),
    imageAlt: title,
  });
}

export default async function SharedTopPage(props: Params) {
  const top = await readTop(props);
  if (!top) notFound();
  const t = await lireDictionnaire();
  const platformName = PLATFORM_NAMES[top.platform];
  const title = t.sharePage.topTitle(top.size, t.tops[top.media].toLowerCase(), top.username);

  return (
    <SharedImage
      title={title}
      description={t.sharePage.topDescription(top.username, platformName)}
      imageSrc={buildTopPath(top.platform, top.username, top.media, top.size)}
      imageAlt={title}
      note={t.sharePage.updatedNote}
      ctaHref="/tops"
      ctaLabel={t.sharePage.makeYourTop}
      profileHref={platformProfileUrl(top.platform, top.username)}
      profileLabel={t.sharePage.viewProfile(platformName)}
    />
  );
}
