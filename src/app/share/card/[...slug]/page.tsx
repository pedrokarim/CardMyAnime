import { notFound } from "next/navigation";
import { SharedImage } from "@/components/share/SharedImage";
import { CARD_DIMENSIONS, isCardType, isPlatform } from "@/lib/cards/cardTypes";
import {
  buildCardPath,
  buildCardSharePath,
  buildCardSocialImagePath,
  parseCardSlug,
} from "@/lib/cards/cardUrl";
import { lireDictionnaire } from "@/lib/i18n/serveur";
import { PLATFORM_NAMES, platformProfileUrl } from "@/lib/platforms";
import { shareMetadata } from "@/lib/social/shareMetadata";

type Params = { params: Promise<{ slug: string[] }> };

/** Valide l'URL : /share/card/{platform}/{username}/{type}[-nobg]. */
async function readCard({ params }: Params) {
  const { slug } = await params;
  const parsed = parseCardSlug(slug);
  if (!parsed || !isPlatform(parsed.platform) || !isCardType(parsed.type)) {
    return null;
  }
  return { ...parsed, platform: parsed.platform, type: parsed.type };
}

export async function generateMetadata(props: Params) {
  const card = await readCard(props);
  // Ici et non seulement dans la page : une fois le rendu lancé, le statut
  // HTTP est déjà parti en 200.
  if (!card) notFound();
  const t = await lireDictionnaire();
  const title = t.sharePage.cardTitle(t.formats[card.type], card.username);
  const args = [card.platform, card.username, card.type, card.useBackground] as const;

  return shareMetadata({
    title,
    description: t.sharePage.cardDescription(card.username, PLATFORM_NAMES[card.platform]),
    pagePath: buildCardSharePath(...args),
    imagePath: buildCardSocialImagePath(...args),
    imageAlt: title,
  });
}

export default async function SharedCardPage(props: Params) {
  const card = await readCard(props);
  if (!card) notFound();
  const t = await lireDictionnaire();
  const platformName = PLATFORM_NAMES[card.platform];
  const title = t.sharePage.cardTitle(t.formats[card.type], card.username);
  const { width, height } = CARD_DIMENSIONS[card.type];

  return (
    <SharedImage
      title={title}
      description={t.sharePage.cardDescription(card.username, platformName)}
      imageSrc={buildCardPath(card.platform, card.username, card.type, card.useBackground)}
      imageAlt={title}
      width={width}
      height={height}
      note={t.sharePage.updatedNote}
      ctaHref="/"
      ctaLabel={t.sharePage.makeYourCard}
      profileHref={platformProfileUrl(card.platform, card.username)}
      profileLabel={t.sharePage.viewProfile(platformName)}
    />
  );
}
